import { useEffect, useRef, type ReactNode } from 'react'
import { gsap, EASE } from '../lib/gsap'
import { usePrefersReducedMotion } from '../hooks/useMediaQuery'

type Setup = (el: HTMLElement) => (() => void) | void

function useDemo(setup: Setup, running: boolean) {
  const ref = useRef<HTMLDivElement | null>(null)
  const setupRef = useRef(setup)
  setupRef.current = setup

  useEffect(() => {
    const el = ref.current
    if (!el || !running) return
    return setupRef.current(el) ?? (() => {})
  }, [running])

  return ref
}

/** Wraps a technique canvas with shared mount/unmount lifecycle. */
export function DemoCanvas({
  children,
  setup,
  running,
}: {
  children: ReactNode
  setup: Setup
  running: boolean
}) {
  const ref = useDemo(setup, running)
  return (
    <div ref={ref} className="skills__stage-canvas">
      {children}
    </div>
  )
}

/* ------------------------- 01 · Image reveal ------------------------- */
export function SkReveal({ running }: { running: boolean }) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = canvasRef.current
    if (!el || !running) return
    if (reduced) return

    const tl = gsap
      .timeline({
        repeat: -1,
        yoyo: true,
        repeatDelay: 0.8,
        defaults: { ease: 'power2.inOut' },
      })
      .fromTo(
        el.querySelector('.sk-reveal__mask'),
        { xPercent: 0 },
        { xPercent: -101, duration: 1.4 },
      )
      .to(el.querySelector('.sk-reveal__label'), { autoAlpha: 0.2, duration: 0.4 }, 1.1)
      .to({}, { duration: 1.4 })

    return () => {
      tl.kill()
    }
  }, [running, reduced])

  return (
    <div ref={canvasRef} className="sk-reveal">
      <div className="sk-reveal__img" aria-hidden="true" />
      <div className="sk-reveal__mask" aria-hidden="true" />
      <span className="sk-reveal__label mono">Clip-path wipe · loop</span>
    </div>
  )
}

/* ------------------------- 02 · Text animation ------------------------- */
export function SkText({ running }: { running: boolean }) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = canvasRef.current
    if (!el || !running) return
    if (reduced) return

    const lines = el.querySelectorAll<HTMLElement>('.sk-text span i')
    const tl = gsap
      .timeline({ repeat: -1, repeatDelay: 1.2, defaults: { ease: EASE.out } })
      .fromTo(lines, { yPercent: 115 }, { yPercent: 0, duration: 0.9, stagger: 0.12 })
      .to({}, { duration: 1.6 })
      .to(lines, { yPercent: -115, duration: 0.7, stagger: 0.08 }, '+=0.2')

    return () => {
      tl.kill()
    }
  }, [running, reduced])

  return (
    <div ref={canvasRef} className="sk-text">
      <span>
        <i>Layers move</i>
      </span>
      <span>
        <i>
          <em>on their own</em>
        </i>
      </span>
      <span>
        <i>clock.</i>
      </span>
    </div>
  )
}

/* ------------------------- 03 · Cursor interaction ------------------------- */
const FIELD_DOTS = Array.from({ length: 64 }).map((_, i) => {
  // Deterministic pseudo-random layout.
  const a = Math.sin(i * 127.1 + 311.7) * 43758.5453
  const b = Math.sin(i * 269.5 + 183.3) * 28001.8384
  return {
    x: (a - Math.floor(a)) * 100,
    y: (b - Math.floor(b)) * 100,
    f: 0.25 + ((i * 7) % 10) / 10,
  }
})

