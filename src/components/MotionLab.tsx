import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion, useIsTouch } from '../hooks/useMediaQuery'
import { useInView } from '../hooks/useInView'
import {
  sectionHead,
  magnetic,
  scrollTransform,
  interactiveGrid,
  textDistortion,
} from '../animations/scrollAnimations'
import { fadeUp } from '../animations/utils'

const DISTORT_WORD = 'INTERACTION'

export default function MotionLab() {
  const rootRef = useRef<HTMLElement | null>(null)
  const magneticRef = useRef<HTMLButtonElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const textRef = useRef<HTMLDivElement | null>(null)
  const reduced = usePrefersReducedMotion()
  const touch = useIsTouch()
  const { ref: viewRef, inView } = useInView<HTMLElement>(0.05)

  const idRef = (el: HTMLElement | null) => {
    rootRef.current = el
    viewRef.current = el
  }

  useEffect(() => {
    if (!rootRef.current) return

    const cleanups: Array<() => void> = []
    const root = rootRef.current

    sectionHead(root)
    const demoTween = fadeUp(root.querySelectorAll('.demo'), {
      trigger: root,
      stagger: 0.12,
      y: 48,
    })
    cleanups.push(() => demoTween.kill())

    if (magneticRef.current && !touch)
      cleanups.push(
        magnetic(magneticRef.current, { disabled: touch || reduced }),
      )

    if (scrollRef.current) cleanups.push(scrollTransform(scrollRef.current, reduced))
    if (gridRef.current)
      cleanups.push(interactiveGrid(gridRef.current, { touch, reduced }))
    if (textRef.current) cleanups.push(textDistortion(textRef.current, { touch, reduced }))

    return () => cleanups.forEach((fn) => fn())
  }, [touch, reduced])

  return (
    <section ref={idRef} className="section lab" id="laboratory" aria-labelledby="lab-title">
      <div className="shell">
        <header className="section-head">
          <span className="section-head__index" aria-hidden="true">
            01
          </span>
          <div className="section-head__body">
            <h2 id="lab-title" className="section-head__title">
              Interaction <em>laboratory</em>
            </h2>
            <p className="section-head__note">
              Four techniques running live. Move your pointer — or scroll, if
              you prefer to stay hands-off.
            </p>
          </div>
        </header>

        <div className="lab__grid">
          {/* A — Magnetic */}
          <div className="demo demo--magnetic">
            <div className="demo__label">
              <span className="demo__label-index">A</span>
              <h3 className="demo__label-title">Magnetic interaction</h3>
              <span className="demo__label-note">Pointer — constrained range</span>
            </div>
            <div className="demo__stage stage-magnetic">
              <button
                ref={magneticRef}
                type="button"
                className="magnetic-btn"
                disabled={touch}
                title={touch ? 'Pointer interaction is disabled on touch devices' : undefined}
              >
                Start
                <br />
                a project
              </button>
            </div>
          </div>

          {/* B — Text distortion */}
          <div className="demo demo--text">
            <div className="demo__label">
              <span className="demo__label-index">B</span>
              <h3 className="demo__label-title">Text distortion</h3>
              <span className="demo__label-note">
                {touch ? 'Scroll — wave' : 'Pointer — proximity'}
              </span>
            </div>
            <div className="demo__stage stage-text">
              <div ref={textRef} className="distort" aria-hidden="true">
                {DISTORT_WORD.split('').map((char, i) => (
                  <span key={i} className="distort__char">
                    {char}
                  </span>
                ))}
              </div>
              <p className="sr-only">INTERACTION — each letter reacts to the pointer.</p>
            </div>
          </div>

          {/* C — Scroll transformation */}
          <div className="demo demo--scroll">
            <div className="demo__label">
              <span className="demo__label-index">C</span>
              <h3 className="demo__label-title">Scroll transformation</h3>
              <span className="demo__label-note">Scrubbed — keep scrolling</span>
            </div>
            <div ref={scrollRef} className="demo__stage stage-scroll scroll-demo">
              <div className="scroll-demo__frame" aria-hidden="true">
                <div className="scroll-demo__panel" />
                <div className="scroll-demo__panel" />
                <div className="scroll-demo__panel" />
              </div>
              <span className="scroll-demo__caption mono">System / 01</span>
              <svg className="scroll-demo__progress" viewBox="0 0 40 40" aria-hidden="true">
                <circle className="track" cx="20" cy="20" r="17" pathLength="100" />
                <circle
                  className="bar"
                  cx="20"
                  cy="20"
                  r="17"
                  pathLength="100"
                  strokeDasharray="100"
                  strokeDashoffset="100"
                />
              </svg>
            </div>
          </div>

          {/* D — Interactive grid */}
          <div className="demo demo--grid">
            <div className="demo__label">
              <span className="demo__label-index">D</span>
              <h3 className="demo__label-title">Interactive grid</h3>
              <span className="demo__label-note">{touch ? 'Tap cells' : 'Pointer field'}</span>
            </div>
            <div ref={gridRef} className="demo__stage stage-grid">
              <div className="tile-grid" role="img" aria-label="A grid of cells that react to your pointer">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="tile" data-n={`${String(i + 1).padStart(2, '0')}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}