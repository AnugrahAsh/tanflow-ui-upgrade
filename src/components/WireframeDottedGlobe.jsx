import { useEffect, useRef, useState } from 'react'
import { geoOrthographic, geoPath, geoGraticule, geoBounds } from 'd3-geo'
import { timer } from 'd3-timer'

/* Rotating wireframe globe with halftone land dots, drawn on a canvas.
   Ported to this codebase's stack: plain JSX, no Tailwind, no shadcn — colours
   come through props so it can sit on any surface.

   If the land GeoJSON can't be fetched (offline, blocked), the sphere and
   graticule still render and rotate: the host page must never depend on it. */

const LAND_URL = 'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/physical/ne_110m_land.json'

// Ray-casting point-in-polygon, used to fill land shapes with dots.
function pointInPolygon([x, y], polygon) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function pointInFeature(point, feature) {
  const g = feature.geometry
  if (g.type === 'Polygon') {
    if (!pointInPolygon(point, g.coordinates[0])) return false
    for (let i = 1; i < g.coordinates.length; i++) if (pointInPolygon(point, g.coordinates[i])) return false
    return true
  }
  if (g.type === 'MultiPolygon') {
    for (const poly of g.coordinates) {
      if (pointInPolygon(point, poly[0])) {
        let inHole = false
        for (let i = 1; i < poly.length; i++) if (pointInPolygon(point, poly[i])) { inHole = true; break }
        if (!inHole) return true
      }
    }
  }
  return false
}

function dotsForFeature(feature, spacing) {
  const dots = []
  const [[minLng, minLat], [maxLng, maxLat]] = geoBounds(feature)
  const step = spacing * 0.08
  for (let lng = minLng; lng <= maxLng; lng += step) {
    for (let lat = minLat; lat <= maxLat; lat += step) {
      if (pointInFeature([lng, lat], feature)) dots.push([lng, lat])
    }
  }
  return dots
}

export default function WireframeDottedGlobe({
  size = 520,
  className,
  style,
  speed = 0.18,
  interactive = false,
  dotSpacing = 16,
  markers = [],          // [[lng, lat], …] — glowing site markers
  colors = {},
}) {
  const canvasRef = useRef(null)
  const [failed, setFailed] = useState(false)
  const c = {
    ocean: 'transparent',
    sphere: 'rgba(255,255,255,.32)',
    graticule: 'rgba(255,255,255,.16)',
    land: 'rgba(255,255,255,.42)',
    dot: 'rgba(160,190,240,.55)',
    marker: '#5FD8FF',
    ...colors,
  }
  const markersKey = JSON.stringify(markers)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const radius = size / 2 - 2
    const projection = geoOrthographic().scale(radius).translate([size / 2, size / 2]).clipAngle(90)
    const path = geoPath().projection(projection).context(ctx)
    const graticule = geoGraticule()

    let land = null
    let dots = []
    let cancelled = false
    const rotation = [0, -12]

    const render = () => {
      ctx.clearRect(0, 0, size, size)
      const scale = projection.scale()

      // sphere
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, scale, 0, 2 * Math.PI)
      if (c.ocean !== 'transparent') { ctx.fillStyle = c.ocean; ctx.fill() }
      ctx.strokeStyle = c.sphere
      ctx.lineWidth = 1.4
      ctx.stroke()

      // graticule
      ctx.beginPath()
      path(graticule())
      ctx.strokeStyle = c.graticule
      ctx.lineWidth = 0.7
      ctx.stroke()

      if (!land) return

      // land outlines
      ctx.beginPath()
      land.features.forEach((f) => path(f))
      ctx.strokeStyle = c.land
      ctx.lineWidth = 0.8
      ctx.stroke()

      // halftone dots
      ctx.fillStyle = c.dot
      dots.forEach(([lng, lat]) => {
        const p = projection([lng, lat])
        if (p && p[0] >= 0 && p[0] <= size && p[1] >= 0 && p[1] <= size) {
          ctx.beginPath()
          ctx.arc(p[0], p[1], 1.1, 0, 2 * Math.PI)
          ctx.fill()
        }
      })

      // site markers — a soft halo with a bright core
      markers.forEach(([lng, lat]) => {
        const p = projection([lng, lat])
        if (!p) return
        const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 9)
        g.addColorStop(0, c.marker)
        g.addColorStop(0.28, c.marker)
        g.addColorStop(1, 'rgba(95,216,255,0)')
        ctx.globalAlpha = 0.55
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0, 2 * Math.PI); ctx.fill()
        ctx.globalAlpha = 1
        ctx.fillStyle = '#DFF7FF'
        ctx.beginPath(); ctx.arc(p[0], p[1], 1.7, 0, 2 * Math.PI); ctx.fill()
      })
    }

    projection.rotate(rotation)
    render()

    // Land data is optional decoration — a failure must not surface to the user.
    fetch(LAND_URL)
      .then((r) => { if (!r.ok) throw new Error('land fetch failed'); return r.json() })
      .then((json) => {
        if (cancelled) return
        land = json
        dots = json.features.flatMap((f) => dotsForFeature(f, dotSpacing))
        render()
      })
      .catch(() => { if (!cancelled) setFailed(true) })

    const spin = timer(() => {
      rotation[0] += speed
      projection.rotate(rotation)
      render()
    })

    // Optional drag-to-rotate / scroll-to-zoom (off by default for backdrops).
    let detach = () => {}
    if (interactive) {
      const onDown = (e) => {
        spin.stop()
        const sx = e.clientX, sy = e.clientY
        const start = [...rotation]
        const move = (ev) => {
          rotation[0] = start[0] + (ev.clientX - sx) * 0.5
          rotation[1] = Math.max(-90, Math.min(90, start[1] - (ev.clientY - sy) * 0.5))
          projection.rotate(rotation)
          render()
        }
        const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); spin.restart(() => { rotation[0] += speed; projection.rotate(rotation); render() }) }
        window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
      }
      const onWheel = (e) => {
        e.preventDefault()
        const f = e.deltaY > 0 ? 0.9 : 1.1
        projection.scale(Math.max(radius * 0.5, Math.min(radius * 3, projection.scale() * f)))
        render()
      }
      canvas.addEventListener('mousedown', onDown)
      canvas.addEventListener('wheel', onWheel, { passive: false })
      detach = () => { canvas.removeEventListener('mousedown', onDown); canvas.removeEventListener('wheel', onWheel) }
    }

    return () => { cancelled = true; spin.stop(); detach() }
  }, [size, speed, interactive, dotSpacing, markersKey, c.ocean, c.sphere, c.graticule, c.land, c.dot, c.marker]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      title={failed ? undefined : 'Global identity fabric'}
      style={{ display: 'block', pointerEvents: interactive ? 'auto' : 'none', ...style }}
    />
  )
}
