import { useEffect, useRef } from 'react'
import { ArrowUp, ArrowRight } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { site } from '../data/site'
import { closingReveal } from '../animations/transitionAnimations'
import { scrollToTop } from '../lib/scroll'

/** Reprise of the hero diagram — the system closes its own loop. */
function Reprise() {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className="closing__reprise"
      initial={reduced ? false : { opacity: 0, scale: 0.7, rotate: -24 }}
      whileInView={{
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] },
      }}
      viewport={{ once: true, amount: 0.4 }}
      aria-hidden="true"
    >
      <svg className="system-diagram" viewBox="0 0 400 400" role="presentation">
        <circle className="ring" cx="200" cy="200" r="168" pathLength="100" />
        <circle className="ring" cx="200" cy="200" r="110" pathLength="100" />
        <circle
          className="ring ring--accent"
          cx="200"
          cy="200"
          r="56"
          pathLength="100"
        />
        <g className="orbit">
          <circle className="node" cx="200" cy="58" r="6" />
          <circle className="node" cx="342" cy="200" r="4" />
        </g>
        <line className="grid-line" x1="40" y1="200" x2="360" y2="200" />
        <line className="grid-line" x1="200" y1="40" x2="200" y2="360" />
      </svg>
    </motion.div>
  )
}

export default function Closing() {
  const rootRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!rootRef.current) return
    return closingReveal(rootRef.current)
  }, [])

  const socials = site.socials.filter((s) => s.url)

  return (
    <section
      ref={rootRef}
      className="closing"
      id="contact"
      aria-labelledby="contact-title"
    >
      <div className="shell">
        <span className="section-head__index" aria-hidden="true">
          05
        </span>

        <h2 id="contact-title" className="closing__statement">
          Let&apos;s make the <em>still</em> impossible.
        </h2>

        <div className="closing__grid">
          <div className="closing__cta">
            <p className="closing__note">
              I&apos;m available for experiments, collaborations and products
              that need a considered interaction layer. Tell me what you&apos;re
              trying to move.
            </p>
            <a className="closing__email" href={`mailto:${site.email}`}>
              {site.email}
              <ArrowRight aria-hidden="true" />
            </a>
            <div className="closing__socials">
              {socials.map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              ))}
              <a href="#top" onClick={() => scrollToTop()}>
                Back to top
              </a>
            </div>
          </div>

          <Reprise />
        </div>
      </div>

      <footer className="footer">
        <div className="shell footer__row">
          <p className="mono">
            © {site.year} — {site.brand}
          </p>
          <p className="mono">Built with React · GSAP · Lenis</p>
          <button
            type="button"
            className="footer__top"
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            Top <ArrowUp aria-hidden="true" />
          </button>
        </div>
      </footer>
    </section>
  )
}