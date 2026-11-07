# Age emblems

The owner's age icons: a white emblem on a black seal disc, with a transparent background. Each is cropped to its disc so they all display at the same size. Lossless WebP.

| File                                | Age                         | Emblem                    | Source size |
| ----------------------------------- | --------------------------- | ------------------------- | ----------- |
| `age-00-dawn-of-war.webp`           | 0 Dawn of War               | Four-spoked chariot wheel | 154 px      |
| `age-01-antiquity.webp`             | 1 Antiquity                 | Laurel wreath             | 168 px      |
| `age-02-classical-empires.webp`     | 2 Classical Empires         | Eagle                     | 114 px      |
| `age-03-early-middle-ages.webp`     | 3 Early Middle Ages         | Round shield with a cross | 177 px      |
| `age-04-high-late-middle-ages.webp` | 4 High and Late Middle Ages | Castle                    | 119 px      |

**Where they're used:**

- **Timeline:** the age medallion.
- **Age map:** the header.
- **Pack art:** the seal over the empty circle on each pack (`src/assets/packs/README.md`), showing which age's ladder the pack draws from.
- **Shop:** the age tabs.
- **Army screen:** the age filter chips.
- **Briefing:** a small mark next to the battle name.

**Sizes:** the 114–119 px emblems stay sharp up to about 56 CSS px on 2× screens, and the others up to about 80 CSS px. For larger uses (the timeline zoom, the pack seal at 640 px), ask the owner for 512 px versions. Until then, cap the display size, or accept slight softness.

**Ages 5–9 don't have emblems yet.** Fall back to a plain black seal with the age numeral in white serif type.
