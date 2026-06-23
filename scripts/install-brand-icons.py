"""
Install BabyCare & BabyCare Pro logos into Expo asset folders.

Fixes:
- Scales small source marks up to Android/iOS safe zone (~66% of 1024)
- Uses gradient logo on #E6F4FE (not white-circle-on-light-blue)
- Exports 1024 monochrome, proper splash, favicon, logo-glow

Run: python scripts/install-brand-icons.py
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "brand-assets"

CANVAS = 1024
SAFE_RATIO = 0.62  # Android adaptive icon safe zone
LIGHT_BG = (230, 244, 254)  # #E6F4FE
SPLASH_BG = (32, 138, 239)  # #208AEF


def brand_path(folder: str, filename: str) -> Path:
    return BRAND / folder / filename


def remove_near_black(img: Image.Image, threshold: int = 40) -> Image.Image:
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if r <= threshold and g <= threshold and b <= threshold:
                px[x, y] = (0, 0, 0, 0)
    return img


def extract_mark(img: Image.Image) -> Image.Image:
    """Crop to non-transparent content after removing dark backdrop."""
    cleaned = remove_near_black(img)
    bbox = cleaned.getbbox()
    if not bbox:
        raise ValueError("Logo mark not found — source image may be empty")
    return cleaned.crop(bbox)


def scale_to_safe_zone(mark: Image.Image, canvas: int = CANVAS) -> Image.Image:
    """Center mark on transparent canvas, scaled to adaptive-icon safe zone."""
    target = int(canvas * SAFE_RATIO)
    w, h = mark.size
    scale = min(target / w, target / h)
    new_w = max(1, int(w * scale))
    new_h = max(1, int(h * scale))
    scaled = mark.resize((new_w, new_h), Image.Resampling.LANCZOS)

    out = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    x = (canvas - new_w) // 2
    y = (canvas - new_h) // 2
    out.paste(scaled, (x, y), scaled)
    return out


def treat_white_as_transparent(img: Image.Image, threshold: int = 235) -> Image.Image:
    """Heart cutouts exported as white fill -> true transparency."""
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 0 and r >= threshold and g >= threshold and b >= threshold:
                px[x, y] = (0, 0, 0, 0)
    return img


def flatten_on_bg(rgba: Image.Image, rgb: tuple[int, int, int]) -> Image.Image:
    rgba = treat_white_as_transparent(rgba)
    base = Image.new("RGBA", rgba.size, (*rgb, 255))
    return Image.alpha_composite(base, rgba)


def to_monochrome(rgba: Image.Image) -> Image.Image:
    """Colored foreground -> black silhouette on transparent."""
    rgba = rgba.convert("RGBA")
    out = Image.new("RGBA", rgba.size, (0, 0, 0, 0))
    src = rgba.load()
    dst = out.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            if src[x, y][3] > 32:
                dst[x, y] = (0, 0, 0, 255)
    return out


def to_white_splash(rgba: Image.Image) -> Image.Image:
    """Colored foreground -> white mark on transparent (for blue splash)."""
    rgba = rgba.convert("RGBA")
    out = Image.new("RGBA", rgba.size, (0, 0, 0, 0))
    src = rgba.load()
    dst = out.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            if src[x, y][3] > 32:
                dst[x, y] = (255, 255, 255, 255)
    return out


def save_rgb(path: Path, img: Image.Image) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(path, "PNG")


def save_rgba(path: Path, img: Image.Image) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGBA").save(path, "PNG")


def process_app(
    *,
    label: str,
    color_on_dark: Path,
    mono_white_on_dark: Path | None,
    out_dir: Path,
) -> None:
    print(f"\n>> {label} -> {out_dir.relative_to(ROOT)}")

    if not color_on_dark.exists():
        raise FileNotFoundError(color_on_dark)

    raw = Image.open(color_on_dark).convert("RGBA")
    mark = extract_mark(raw)
    foreground = treat_white_as_transparent(scale_to_safe_zone(mark))

    # Master icon — gradient mark on brand light blue (no white circle)
    icon = flatten_on_bg(foreground, LIGHT_BG)
    save_rgb(out_dir / "icon.png", icon)

    # Android adaptive foreground (transparent outside safe zone)
    save_rgba(out_dir / "android-icon-foreground.png", foreground)

    # Solid background layer (optional; app.json also sets backgroundColor)
    save_rgb(out_dir / "android-icon-background.png", Image.new("RGB", (CANVAS, CANVAS), LIGHT_BG))

    # Monochrome — prefer dedicated white-on-dark source, else derive from foreground
    if mono_white_on_dark and mono_white_on_dark.exists():
        mono_src = Image.open(mono_white_on_dark).convert("RGBA")
        mono_mark = Image.new("RGBA", mono_src.size, (0, 0, 0, 0))
        sp, dp = mono_src.load(), mono_mark.load()
        sw, sh = mono_src.size
        for y in range(sh):
            for x in range(sw):
                r, g, b, a = sp[x, y]
                if a > 0 and r > 160 and g > 160 and b > 160:
                    dp[x, y] = (0, 0, 0, 255)
        bbox = mono_mark.getbbox()
        if bbox:
            cropped = mono_mark.crop(bbox)
            mono = scale_to_safe_zone(cropped)
        else:
            mono = to_monochrome(foreground)
    else:
        mono = to_monochrome(foreground)
    save_rgba(out_dir / "android-icon-monochrome.png", mono)

    # Splash — white mark on transparent
    splash_src = to_white_splash(foreground)
    splash = splash_src.resize((200, 200), Image.Resampling.LANCZOS)
    save_rgba(out_dir / "splash-icon.png", splash)

    # Full splash preview (optional local check)
    splash_full = flatten_on_bg(
        splash_src.resize((280, 280), Image.Resampling.LANCZOS),
        SPLASH_BG,
    )
    save_rgb(out_dir / "splash-preview.png", splash_full)

    # Favicon + in-app glow
    save_rgb(out_dir / "favicon.png", icon.resize((48, 48), Image.Resampling.LANCZOS))
    save_rgba(out_dir / "logo-glow.png", foreground)

    print("   OK icon, android layers, splash, favicon, logo-glow")


def main() -> None:
    parent_files = list((BRAND / "babycare-parent").glob("*.png"))
    pro_files = list((BRAND / "babycare-pro").glob("*.png"))

    def pick(files: list[Path], token: str) -> Path:
        matches = [f for f in files if token in f.name]
        if not matches:
            raise FileNotFoundError(f"No brand file matching '{token}' in {files}")
        return matches[0]

    parent_out = ROOT / "House Owner App" / "house-owner-app" / "assets" / "images"
    nanny_out = ROOT / "Servant" / "servant-app" / "assets" / "images"

    process_app(
        label="BabyCare (Parent)",
        color_on_dark=pick(parent_files, "cf152808"),
        mono_white_on_dark=pick(parent_files, "1323f305"),
        out_dir=parent_out,
    )

    process_app(
        label="BabyCare Pro (Nanny)",
        color_on_dark=pick(pro_files, "4f535c09"),
        mono_white_on_dark=pick(pro_files, "7bf4ef90"),
        out_dir=nanny_out,
    )

    print("\nDone. Restart Expo: npx expo start -c")


if __name__ == "__main__":
    main()
