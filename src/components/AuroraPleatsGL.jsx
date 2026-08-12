import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/* Animated three.js rebuild of the pleated aurora artwork.
   The look is reproduced structurally rather than as a texture:
     · pleats  → vertex displacement (vertical folds + a slow drape and sway)
     · glow    → a moving point light low-centre, matching the reference
     · palette → deep navy in the troughs, strong blue mid, cyan-white on the
                 fold crests where the light catches them
   Lighting is evaluated per-fragment (diffuse + specular sheen + rim), so the
   highlights travel across the folds the way they do in the still. */

const VERT = /* glsl */`
  uniform float uTime;
  varying vec3 vPos;
  varying vec3 vNrm;
  varying vec2 vUv;

  // Height field: tight vertical pleats, warped by a slow drape and sway so the
  // folds curve like hanging fabric instead of reading as straight ribs.
  float pleat(vec2 p, float t) {
    float warp  = sin(p.y * 0.42 + t * 0.13) * 1.15;
    float folds = sin(p.x * 5.2 + warp);
    folds = sign(folds) * pow(abs(folds), 0.72);      // crisper creases
    float drape = sin(p.y * 0.72 + t * 0.19) * 0.55;
    float sway  = sin(p.x * 1.05 - t * 0.15) * 0.42;
    float swell = cos(p.x * 0.33 + p.y * 0.25 - t * 0.09) * 0.5;
    return folds * 0.5 + drape + sway + swell;
  }

  void main() {
    vUv = uv;
    vec3 p = position;
    float h = pleat(p.xy, uTime);
    p.z += h;

    // Normals by finite difference so lighting follows the folds exactly.
    float e = 0.06;
    float hx = pleat(position.xy + vec2(e, 0.0), uTime);
    float hy = pleat(position.xy + vec2(0.0, e), uTime);
    vec3 tx = normalize(vec3(e, 0.0, hx - h));
    vec3 ty = normalize(vec3(0.0, e, hy - h));
    vNrm = normalize(cross(tx, ty));

    vec4 world = modelMatrix * vec4(p, 1.0);
    vPos = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const FRAG = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform vec3  uLight;      // travelling cyan core
  uniform vec3  uDeep;       // trough navy
  uniform vec3  uMid;        // body blue
  uniform vec3  uHot;        // crest cyan-white
  varying vec3 vPos;
  varying vec3 vNrm;
  varying vec2 vUv;

  void main() {
    vec3 N = normalize(vNrm);
    vec3 L = uLight - vPos;
    float dist = length(L);
    L /= dist;

    float diff  = max(dot(N, L), 0.0);
    float atten = 1.0 / (1.0 + dist * dist * 0.016);

    vec3 V = normalize(cameraPosition - vPos);
    vec3 H = normalize(L + V);
    float spec = pow(max(dot(N, H), 0.0), 42.0);
    float rim  = pow(1.0 - max(dot(N, V), 0.0), 2.4);

    // Vertical gradient: darkest at the top, richest toward the base.
    vec3 base = mix(uDeep, uMid, smoothstep(0.05, 0.85, vUv.y));
    // Fold shading — troughs sink toward navy, crests lift toward the body blue.
    base = mix(base * 0.42, base, smoothstep(0.0, 0.9, diff));

    vec3 col = base;
    col += uHot * diff * atten * 1.45;          // the glow
    col += uHot * spec * atten * 0.9;           // sheen on the crests
    col += uMid * rim * 0.28;                   // edge lift

    // Secondary cooler bloom upper-right, as in the reference.
    vec3 L2 = normalize(vec3(9.0, 6.0, 7.0) - vPos);
    col += uMid * max(dot(N, L2), 0.0) * 0.20;

    // Corner falloff so the panel edges stay dark.
    float vig = smoothstep(1.05, 0.25, length(vUv - vec2(0.55, 0.62)));
    col *= mix(0.45, 1.0, vig);

    gl_FragColor = vec4(col, 1.0);
  }
`

export default function AuroraPleatsGL({ className, style, speed = 1 }) {
  const hostRef = useRef(null)
  const speedRef = useRef(speed)
  speedRef.current = speed

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined

    // Respect reduced-motion: render one frame, don't animate.
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x03102f, 1)
    host.appendChild(renderer.domElement)
    Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%' })

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0, 15)

    const uniforms = {
      uTime: { value: 0 },
      uLight: { value: new THREE.Vector3(1.5, -3.2, 5.2) },
      uDeep: { value: new THREE.Color('#03113c') },
      uMid: { value: new THREE.Color('#0a34c4') },
      uHot: { value: new THREE.Color('#7fe6ff') },
    }

    const geo = new THREE.PlaneGeometry(34, 24, 420, 200)
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.z = -0.06
    scene.add(mesh)

    const resize = () => {
      const w = host.clientWidth || 1
      const h = host.clientHeight || 1
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      // Keep the surface filling the panel whatever its aspect.
      camera.position.z = 15 * Math.max(1, 1.15 / camera.aspect)
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    let raf = 0
    let t = 0
    const clock = new THREE.Clock()
    const loop = () => {
      // Scale elapsed time rather than reading the clock directly, so changing
      // `speed` accelerates from the current phase instead of jumping.
      t += clock.getDelta() * speedRef.current
      uniforms.uTime.value = t
      // The cyan core drifts slowly around the lower-centre, as in the still.
      uniforms.uLight.value.set(1.5 + Math.sin(t * 0.16) * 3.4, -3.0 + Math.cos(t * 0.12) * 1.9, 5.0 + Math.sin(t * 0.21) * 1.1)
      camera.position.x = Math.sin(t * 0.07) * 0.5
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
      raf = requestAnimationFrame(loop)
    }
    if (reduce) renderer.render(scene, camera); else loop()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      geo.dispose(); mat.dispose(); renderer.dispose()
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={hostRef} className={className} aria-hidden="true" style={{ position: 'absolute', inset: 0, ...style }} />
}
