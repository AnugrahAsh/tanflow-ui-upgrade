// Deterministic pseudo-random series helpers.
// Ported verbatim from the original Tanflow prototype so every chart and
// dataset renders identically across reloads (no Math.random()).

export function seededRand(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export const pick = (a, r) => a[Math.floor(r() * a.length)]

// Smooth-ish wave with an optional single spike — used for sparklines & areas.
export function wave(n, base, amp, seed = 1, spike = -1, spikeV = 0) {
  const r = seededRand(seed)
  const out = []
  for (let i = 0; i < n; i++) {
    let v = base + Math.sin((i / n) * Math.PI * 2.2 + seed) * amp * 0.5 + r() * amp * 0.5
    if (i === spike) v += spikeV
    out.push(Math.round(Math.max(0, v)))
  }
  return out
}

export const HOURS = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22']
export const H24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + ':00')