export function SkCursor({ running }: { running: boolean }) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = canvasRef.current
    if (!el || !running) return
    if (reduced) return

    const dots = Array.from(el.querySelectorAll<HTMLElement>('.sk-cursor__dot'))
    let raf = 0
    let px = -9999
    let py = -9999
    let cx: number
    let cy: number

    const getRect = () => el.getBoundingClientRect()

    const paint = () => {
      raf = 0
      if (cx === undefined) return
      const rect = el.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i]
        const f = dot.dataset.f ? parseFloat(dot.dataset.f) : 0.5
        const r = dot.dataset.r ? parseFloat(dot.dataset.r) : 16
        const dx = (dot.dataset.x ? parseFloat(dot.dataset.x) : 0) / 100 * w
        const dy = (dot.dataset.y ? parseFloat(dot.dataset.y) : 0) / 100 * h
        const ax = cx - dx
        const ay = cy - dy
        const dist = Math.hypot(ax, ay)
        const t = Math.max(0, 1 - dist / r)
        dot.style.transform = `translate3d(${dx + ax * t * f}px, ${
          dy + ay * t * f
        }px, 0)`
        dot.classList.toggle('is-near', t > 0.55)
      }
    }

    const onMove = (e: PointerEvent) => {
      const rect = getRect()
      cx = e.clientX - rect.left
      cy = e.clientY - rect.top
      if (!raf) raf = requestAnimationFrame(paint)
    }

    el.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      el.removeEventListener('pointermove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [running, reduced])

  return (
    <div ref={canvasRef} className="sk-cursor">
      {FIELD_DOTS.map((dot, i) => (
        <span
          key={i}
          className="sk-cursor__dot"
          style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
          data-x={dot.x}
          data-y={dot.y}
          data-f={dot.f.toFixed(2)}
          data-r={(46 + dot.f * 44).toFixed(0)}
        />
      ))}
      <span className="sk-cursor__hint mono">Move through the field</span>
    </div>
  )
}

/* ------------------------- 04 · Parallax ------------------------- */
export function SkParallax({ running }: { running: boolean }) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = canvasRef.current
    if (!el || !running) return
    if (reduced) return

    const layers = Array.from(
      el.querySelectorAll<HTMLElement>('.sk-parallax__layer'),
    )
    const factors = [0.05, 0.09, 0.03, 0.13]
    const setters = layers.map((layer, i) => ({
      x: gsap.quickTo(layer, 'x', { duration: 0.7, ease: EASE.soft }),
      y: gsap.quickTo(layer, 'y', { duration: 0.7, ease: EASE.soft }),
      f: factors[i % factors.length],
    }))
    let runningRef = true

    const onMove = (e: PointerEvent) => {
      if (!runningRef) return
      const rect = el.getBoundingClientRect()
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1
      setters.forEach((s) => {
        s.x(nx * 70 * s.f)
        s.y(ny * 70 * s.f)
      })
    }

    el.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      runningRef = false
      el.removeEventListener('pointermove', onMove)
      setters.forEach((s) => {
        s.x(0)
        s.y(0)
      })
    }
  }, [running, reduced])

  return (
    <div ref={canvasRef} className="sk-parallax">
      <span className="sk-parallax__layer sk-parallax__layer--1" aria-hidden="true" />
      <span className="sk-parallax__layer sk-parallax__layer--2" aria-hidden="true" />
      <span className="sk-parallax__layer sk-parallax__layer--3" aria-hidden="true" />
      <span className="sk-parallax__layer sk-parallax__layer--4 mono">Depth / 04</span>
    </div>
  )
}

/* ------------------------- 05 · Liquid distortion ------------------------- */
export function SkLiquid({ running }: { running: boolean }) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = canvasRef.current
    if (!el || !running) return
    if (reduced) return

    const turbulence = el.querySelector<SVGFETurbulenceElement>('#liq-turb')
    const map = el.querySelector<SVGFEDisplacementMapElement>('#liq-map')
    const crisp = el.querySelector<HTMLElement>('.sk-liquid__crisp')
    if (!turbulence || !map) return

    const tl = gsap
      .timeline({ repeat: -1, repeatDelay: 0.5, defaults: { ease: 'power2.inOut' } })
      .to(turbulence, { attr: { baseFrequency: '0.035 0.06' }, duration: 1.4 }, 0)
      .to(map, { attr: { scale: 46 }, duration: 1.4 }, 0)
      .to(crisp, { autoAlpha: 0, duration: 0.4, ease: 'power1.out' }, 0)
      .to(
        turbulence,
        { attr: { baseFrequency: '0.006 0.02' }, duration: 1.4 },
        1.4,
      )
      .to(map, { attr: { scale: 0 }, duration: 1.4 }, 1.4)
      .to(crisp, { autoAlpha: 1, duration: 0.5 }, 2.2)

    return () => {
      tl.kill()
      gsap.set(crisp, { autoAlpha: 1 })
      gsap.set(turbulence, { attr: { baseFrequency: '0.006 0.02' } })
      gsap.set(map, { attr: { scale: 0 } })
    }
  }, [running, reduced])

  return (
    <div ref={canvasRef} className="sk-liquid">
      <svg viewBox="0 0 500 160" role="presentation" aria-hidden="true">
        <defs>
          <filter id="liq" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              id="liq-turb"
              type="fractalNoise"
              baseFrequency="0.006 0.02"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              id="liq-map"
              in="SourceGraphic"
              in2="noise"
              scale="0"
            />
          </filter>
        </defs>
        <g filter="url(#liq)">
          <text x="250" y="104" textAnchor="middle">
            LIQUID
          </text>
        </g>
      </svg>
      <span className="sr-only">LIQUID — SVG displacement filter, looping.</span>
    </div>
  )
}

