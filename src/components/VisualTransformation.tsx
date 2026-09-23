import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { visualTransformation } from '../animations/scrollAnimations'
import { fadeUp } from '../animations/utils'

const CELLS = Array.from({ length: 9 })

/**
 * Pinned "one source, many states" sequence.
 * A single disc fragments into a grid, then recomposes as an editorial
 * poster with typography. Scrubbed by scroll — paper canvas for contrast.
 */
export default function VisualTransformation() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (!sectionRef.current) return
    const root = sectionRef.current

    const head = root.querySelector('.section-head')
    if (head) fadeUp(head, { trigger: root })
    return visualTransformation(root, reduced)
  }, [reduced])

  return (
    <section
      ref={sectionRef}
      className="section transform"
      id="transformation"
      aria-labelledby="transform-title"
    >
      <div className="shell transform__intro">
        <header className="section-head">
          <span className="section-head__index" aria-hidden="true">
            02
          </span>
          <div className="section-head__body">
            <h2 id="transform-title" className="section-head__title">
              One system, <em>many states</em>
            </h2>
            <p className="section-head__note">
              A single mark fragments into a grid and resolves into a printed
              composition. Keep scrolling — the transformation is bound to you.
            </p>
          </div>
        </header>
      </div>

      <div className="transform__pin">
        <div className="transform__stage" aria-hidden="true">
          <div className="t-disc" />

          {CELLS.map((_, i) => (
            <div
              key={i}
              className={`t-cell${i === 4 ? ' t-cell--accent' : ''}`}
            />
          ))}

          <div className="t-panel t-panel--a">
            <span className="t-panel__k">System / 01</span>
            <span className="t-panel__v">10 states</span>
          </div>

          <div className="t-panel t-panel--b">
            <span className="t-panel__k">From</span>
            <span className="t-panel__v">one source</span>
          </div>

          <div className="t-panel t-panel--c">
            <span className="t-panel__k">Composition</span>
            <span className="t-panel__v">Recomposes as you read.</span>
          </div>

          <div className="t-type">
            <span>motion</span>
            <span>is grammar</span>
          </div>

          <div className="transform__caption" aria-hidden="true">
            <span>Source → grid → poster</span>
            <span>Scrubbed timeline</span>
          </div>
          <div className="transform__steps" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
    </section>
  )
}