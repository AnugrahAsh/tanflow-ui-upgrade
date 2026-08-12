# Login background assets

Served from `/assets/bg/…` (Vite copies `public/` verbatim).

| File | Used by | What it is |
|---|---|---|
| `aurora-pleats.svg` | `views/Login2.jsx` | Deep-blue pleated "curtain" field with a cyan glow low-centre |
| `wave-lines.svg` | spare | Flowing banded waves, navy → cyan toward the lower right |

## Swapping in the original bitmaps

Both SVGs are **generated stand-ins** authored to match the supplied reference
images. To use the originals instead, drop them here and change one line:

```
public/assets/bg/aurora-pleats.jpg     <- reference image 1
public/assets/bg/wave-lines.jpg        <- reference image 2
```

Then in `src/views/Login2.jsx` change:

```js
const BG = '/assets/bg/aurora-pleats.svg'
// to
const BG = '/assets/bg/aurora-pleats.jpg'
```

Nothing else needs to change — the panel already uses `background-size: cover`
with a centre-right focal point, so a tall bitmap crops the same way the SVG
does.

`views/Login6.jsx` does not use these files: it rebuilds the same look as an
animated three.js surface (geometry for the pleats, a moving light for the glow).
