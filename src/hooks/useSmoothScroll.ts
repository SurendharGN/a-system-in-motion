import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, EASE } from '../lib/gsap'
import { setLenis } from '../lib/scroll'

/**
 * Lenis smooth scrolling wired into the GSAP ticker so ScrollTrigger
 * and Lenis share a single clock. Disabled when reduced motion is on.
 */
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    })
    setLenis(lenis)

    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const refresh = () => ScrollTrigger.refresh()
    // Refresh once fonts settle so pin distances are correct.
    document.fonts?.ready.then(refresh).catch(() => {})
    const raf = requestAnimationFrame(refresh)

    return () => {
      cancelAnimationFrame(raf)
      gsap.ticker.remove(tick)
      lenis.off('scroll', onScroll)
      lenis.destroy()
      setLenis(null)
    }
  }, [enabled])
}

/** Lock / unlock page scroll (used during the entry sequence). */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    document.body.classList.toggle('is-locked', locked)
    return () => document.body.classList.remove('is-locked')
  }, [locked])
}
