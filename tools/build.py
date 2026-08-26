#!/usr/bin/env python3
"""Genera la versión offline del juego.

Salidas:
  1. assets-embedded.js  -> los sprites de assets/sprites/ como data: URIs
                            (window.EMBEDDED_ASSETS), para quien cargue src/index.html.
  2. index.html          -> src/index.html con esos data: URIs INCRUSTADOS dentro del
                            propio archivo. Es la página autocontenida: se abre con doble
                            clic (file://), sin servidor web y sin internet, y las imágenes
                            cargan igual.
  3. sw-manifest.js      -> lista de archivos que el service worker deja en la Cache
                            Storage cuando el juego se sirve por http(s).

Uso:  python3 tools/build.py     (o `npm run build`)
"""

from __future__ import annotations

import base64
import hashlib
import json
import mimetypes
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPRITE_DIR = ROOT / "assets" / "sprites"
TEMPLATE = ROOT / "src" / "index.html"
SW_REGISTER = ROOT / "src" / "sw-register.js"
OUT_HTML = ROOT / "index.html"
OUT_JS = ROOT / "assets-embedded.js"
OUT_SW_MANIFEST = ROOT / "sw-manifest.js"

ASSETS_MARKER = "<!--ASSETS_EMBEDDED-->"
SW_MARKER = "<!--SW_REGISTER-->"

# Lo que el service worker debe dejar en caché la primera vez que se abre el juego.
PRECACHE_URLS = [
    "./",
    "index.html",
    "assets-embedded.js",
    "manifest.webmanifest",
    "icons/icon-192.png",
    "icons/icon-512.png",
]


def banner(*lines: str) -> str:
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%SZ")
    head = "// AUTOGENERADO por tools/build.py — NO EDITAR A MANO.\n"
    head += f"// Generado: {stamp}\n"
    return head + "".join(f"// {line}\n" for line in lines)


def data_uri(path: Path) -> tuple[str, str, int]:
    raw = path.read_bytes()
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    encoded = base64.b64encode(raw).decode("ascii")
    return f"data:{mime};base64,{encoded}", hashlib.sha256(raw).hexdigest()[:12], len(raw)


def main() -> int:
    sheets = sorted(SPRITE_DIR.glob("*.webp"))
    if not sheets:
        raise SystemExit(f"No hay sprites en {SPRITE_DIR}")

    entries: dict[str, dict[str, object]] = {}
    total_raw = total_b64 = 0
    for sheet in sheets:
        uri, digest, size = data_uri(sheet)
        total_raw += size
        total_b64 += len(uri)
        entries[sheet.name] = {
            "mime": uri[len("data:"):].split(";")[0],
            "bytes": size,
            "sha256_12": digest,
            "dataUri": uri,
        }
        print(f"  embebido {sheet.name:<22} {size / 1024:7.1f} KB  (sha256:{digest})")

    payload = json.dumps(
        {"root": "assets/sprites/", "sheets": entries},
        separators=(",", ":"),
        ensure_ascii=False,
    )
    js_body = "window.EMBEDDED_ASSETS = " + payload + ";\n"
    note = "Los sprites van dentro del JS como data: URIs para que el juego cargue"
    OUT_JS.write_text(banner(note, "completamente offline.") + js_body, encoding="utf-8")

    # index.html autocontenido: mismo JS, pero incrustado en un <script>.
    template = TEMPLATE.read_text(encoding="utf-8")
    if ASSETS_MARKER not in template or SW_MARKER not in template:
        raise SystemExit(f"Faltan los marcadores {ASSETS_MARKER} / {SW_MARKER} en {TEMPLATE}")
    html = template.replace(
        ASSETS_MARKER,
        "    <script>\n"
        + "".join("        " + line + "\n" for line in js_body.rstrip("\n").splitlines())
        + "    </script>",
    ).replace(
        SW_MARKER,
        "    <script>\n"
        + "".join(
            "        " + line + "\n"
            for line in SW_REGISTER.read_text(encoding="utf-8").rstrip("\n").splitlines()
        )
        + "    </script>",
    )
    OUT_HTML.write_text(html, encoding="utf-8")

    urls = PRECACHE_URLS + [f"assets/sprites/{sheet.name}" for sheet in sheets]
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    OUT_SW_MANIFEST.write_text(
        banner("Lista de archivos que sw.js deja en la Cache Storage.")
        + "self.__PRECACHE_URLS__ = "
        + json.dumps(urls, indent=2)
        + ";\n"
        + f"self.__PRECACHE_NAME__ = 'idle-shinobi-v{stamp}';\n",
        encoding="utf-8",
    )

    print(
        f"\n  {len(sheets)} sprites: {total_raw / 1024:.1f} KB binario "
        f"-> {total_b64 / 1024:.1f} KB base64"
    )
    print(f"  {OUT_JS.name}: {OUT_JS.stat().st_size / 1024:.1f} KB")
    print(f"  {OUT_HTML.name}: {OUT_HTML.stat().st_size / 1024:.1f} KB (autocontenido)")
    print(f"  {OUT_SW_MANIFEST.name}: {len(urls)} urls en precaché")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
