"""Blender batch: import every FBX in a pack folder into one scene, resolve materials to
textures (Unity packs ship binary .mat files, so we match by name / palette), and export
ONE kit GLB per pack plus a catalog JSON with each piece's size.

Usage (headless):
  blender -b --python tools/blender_kit_export.py -- <pack_dir> <out.glb> <catalog.json> [pack_label]
"""
import bpy, sys, os, json, re, math
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
pack_dir, out_glb, out_json = argv[0], argv[1], argv[2]
label = argv[3] if len(argv) > 3 else os.path.basename(pack_dir)

def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())

# ---- gather files ---------------------------------------------------------------
fbx_files, textures = [], {}
for root, _, files in os.walk(pack_dir):
    for f in files:
        ext = os.path.splitext(f)[1].lower()
        p = os.path.join(root, f)
        if ext == ".fbx":
            fbx_files.append(p)
        elif ext in (".png", ".jpg", ".jpeg", ".tga"):
            textures[norm(os.path.splitext(f)[0])] = p
fbx_files.sort()
# Material -> texture map recovered from the pack's text .mat files (when they were text).
matmap = {}
mj = os.path.join(pack_dir, "_materials.json")
if os.path.exists(mj):
    for name, info in json.load(open(mj)).items():
        if info.get("texture"):
            tp = os.path.join(pack_dir, info["texture"].replace("/", os.sep))
            if os.path.exists(tp): matmap[norm(name)] = tp
palette = list(textures.values())[0] if len(textures) == 1 else None
if not palette and 1 < len(textures) <= 6:
    hinted = [p for k, p in textures.items() if any(h in k for h in ("palette", "atlas", "texture", "tex", "main", "city", "bg"))]
    pool = hinted or list(textures.values())
    palette = max(pool, key=lambda p: os.path.getsize(p))
# Optional explicit palette via env var PALETTE=<basename without ext>
if os.environ.get("PALETTE"):
    palette = textures.get(norm(os.environ["PALETTE"]), palette)

# ---- reset scene ----------------------------------------------------------------
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def import_fbx(path):
    before = set(bpy.data.objects)
    try:
        bpy.ops.wm.fbx_import(filepath=path)
    except Exception:
        bpy.ops.import_scene.fbx(filepath=path)
    return [o for o in bpy.data.objects if o not in before]

def find_texture_for_material(mat):
    n = norm(mat.name)
    base_n = norm(re.sub(r"\.\d{3}$", "", mat.name))
    if base_n in matmap: return matmap[base_n]
    # exact or prefix/suffix name match
    if n in textures: return textures[n]
    for k, p in textures.items():
        if k and (n.startswith(k) or k.startswith(n)) and abs(len(k) - len(n)) <= 3:
            return p
    return None

images = {}
def get_image(path):
    if path not in images:
        img = bpy.data.images.load(path)
        images[path] = img
    return images[path]

def fix_material(mat, obj_name=""):
    if not mat: return
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
    if not bsdf:
        return
    bsdf.inputs["Roughness"].default_value = 0.85
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.2
    base = bsdf.inputs["Base Color"]
    def valid(img):
        if not img: return False
        try:
            return os.path.exists(bpy.path.abspath(img.filepath)) and img.size[0] > 0
        except Exception:
            return False
    has_tex = any(l.from_node.type == "TEX_IMAGE" and valid(l.from_node.image) for l in base.links)
    if has_tex:
        return
    tex_path = find_texture_for_material(mat)
    if not tex_path and obj_name:
        n = norm(obj_name)
        cands = sorted(k for k in textures if k.startswith(n) and len(k) - len(n) <= 3)
        if cands: tex_path = textures[cands[0]]
    tex_path = tex_path or palette
    if not tex_path:
        return
    img = get_image(tex_path)
    node = nt.nodes.new("ShaderNodeTexImage")
    node.image = img
    node.interpolation = "Closest" if img.size[0] <= 256 else "Linear"
    for l in list(base.links): nt.links.remove(l)
    nt.links.new(node.outputs["Color"], base)

catalog = {"pack": label, "pieces": []}
root_empty_names = set()
for path in fbx_files:
    base = os.path.splitext(os.path.basename(path))[0]
    new = import_fbx(path)
    junk = [o for o in new if o.type in ("CAMERA", "LIGHT", "ARMATURE")]
    new = [o for o in new if o not in junk]
    for o in junk:
        bpy.data.objects.remove(o, do_unlink=True)
    meshes = [o for o in new if o.type == "MESH"]
    if not new:
        continue
    tops = [o for o in new if o.parent is None or o.parent not in new]
    # Wrap multi-object FBX under one empty named after the file; single object keeps file name.
    if len(tops) == 1 and tops[0].type == "MESH":
        tops[0].name = base
        roots = tops
    else:
        emp = bpy.data.objects.new(base, None)
        scene.collection.objects.link(emp)
        for t in tops:
            t.parent = emp
        roots = [emp]
    for o in meshes:
        if not o.material_slots or all(sl.material is None for sl in o.material_slots):
            m = bpy.data.materials.new(name=base + "_mat")
            if o.material_slots: o.material_slots[0].material = m
            else: o.data.materials.append(m)
        for slot in o.material_slots:
            fix_material(slot.material, o.name)
    bpy.context.view_layer.update()
    for r in roots:
        objs = [r] + [c for c in r.children_recursive]
        pts = []
        for o in objs:
            if o.type == "MESH":
                pts += [o.matrix_world @ Vector(c) for c in o.bound_box]
        if not pts:
            continue
        mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
        mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
        tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in objs if o.type == "MESH")
        # glTF is Y-up: Blender (x, y, z) -> glTF (x, z, -y). Report size as width(x), height(y), depth(z).
        catalog["pieces"].append({
            "name": r.name,
            "file": os.path.basename(path),
            "children": [c.name for c in r.children_recursive if c.type == "MESH"][:40],
            "size": [round(mx.x - mn.x, 3), round(mx.z - mn.z, 3), round(mx.y - mn.y, 3)],
            "min": [round(mn.x, 3), round(mn.z, 3), round(-mx.y, 3)],
            "max": [round(mx.x, 3), round(mx.z, 3), round(-mn.y, 3)],
            "tris": tris,
            "materials": sorted({s.material.name for o in objs if o.type == "MESH" for s in o.material_slots if s.material}),
        })

# ---- export -----------------------------------------------------------------------
os.makedirs(os.path.dirname(out_glb), exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=out_glb, export_format="GLB", export_yup=True,
    export_apply=True, export_texcoords=True, export_normals=True,
    export_materials="EXPORT", export_image_format="AUTO",
    export_cameras=False, export_lights=False, export_animations=False,
    export_skins=False, export_extras=False,
)
json.dump(catalog, open(out_json, "w"), indent=1)
print(f"KIT {label}: {len(catalog['pieces'])} pieces -> {out_glb} ({os.path.getsize(out_glb)/1e6:.1f} MB)")
