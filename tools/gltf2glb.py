"""Convert glTF files with a single base64-embedded buffer into binary GLB.
Usage: python -I tools/gltf2glb.py <out_dir> <manifest_json> <group> <file.gltf>...
No third-party dependencies. Also appends character info to a manifest.
"""
import json, sys, base64, struct, os

def tri_count(g):
    n = 0
    for m in g.get("meshes", []):
        for p in m.get("primitives", []):
            if "indices" in p:
                n += g["accessors"][p["indices"]]["count"] // 3
            else:
                n += g["accessors"][p["attributes"]["POSITION"]]["count"] // 3
    return n

# Source-pack typos / inconsistencies, fixed so every character exposes the same
# four slot names: <Outfit>_Head, <Outfit>_Body, <Outfit>_Legs, <Outfit>_Feet.
RENAMES = {
    "Formad_Head": "Formal_Head",   # women/Formal
    "Farmer_Pants": "Farmer_Legs",  # men/Farmer
}

def normalize_names(g):
    for n in g.get("nodes", []):
        if n.get("name") in RENAMES:
            n["name"] = RENAMES[n["name"]]

def convert(src, dst):
    g = json.load(open(src, encoding="utf-8"))
    normalize_names(g)
    assert len(g["buffers"]) == 1, "expected one buffer"
    uri = g["buffers"][0]["uri"]
    assert uri.startswith("data:"), "expected embedded buffer"
    bin_data = base64.b64decode(uri.split(",", 1)[1])
    del g["buffers"][0]["uri"]
    g["buffers"][0]["byteLength"] = len(bin_data)
    # pad
    bin_pad = (4 - len(bin_data) % 4) % 4
    bin_chunk = bin_data + b"\x00" * bin_pad
    js = json.dumps(g, separators=(",", ":")).encode("utf-8")
    js_pad = (4 - len(js) % 4) % 4
    js_chunk = js + b" " * js_pad
    total = 12 + 8 + len(js_chunk) + 8 + len(bin_chunk)
    with open(dst, "wb") as f:
        f.write(struct.pack("<III", 0x46546C67, 2, total))
        f.write(struct.pack("<II", len(js_chunk), 0x4E4F534A)); f.write(js_chunk)
        f.write(struct.pack("<II", len(bin_chunk), 0x004E4942)); f.write(bin_chunk)
    return g

out_dir, manifest_path, group = sys.argv[1], sys.argv[2], sys.argv[3]
manifest = json.load(open(manifest_path)) if os.path.exists(manifest_path) else {"characters": [], "animationPacks": []}
manifest["characters"] = [c for c in manifest["characters"] if c["group"] != group]
for src in sys.argv[4:]:
    name = os.path.splitext(os.path.basename(src))[0]
    dst = os.path.join(out_dir, group, name + ".glb")
    g = convert(src, dst)
    info = {
        "id": f"{group}/{name}", "name": name, "group": group,
        "file": f"assets/characters/{group}/{name}.glb",
        "tris": tri_count(g),
        "bones": len(g["skins"][0]["joints"]),
        "materials": [m.get("name") for m in g.get("materials", [])],
        "animations": [a.get("name") for a in g.get("animations", [])],
        "meshNodes": [n["name"] for n in g["nodes"] if "mesh" in n],
    }
    manifest["characters"].append(info)
    print(f"{info['id']:22s} {os.path.getsize(dst)/1e6:5.2f} MB  {info['tris']:6d} tris  nodes={info['meshNodes']}")
manifest["characters"].sort(key=lambda c: (c["group"], c["name"]))
json.dump(manifest, open(manifest_path, "w"), indent=2)
