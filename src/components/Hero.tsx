import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion, useIsTouch } from '../hooks/useMediaQuery'
import { heroIntro, heroPointer, heroScroll } from '../animations/heroAnimations'
import { scrollToId } from '../lib/scroll'
import { site } from '../data/site'

/**
 * Full-screen hero — editorial headline, system diagram, scroll cue.
 * Intro timeline runs after the entry overlay completes (see App).
 */
export default function Hero({ play }: { play: boolean }) {
  const rootRef = useRef<HTMLElement | null>(null)
  const reduced = usePrefersReducedMotion()
  const touch = useIsTouch()

  useEffect(() => {
    if (!play || !rootRef.current) return
    const root = rootRef.current
    const offIntro = heroIntro(root, { reduced })
    const offPointer = heroPointer(root, { reduced, touch })
    const offScroll = heroScroll(root, reduced)
    return () => {
      offIntro()
      offPointer()
      offScroll()
    }
  }, [play, reduced, touch])

  return (
    <section ref={rootRef} className="hero shell" id="top" aria-label="Introduction">
      <div className="hero__top">
        <p className="hero__meta mono">
          Portfolio — <strong>Motion &amp; Interaction</strong>
        </p>
        <p className="hero__meta mono">Creative development / design systems</p>
      </div>

      <div className="hero__center">
        <h1 className="hero__title">
          <span className="hero__line">
            <span>Design is</span>
          </span>
          <span className="hero__line hero__line--serif">
            <span>a system</span>
          </span>
          <span className="hero__line">
            <span>in motion.</span>
          </span>
        </h1>

        <p className="hero__aside">
          A portfolio built as an experiment — typography, imagery and code
          behaving as one responsive system. Move, scroll and watch it answer.
        </p>

        {/* Visual object: layered system diagram with pointer parallax */}
        <div className="hero__visual" aria-hidden="true">
          <svg
            className="system-diagram"
            viewBox="0 0 400 400"
            role="presentation"
            focusable="false"
          >
            <g className="grid">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <line
                  key={`h${i}`}
                  className="grid-line"
                  x1="0"
                  y1={i * 50 + 25}
                  x2="400"
                  y2={i * 50 + 25}
                />
              ))}
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <line
                  key={`v${i}`}
                  className="grid-line"
                  x1={i * 50 + 25}
                  y1="0"
                  x2={i * 50 + 25}
                  y2="400"
                />
              ))}
            </g>

            <circle className="ring" cx="200" cy="200" r="170" pathLength="100" />
            <circle className="ring" cx="200" cy="200" r="124" pathLength="100" />
            <circle
              className="ring ring--accent"
              cx="200"
              cy="200"
              r="78"
              pathLength="100"
            />

            <g className="orbit">
              <circle className="ring" cx="200" cy="200" r="147" pathLength="100" />
              <circle className="node" cx="200" cy="53" r="6" />
              <circle className="node" cx="347" cy="200" r="4" />
            </g>

            <line className="grid-line" x1="30" y1="200" x2="370" y2="200" />
            <line className="grid-line" x1="200" y1="30" x2="200" y2="370" />
            <rect
              x="186"
              y="186"
              width="28"
              height="28"
              fill="none"
              stroke="#ff4d1c"
              strokeWidth="1"
            />
          </svg>
        </div>
      </div>

      <div className="hero__bottom">
        <button
          type="button"
          className="hero__scroll mono"
          onClick={() => scrollToId('laboratory')}
          aria-label="Scroll to the interaction laboratory"
        >
          <span className="hero__scroll-track" aria-hidden="true">
            <i />
          </span>
          Scroll to run the system
        </button>
        <p className="hero__coords mono">{site.tagline}</p>
      </div>
    </section>
  )
}
