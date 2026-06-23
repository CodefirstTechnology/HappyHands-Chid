# BabyCare & BabyCare Pro — App Logo & Icon Generation Guide

Use this document with **ChatGPT (DALL·E)**, **Midjourney**, **Ideogram**, **Figma AI**, or **Adobe Firefly** to generate app icons. Both apps share one brand family but must look distinct on the home screen.

---

## Brand system (use in every prompt)

| Token | Hex | Usage |
|-------|-----|--------|
| Primary blue | `#1B6CA8` | Main icon, gradients |
| Secondary teal | `#2CA58D` | Accents, Pro badge |
| Light background | `#E6F4FE` | Android adaptive icon background |
| Splash / deep blue | `#208AEF` | Splash screen backdrop |
| Surface white | `#FFFFFF` | Icon inner shapes |

**Style:** Modern, friendly, trustworthy, Indian family market. Flat or soft 3D. **No text inside the icon** (store rules + small-size readability). Rounded square (squircle) safe area.

**Gradient option:** Blue `#1B6CA8` → teal `#2CA58D` (matches app UI).

---

## Required asset sizes & file paths

Generate at **1024×1024 px** first, then export smaller sizes.

### Shared Expo structure (both apps)

| Asset | Size | Format | Replace this file |
|-------|------|--------|-------------------|
| **Master app icon** | **1024 × 1024** | PNG, no transparency (iOS) | `assets/images/icon.png` |
| **Android adaptive — foreground** | **1024 × 1024** | PNG, transparent BG; keep logo in **center 66%** safe zone | `assets/images/android-icon-foreground.png` |
| **Android adaptive — background** | **1024 × 1024** | PNG or solid `#E6F4FE` | `assets/images/android-icon-background.png` |
| **Android monochrome** (Android 13+) | **1024 × 1024** | PNG, single-color silhouette, transparent BG | `assets/images/android-icon-monochrome.png` |
| **Web favicon** | **48 × 48** (export from 1024) | PNG | `assets/images/favicon.png` |
| **Splash icon** | **200 × 200** (transparent PNG) | Center logo only; splash BG is `#208AEF` in `app.json` | `assets/images/splash-icon.png` |

### App-specific paths

**BabyCare (Parent app)**

```
BabyCare/babycare-app/assets/images/
  icon.png
  android-icon-foreground.png
  android-icon-background.png
  android-icon-monochrome.png
  favicon.png
  splash-icon.png
```

**BabyCare Pro (Nanny app)**

```
BabyCarePro/babycare-pro-app/assets/images/
  icon.png
  android-icon-foreground.png
  android-icon-background.png
  android-icon-monochrome.png
  favicon.png
  splash-icon.png
```

### Store listing extras (optional)

| Platform | Size | Notes |
|----------|------|--------|
| Apple App Store | 1024 × 1024 | Same as `icon.png` |
| Google Play Store | 512 × 512 | Export from master icon |
| Feature graphic (Play) | 1024 × 500 | Marketing banner, may include wordmark |

---

## AI prompts — BabyCare (Parent app)

**App name:** BabyCare  
**Audience:** Parents booking trusted baby nannies at home  
**Icon idea:** Protection + care + home + baby (abstract, not literal photo)

### Prompt 1 — Primary icon (1024×1024)

```
App icon for a mobile app called "BabyCare" — a parent-facing baby nanny booking app for India.
Design a single centered symbol: a soft rounded house silhouette merged with a gentle baby cradle or heart shape, wrapped in a protective arc (suggesting safety and trust).
Color palette: gradient from royal blue #1B6CA8 to teal #2CA58D on a clean white or very light blue #E6F4FE rounded-square background.
Style: modern flat vector, friendly, premium healthcare-meets-consumer app, Material Design 3 / iOS app icon quality.
No text, no letters, no watermark. High contrast, readable at 60px. Soft subtle shadow. Squircle shape.
Square canvas 1024x1024, centered composition with 10% padding safe margin.
```

### Prompt 2 — Android foreground only (transparent background)

```
Same BabyCare parent app icon symbol (house + cradle/heart, protective arc) as a standalone foreground layer only.
Colors: blue #1B6CA8 and teal #2CA58D gradient fill on the symbol.
Transparent background PNG. Symbol occupies only the center 66% safe zone for Android adaptive icons.
Flat vector, no text, 1024x1024.
```

### Prompt 3 — Monochrome (Android themed icon)

```
Single-color silhouette version of the BabyCare parent app icon (house + cradle/heart symbol).
Pure black shape on transparent background. Simple, bold, no fine details. 1024x1024 PNG.
```

### Prompt 4 — Splash logo (200×200, transparent)