/* ------------------------- 06 · SVG animation ------------------------- */
export function SkSvg({ running }: { running: boolean }) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = canvasRef.current
    if (!el || !running) return
    if (reduced) return

    const paths = Array.from(el.querySelectorAll<SVGElement>('.draw'))
    const tl = gsap
      .timeline({ repeat: -1, repeatDelay: 1, defaults: { ease: 'power2.inOut' } })
      .fromTo(
        paths,
        { strokeDashoffset: 100 },
        { strokeDashoffset: 0, duration: 1.6, stagger: 0.18 },
      )
      .to({}, { duration: 1.6 })

    return () => {
      tl.kill()
    }
  }, [running, reduced])

  return (
    <div ref={canvasRef} className="sk-svg">
      <svg viewBox="0 0 300 300" role="presentation" aria-hidden="true">
        <circle className="draw" pathLength="100" strokeDasharray="100" cx="150" cy="150" r="116" />
        <path
          className="draw"
          pathLength="100"
          strokeDasharray="100"
          d="M150 150 L210 60 L210 240 Z"
        />
        <path
          className="draw"
          pathLength="100"
          strokeDasharray="100"
          d="M150 150 Q84 96 40 150 Q96 204 150 150"
        />
        <circle className="dash" cx="150" cy="150" r="70" />
      </svg>
      <span className="sr-only">SVG paths drawing themselves in a loop.</span>
    </div>
  )
}

/* ------------------------- 07 · Page transition ------------------------- */
export function SkTransition({ running }: { running: boolean }) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = canvasRef.current
    if (!el || !running) return
    if (reduced) return

    const panels = Array.from(el.querySelectorAll<HTMLElement>('.sk-transition__panel'))
    const label = el.querySelector<HTMLElement>('.sk-transition__label')
    const tl = gsap
      .timeline({ repeat: -1, repeatDelay: 0.6, defaults: { ease: 'power4.inOut' } })
      .to(panels[0], { xPercent: 101, duration: 1.1 }, 0)
      .to(panels[1], { xPercent: 101, duration: 1.1, delay: 0.22 }, 0.35)
      .to(label, { autoAlpha: 0, duration: 0.25 }, 0.15)
      .to({}, { duration: 1.8 })
      .to(label, { autoAlpha: 1, duration: 0.3 }, 3)

    return () => {
      tl.kill()
    }
  }, [running, reduced])

  return (
    <div ref={canvasRef} className="sk-transition">
      <div className="sk-transition__panel" aria-hidden="true" />
      <div className="sk-transition__panel" aria-hidden="true" />
      <span className="sk-transition__label mono">Route changing…</span>
    </div>
  )
}

/* ------------------------- 08 · Interactive typography ------------------------- */
export function SkType({ running }: { running: boolean }) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = canvasRef.current
    if (!el || !running) return
    if (reduced) return

    const word = el.querySelector<HTMLElement>('.sk-type__word')
    if (!word) return
    const base = 0.74 // em spacing unit approximated
    let raf = 0
    let decay = true

    const paint = () => {
      raf = 0
      if (decay) {
        const v = Math.max(0, parseFloat(word.dataset.ls ?? '0') - 0.02)
        word.dataset.ls = String(v)
        word.style.letterSpacing = `${(base + v * 0.5).toFixed(3)}em`
        request()
      }
      word.style.transform = `scale(${(1 + (word.dataset.scale ? parseFloat(word.dataset.scale) : 0) * 0.03).toFixed(4)})`
    }

    const request = () => {
      if (!raf) raf = requestAnimationFrame(paint)
    }

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const nx = (e.clientX - rect.left) / rect.width
      const ny = (e.clientY - rect.top) / rect.height
      decay = false
      word.dataset.ls = String((nx - 0.5) * 2)
      word.dataset.scale = String((ny - 0.5) * 2)
      request()
    }
    const onLeave = () => {
      decay = true
      request()
    }

    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
      gsap.set(word, { clearProps: 'all' })
    }
  }, [running, reduced])

  return (
    <div ref={canvasRef} className="sk-type">
      <p className="sk-type__word" data-ls="0" data-scale="0">
        stretch<em>word</em>
      </p>
      <span className="sk-type__hint mono">Track the edge-to-edge letter spacing</span>
    </div>
  )
}

