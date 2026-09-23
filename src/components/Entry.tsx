import { useEffect, useRef } from 'react'
import { gsap, EASE } from '../lib/gsap'
import { usePrefersReducedMotion, useIsTouch } from '../hooks/useMediaQuery'
import { useInView } from '../hooks/useInView'

type Props = {
  onComplete: () => void
}

/**
 * Short, skippable entry sequence.
 * Reduced motion: completes instantly.
 */
export default function Entry({ onComplete }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const reduced = usePrefersReducedMotion()
  const touch = useIsTouch()
  const { ref: viewRef, inView } = useInView<HTMLDivElement>(0.1)
  const doneRef = useRef(false)

  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    onComplete()
  }

  useEffect(() => {
    if (reduced) {
      finish()
      return
    }

    const root = rootRef.current
    if (!root) return

    let skipped = false
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: finish })

      tl.to('.entry__mark span', {
        autoAlpha: 1,
        scale: 1,
        rotate: 45,
        duration: 0.7,
        ease: EASE.out,
        stagger: 0.12,
      })
        .to(
          '.entry__title span',
          { y: 0, yPercent: 0, duration: 0.8, ease: EASE.out },
          0.25,
        )
        .fromTo(
          '.entry__line span',
          { scaleX: 0 },
          { scaleX: 1, duration: 1.1, ease: 'power2.inOut' },
          0.35,
        )
        .fromTo(
          '.entry__meta',
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.5 },
          0.6,
        )
        .to('.entry__inner', { autoAlpha: 0, y: -16, duration: 0.5, ease: EASE.out }, 1.7)
        .to(
          root,
          {
            yPercent: -100,
            duration: 0.9,
            ease: 'power4.inOut',
          },
          1.9,
        )

      const skip = () => {
        if (skipped) return
        skipped = true
        tl.progress(1)
      }

      window.addEventListener('keydown', skip)
      root.addEventListener('pointerdown', skip)
      return () => {
        window.removeEventListener('keydown', skip)
        root.removeEventListener('pointerdown', skip)
        tl.kill()
      }
    }, root)

    return () => {
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  // Reduced motion never renders the overlay.
  if (reduced) return null

  return (
    <div
      ref={(el) => {
        rootRef.current = el
        viewRef.current = el
      }}
      className="entry"
      role="presentation"
      aria-hidden={!inView}
    >
      <div className="entry__inner">
        <div className="entry__mark" aria-hidden="true">
          <span />
          <span />
        </div>
        <p className="entry__title">
          <span>A system in motion</span>
        </p>
        <div className="entry__line">
          <span />
        </div>
        <div className="entry__meta">
          <span>Portfolio</span>
          <span>Loading experience</span>
          <span>{touch ? 'Tap to skip' : 'Click to skip'}</span>
        </div>
      </div>
      <button type="button" className="entry__skip" onClick={finish}>
        Skip intro
      </button>
    </div>
  )
}
