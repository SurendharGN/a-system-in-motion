import { useEffect, useRef, useState } from 'react'
import { site } from '../data/site'
import { scrollToId } from '../lib/scroll'
import { gsap, EASE } from '../lib/gsap'

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState('')
  const progressRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const toggleRef = useRef<HTMLButtonElement | null>(null)

  // Scroll state: progress bar, compact header, active section.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? y / max : 0
      setProgress(p)
      setScrolled(y > 40)

      let current = ''
      for (const item of site.nav) {
        const el = document.getElementById(item.id)
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) {
          current = item.id
        }
      }
      setActive(current)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (progressRef.current) {
      gsap.set(progressRef.current, { scaleX: progress })
    }
  }, [progress])

  // Menu: lock scroll, animate in, trap Escape.
  useEffect(() => {
    if (!open) return

    document.body.classList.add('is-locked')
    const menu = menuRef.current
    if (!menu) return undefined

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.menu__item',
        { yPercent: 110 },
        { yPercent: 0, duration: 0.7, ease: EASE.out, stagger: 0.06 },
      )
      gsap.fromTo(
        '.menu__foot',
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.25, ease: EASE.out },
      )
    }, menu)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.classList.remove('is-locked')
      window.removeEventListener('keydown', onKey)
      ctx.revert()
    }
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    // Let the menu close before scrolling takes over.
    window.setTimeout(() => scrollToId(id), open ? 320 : 0)
  }

  return (
    <>
      <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
        <div className="shell nav__inner">
          <a
            className="nav__logo"
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              go('top')
            }}
            aria-label={`${site.brand} — back to top`}
          >
            <span className="nav__logo-mark" aria-hidden="true">
              ◈
            </span>
            <span className="nav__logo-text">{site.brand}</span>
          </a>

          <nav className="nav__links" aria-label="Primary">
            {site.nav.map((item) => (
              <a
                key={item.id}
                className={`nav__link${active === item.id ? ' is-active' : ''}`}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  go(item.id)
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <button
            ref={toggleRef}
            type="button"
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span>{open ? 'Close' : 'Menu'}</span>
            <span className="nav__toggle-bars" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
        <div
          ref={progressRef}
          className="nav__progress"
          aria-hidden="true"
          style={{ transform: 'scaleX(0)' }}
        />
      </header>

      {open && (
        <div
          ref={menuRef}
          id="mobile-menu"
          className="menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <ul className="menu__list">
            {site.nav.map((item) => (
              <li key={item.id} className="menu__item">
                <a
                  className="menu__link"
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    go(item.id)
                  }}
                >
                  <span className="mono">{item.index}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="menu__foot mono">
            <span>{site.tagline}</span>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        </div>
      )}
    </>
  )
}