```
Minimal version of BabyCare icon mark — house + heart/cradle symbol only, no background square.
White or very light icon on transparent PNG, 200x200, bold simple shapes for splash screen on blue #208AEF.
No text.
```

---

## AI prompts — BabyCare Pro (Nanny app)

**App name:** BabyCare Pro  
**Subtitle:** For Nannies & Caregivers  
**Audience:** Professional nannies managing jobs and earnings  
**Icon idea:** Same family as BabyCare but with a **Pro** cue (badge, star, checkmark, or briefcase element)

### Prompt 1 — Primary icon (1024×1024)

```
App icon for "BabyCare Pro" — nanny and caregiver workforce app, companion to the BabyCare parent app.
Use the same brand DNA as BabyCare (blue #1B6CA8 to teal #2CA58D gradient) but add a clear "Pro" visual cue: a small verified badge, star, or professional checkmark integrated into the design (not the word "Pro" as text).
Center symbol: stylized caring hands holding a baby silhouette OR a nanny figure abstracted as a rounded person icon with a shield/check badge.
Style: modern flat vector, confident and professional, trustworthy for Indian caregivers.
No text, no watermark. Readable at 60px. Squircle app icon, 1024x1024, 10% padding.
Background: white or light blue #E6F4FE.
```

### Prompt 2 — Android foreground (transparent)

```
BabyCare Pro nanny app icon foreground layer: caring hands + baby OR professional caregiver symbol with small verified badge/star.
Blue-teal gradient #1B6CA8 to #2CA58D. Transparent background. Center 66% safe zone. Flat vector, no text, 1024x1024.
```

### Prompt 3 — Monochrome

```
Black silhouette of BabyCare Pro icon (caregiver hands + badge). Transparent background, bold simple shapes, 1024x1024.
```

### Prompt 4 — Splash logo (200×200)

```
Simplified BabyCare Pro mark for splash screen: caregiver/hands symbol with small star or check. White on transparent, 200x200, no text.
```

---

## Making both icons feel related

1. **Same gradient** (`#1B6CA8` → `#2CA58D`) and corner radius on both.  
2. **BabyCare** = home + heart/cradle (parent trust).  
3. **BabyCare Pro** = hands + badge/star (professional caregiver).  
4. Do **not** use identical artwork — users install both apps and must tell them apart instantly.

---

## Post-generation checklist

- [ ] Export **1024×1024** master PNG for each app  
- [ ] Create **foreground** PNG with transparent background (logo in center 66%)  
- [ ] Set **background** to solid `#E6F4FE` or subtle gradient PNG  
- [ ] Export **monochrome** silhouette for Android 13+  
- [ ] Resize **favicon** to 48×48  
- [ ] Export **splash-icon** at 200×200 (transparent, light/white mark)  
- [ ] Copy files into the correct `assets/images/` folder for each app  
- [ ] Run `npx expo start -c` and verify home screen + splash  
- [ ] Build preview: `eas build --platform android --profile preview` (optional)

---

## Quick test command

After replacing icons:

```bash
# Parent app
cd BabyCare/babycare-app
npx expo start -c

# Nanny app
cd BabyCarePro/babycare-pro-app
npx expo start -c
```

---

## Optional: wordmark (not for store icon)

For website, coordinator portal, or Play Store feature graphic only:

```
Horizontal wordmark logo: "BabyCare" in rounded sans-serif, primary blue #1B6CA8 with teal #2CA58D accent dot or heart on the letter i.
Clean white background, marketing banner 1024x500, professional Indian childcare brand.
```

```
Horizontal wordmark: "BabyCare Pro" with small subtitle "For Nannies & Caregivers" below in gray.
Same blue-teal brand colors. 1024x500 banner, no app icon duplication.
```

---

## Selected logos (installed)

These generated assets are mapped to each app:

| App | Symbol | Source design | Meaning |
|-----|--------|---------------|---------|
| **BabyCare** (Parent) | Hexagon + heart + arc | Gradient blue→teal on white circle | Trust, protection, baby care at home |
| **BabyCare Pro** (Nanny) | Person + cradle + star | Gradient blue→teal on white circle | Professional verified nanny / caregiver |

Original sources are archived under:

```
brand-assets/babycare-parent/
brand-assets/babycare-pro/
```

### Re-install icons after replacing source PNGs

```bash
python scripts/install-brand-icons.py
```

This writes all required sizes into:

- `BabyCare/babycare-app/assets/images/` (BabyCare)
- `BabyCarePro/babycare-pro-app/assets/images/` (BabyCare Pro)

Then clear Expo cache: `npx expo start -c`

---

*Last updated for Expo SDK 54 project structure. Icon paths match `app.json` in both mobile apps.*