/* ------------------------- 09 · 3D movement ------------------------- */
export function SkStack({ running }: { running: boolean }) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = canvasRef.current
    if (!el || !running) return
    if (reduced) return

    const stack = el.querySelector<HTMLElement>('.sk-3d__stack')
    if (!stack) return

    const rx = gsap.quickTo(stack, 'rotationX', { duration: 0.8, ease: EASE.soft })
    const ry = gsap.quickTo(stack, 'rotationY', { duration: 0.8, ease: EASE.soft })

    const idle = gsap.to(stack, {
      rotationY: 18,
      y: 6,
      duration: 2.4,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    })

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1
      idle.pause()
      rx(ny * 26)
      ry(nx * 30)
    }
    const onLeave = () => {
      rx(0)
      ry(0)
      idle.play()
    }

    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      idle.kill()
      gsap.set(stack, { clearProps: 'all' })
    }
  }, [running, reduced])

  return (
    <div ref={canvasRef} className="sk-3d">
      <div className="sk-3d__stack" aria-hidden="true">
        <span className="sk-3d__plane">TOP</span>
        <span className="sk-3d__plane">STATE</span>
        <span className="sk-3d__plane">DEPTH</span>
      </div>
      <span className="sr-only">Three stacked planes rotating in CSS perspective.</span>
    </div>
  )
}

/* ------------------------- 10 · Scroll animation ------------------------- */
export function SkScrub({ running }: { running: boolean }) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = canvasRef.current
    if (!el || !running) return
    if (reduced) return

    const thumb = el.querySelector<HTMLElement>('.sk-scroll__thumb')
    const cards = Array.from(el.querySelectorAll<HTMLElement>('.sk-scroll__card'))
    if (!thumb) return

    const tl = gsap
      .timeline({ repeat: -1, defaults: { ease: 'power2.inOut' } })
      .to(thumb, { left: '70%', duration: 2 })
      .to(
        cards[0],
        { yPercent: -110, autoAlpha: 0, scale: 0.9, duration: 2 },
        '<',
      )
      .to(cards[1], { yPercent: -110, autoAlpha: 0, scale: 0.9, duration: 2 }, '+=1.6')
      .to(cards[2], { yPercent: -110, autoAlpha: 0, scale: 0.9, duration: 2 }, '+=1.6')
      .to({}, { duration: 1 })
      .set([cards[0], cards[1], cards[2]], { yPercent: 0, autoAlpha: 1, scale: 1 })
      .set(thumb, { left: '0%' })

    return () => {
      tl.kill()
    }
  }, [running, reduced])

  return (
    <div ref={canvasRef} className="sk-scroll">
      <div className="sk-scroll__rail" aria-hidden="true">
        <span className="sk-scroll__thumb" />
      </div>
      <div className="sk-scroll__cards" aria-hidden="true">
        <span className="sk-scroll__card">Scroll</span>
        <span className="sk-scroll__card">Pin</span>
        <span className="sk-scroll__card">Scrub</span>
      </div>
      <span className="sr-only">A scrubbed scroll timeline running as a loop.</span>
    </div>
  )
}

export const stageComponents: Record<
  string,
  (props: { running: boolean }) => ReactNode
> = {
  reveal: SkReveal,
  text: SkText,
  cursor: SkCursor,
  parallax: SkParallax,
  liquid: SkLiquid,
  svg: SkSvg,
  transition: SkTransition,
  type: SkType,
  stack: SkStack,
  scrub: SkScrub,
}