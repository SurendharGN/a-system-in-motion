import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion, useIsTouch } from './useMediaQuery'

/**
 * Tracks whether the component is on screen. Used to pause demo
 * loops (rAF / infinite timelines) when nothing is visible.
 */
export function useInView<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  return { ref, inView }
}

export { usePrefersReducedMotion, useIsTouch }
