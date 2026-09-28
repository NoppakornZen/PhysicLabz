# Physics PlayLab — Image Generation Guide

## Style DNA (ใส่ทุกครั้ง ห้ามตัดออก)

```
2D cartoon illustration, flat design, vibrant tropical island, 
soft cel-shading, clean outlines, Nunito rounded style
```

## Color Palette

| Role | Hex | ใช้กับ |
|------|-----|--------|
| Ocean deep | `#0d4f6b` | น้ำ, เงา |
| Ocean mid | `#1a7fa0` | น้ำ, sky |
| Sky blue | `#87ceeb` | background sky |
| Island green | `#4caf50` | เกาะ, ต้นไม้ |
| Sand | `#e8c97a` | หาด, ทราย |
| Teal accent | `#26a69a` | mascot, UI |

---

## Templates ตามประเภทรูป

### 1. Background (lobby / หน้าแผนที่)
```
tropical ocean world map background, [hex sky: #87ceeb to #b8e8f8 gradient],
calm turquoise sea, small islands in distance, fluffy white clouds,
2D cartoon illustration, flat design, soft cel-shading, no text, no UI,
wide aspect 16:9
```
> ประหยัดเครดิต: อย่าใส่ details ของเกาะมากเกิน — พื้นน้ำ + ฟ้า + เมฆก็พอ

---

### 2. Island (เกาะแต่ละด่าน)
```
[ชื่อเกาะ] small floating island, lush tropical trees, sandy beach,
warm sunlight from top-right, slight drop shadow below,
2D cartoon flat illustration, transparent background PNG,
square 1:1, centered composition, no text
```
ตัวอย่าง:
```
"horizontal motion island" → add: rolling hills, smooth flat terrain
"projectile motion island" → add: cannon on cliff, arc trajectory trail
"Newton law island"        → add: ancient stone pillars, apple tree
```

---

### 3. Mascot Pose (Nuto — ตัว mascot)
```
cute round teal alien mascot, big round glasses, short stubby limbs,
cream-colored body, friendly expression, [POSE],
2D cartoon flat style, thick clean outlines, transparent background PNG,
centered, no background, no text
```
**[POSE] options:**
- `standing front-facing, waving` (front.png)
- `reading a book` (read.png)
- `thinking with hand on chin` (think.png)
- `running sideways` (left.png / right.png)
- `lying on stomach with beakers` (lab_horizontal.png)

> ประหยัดเครดิต: lock ขนาด 512×512 หรือ 256×256 เพียงพอสำหรับ sprite

---

### 4. Lab Background (SVG style)
```
[ฟิสิกส์หัวข้อ] science experiment scene, dark navy background #1a2a3a,
glowing cyan grid lines, [object specific to topic], 
flat 2D vector illustration, minimalist, no text, 16:9
```
**Topic-specific objects:**
- Horizontal motion → rolling ball on track, velocity arrows
- Vertical motion → bouncing ball, height markers
- Projectile → curved trajectory arc, cannon
- Newton 1 → floating objects in space, no force
- Newton 2 → force arrow pushing block, mass label
- Newton 3 → two objects colliding, equal-opposite arrows

---

## Negative Prompt (ใส่ทุกครั้ง)

```
realistic, photographic, 3D render, blurry, noisy, text overlay, 
watermark, signature, UI elements, complex background, 
gradients that clash, neon cyberpunk, horror, violence
```

---

## Size Cheatsheet (เพื่อไม่กิน credit เกิน)

| ประเภท | ขนาดแนะนำ | หมายเหตุ |
|--------|-----------|----------|
| Background lobby | 1344×768 | 16:9 minimum |
| Island button | 400×400 | display ที่ 195×195 |
| Mascot pose | 512×512 | display ที่ 80–120px |
| Lab background | 1344×768 | SVG ดีกว่า PNG |
| Mascot scroll frame | 256×256 | animation frames |

---

## Quick Copy — Prompt สำเร็จรูป

**เกาะใหม่:**
```
small floating tropical island, lush green palm trees, sandy shore,
warm golden light, soft shadow below island, 2D cartoon flat illustration,
clean outlines, transparent background, square 1:1, no text, no UI
```

**Background lobby ใหม่:**
```
peaceful tropical ocean scene, sky gradient #87ceeb to #b8e8f8,
calm sea #1a7fa0, two small islands in mid-distance, white fluffy clouds,
2D cartoon flat style, soft cel-shading, no characters, no text, 16:9
```

**Mascot pose ใหม่:**
```
cute round teal alien mascot, big round glasses, cream body, stubby arms,
[ใส่ pose], happy friendly, 2D flat cartoon, thick outline, 
transparent PNG, centered, 512×512
```

---

## Tips ลด Credit

- ใช้ **512px แทน 1024px** สำหรับ sprite/icon — ตาเห็นต่างกันน้อยมาก
- **อย่าใส่ lighting complexity** (volumetric, ray tracing, subsurface) — เปลืองมาก ไม่เหมาะ 2D
- **Batch prompt** — ถ้า Gen หลาย pose ให้ใช้ prompt เดิม เปลี่ยนแค่ [POSE]
- **SVG แทน PNG** สำหรับ lab background — ไฟล์เล็ก scale ได้อิสระ
- Lock style ด้วย: `2D cartoon flat illustration, clean outlines` ทุกครั้ง — ไม่ต้อง describe style ยาว
