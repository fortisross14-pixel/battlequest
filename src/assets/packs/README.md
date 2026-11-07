# Pack art

These are the owner's pack illustrations: ivory foil wrappers with a black silhouette, on a transparent background. They are cropped to the wrapper and exported as WebP at 640 px wide (tablet and @2x) and 320 px wide (small cards and phones). The 1024×1536 PNG originals stay with the owner and are not committed.

| File                  | Pack                                     | Silhouette                      |
| --------------------- | ---------------------------------------- | ------------------------------- |
| `pack-recruit-*.webp` | Recruit Pack (troop cards)               | Three spearmen                  |
| `pack-veteran-*.webp` | Veteran Pack (troops, at least one Rare) | A sealed supply sack and scroll |
| `pack-general-*.webp` | General Pack                             | A commander with a baton        |

**The empty circle at the top of each wrapper is the seal slot.** The UI overlays a wax seal there, showing the pack's age emblem or numeral and tinted per pack (for example ivory or bronze for Recruit, red wax for Veteran, gold for General). Approximate position, as fractions of the cropped image:

| Pack    | Centre x | Centre y | Diameter (of width) |
| ------- | -------- | -------- | ------------------- |
| Recruit | 0.50     | 0.22     | 0.31                |
| Veteran | 0.50     | 0.21     | 0.29                |
| General | 0.50     | 0.23     | 0.37                |

Keep these in one config object and fine-tune them visually.
