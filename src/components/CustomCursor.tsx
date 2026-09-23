import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { usePrefersReducedMotion, useIsTouch } from '../hooks/useMediaQuery'

/**
 * Accent ring that trails the pointer. Purely decorative — native cursor
 * stays visible. Disabled on touch and with reduced motion.
 */
export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement | null>(null)
  const reduced = usePrefersReducedMotion()
  const touch = useIsTouch()

  useEffect(() => {
    const ring = ringRef.current
    if (!ring || reduced || touch) return

    const xTo = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' })
    const yTo = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' })

    const onMove = (e: PointerEvent) => {
      ring.classList.add('is-active')
      xTo(e.clientX)
      yTo(e.clientY)
    }
    const onLeave = () => {
      ring.classList.remove('is-active', 'is-hover')
    }

    const onOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null
      const interactive = target?.closest(
        'a, button, [role="tab"], .panel, .tile, .distort',
      )
      ring.classList.toggle('is-hover', Boolean(interactive))
    }

    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerout', onLeave)
    document.addEventListener('pointerover', onOver, { passive: true })

    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerout', onLeave)
      document.removeEventListener('pointerover', onOver)
    }
  }, [reduced, touch])

  if (reduced || touch) return null

  return <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
}