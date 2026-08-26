#!/usr/bin/env python3
"""Genera los iconos PNG del manifiesto (sin dependencias externas).

Dibuja un shuriken de 4 puntas sobre fondo oscuro y escribe icons/icon-512.png
e icons/icon-192.png. Uso: python3 tools/make-icons.py  (o `npm run icons`).
"""

from __future__ import annotations

import math
import struct
import zlib
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent.parent / "icons"
SIZE = 512
BG = (17, 17, 17, 255)
BLADE = (226, 232, 240, 255)
ACCENT = (220, 38, 38, 255)


def draw(size: int) -> bytes:
    pixels = bytearray()
    center = size / 2
    outer = size * 0.44          # punta de la cuchilla
    inner = size * 0.13          # radio del núcleo
    hole = size * 0.075          # agujero central
    tip_half_width = math.radians(21)

    for y in range(size):
        for x in range(size):
            dx = x + 0.5 - center
            dy = y + 0.5 - center
            distance = math.hypot(dx, dy)
            angle = math.atan2(dy, dx) % (math.tau / 4)   # simetría de 4 puntas
            angle -= math.tau / 8                          # alinea las puntas a 45°
            half_width = tip_half_width * (1 - distance / outer)
            pixels += bytes(BLADE if (distance <= outer and angle <= half_width) else BG)

    # Núcleo rojo y agujero central.
    for y in range(size):
        for x in range(size):
            dx = x + 0.5 - center
            dy = y + 0.5 - center
            distance = math.hypot(dx, dy)
            offset = (y * size + x) * 4
            if distance <= inner:
                color = BG if distance <= hole else ACCENT
                pixels[offset:offset + 4] = bytes(color)
    return bytes(pixels)


def resample(src: bytes, src_size: int, dst_size: int) -> bytes:
    if dst_size == src_size:
        return src
    out = bytearray()
    for y in range(dst_size):
        sy = min(src_size - 1, int(y * src_size / dst_size))
        for x in range(dst_size):
            sx = min(src_size - 1, int(x * src_size / dst_size))
            offset = (sy * src_size + sx) * 4
            out += src[offset:offset + 4]
    return bytes(out)


def write_png(path: Path, size: int, pixels: bytes) -> None:
    stride = size * 4

    def chunk(tag: bytes, payload: bytes) -> bytes:
        return (
            struct.pack(">I", len(payload))
            + tag
            + payload
            + struct.pack(">I", zlib.crc32(tag + payload) & 0xFFFFFFFF)
        )

    raw = b"".join(b"\x00" + pixels[y * stride:(y + 1) * stride] for y in range(size))
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    base = draw(SIZE)
    for size in (512, 192):
        target = OUT_DIR / f"icon-{size}.png"
        write_png(target, size, resample(base, SIZE, size))
        print(f"  {target.relative_to(OUT_DIR.parent)} ({target.stat().st_size / 1024:.1f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
