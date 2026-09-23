import { gsap, EASE } from '../lib/gsap'

/** Page-level transition helpers (shared easing language). */

/** Wipe an element in from the left, settle. */
export function wipeIn(el: Element, delay = 0) {
  return gsap.fromTo(
    el,
    { clipPath: 'inset(0% 100% 0% 0%)' },
    {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1,
      delay,
      ease: EASE.out,
    },
  )
}

/** Soft rise for grouped labels / links. */
export function riseGroup(targets: Element | NodeListOf<Element>, delay = 0) {
  return gsap.from(targets, {
    y: 24,
    autoAlpha: 0,
    duration: 0.9,
    delay,
    stagger: 0.07,
    ease: EASE.out,
  })
}

/** Closing statement: lines expand as the section enters. */
export function closingReveal(scope: HTMLElement) {
  const ctx = gsap.context(() => {
    gsap.from('.closing__statement', {
      yPercent: 30,
      autoAlpha: 0,
      duration: 1.2,
      ease: EASE.out,
      scrollTrigger: { trigger: scope, start: 'top 70%', once: true },
    })
    gsap.from('.closing__cta > *', {
      y: 40,
      autoAlpha: 0,
      duration: 1,
      ease: EASE.out,
      stagger: 0.1,
      scrollTrigger: { trigger: '.closing__grid', start: 'top 78%', once: true },
    })
    gsap.from('.closing__reprise', {
      scale: 0.7,
      rotate: -20,
      autoAlpha: 0,
      duration: 1.3,
      ease: EASE.out,
      scrollTrigger: { trigger: '.closing__grid', start: 'top 78%', once: true },
    })
  }, scope)
  return () => ctx.revert()
}
