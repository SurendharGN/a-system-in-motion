import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, EASE } from '../lib/gsap'

/** Scoped GSAP context — auto-cleans on unmount. */
export function useGsap(
  fn: (ctx: { gsap: typeof gsap; ScrollTrigger: typeof ScrollTrigger }) => void,
  deps: unknown[] = [],
) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => fn({ gsap, ScrollTrigger }), el)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}

/**
 * One-line masked text reveal: children of `.reveal-line` slide up
 * as the parent enters the viewport.
 */
export function revealLines(
  scope: HTMLElement,
  options: { trigger?: Element; delay?: number; stagger?: number } = {},
) {
  const lines = scope.querySelectorAll<HTMLElement>('.reveal-line > *')
  if (!lines.length) return

  const maskHeight = (_i: number, el: Element) =>
    Math.ceil(
      (el.parentElement as HTMLElement | null)?.getBoundingClientRect().height ||
        el.getBoundingClientRect().height,
    )

  gsap.set(lines, { y: maskHeight })
  return gsap
    .to(lines, {
      y: 0,
      duration: 1.1,
      ease: EASE.out,
      delay: options.delay ?? 0,
      stagger: options.stagger ?? 0.09,
      scrollTrigger: {
        trigger: options.trigger ?? scope,
        start: 'top 82%',
        once: true,
      },
    })
    .eventCallback('onComplete', () => gsap.set(lines, { y: 0 }))
}

/** Generic fade-rise entrance for grouped elements. */
export function fadeUp(
  targets: gsap.TweenTarget,
  options: { trigger?: gsap.DOMTarget; delay?: number; stagger?: number; y?: number } = {},
) {
  const resolveTrigger = (t: gsap.TweenTarget): gsap.DOMTarget | undefined =>
    t instanceof NodeList ? (t[0] as Element) : (t as gsap.DOMTarget)

  return gsap
    .fromTo(
      targets,
      { y: options.y ?? 36, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 1,
        ease: EASE.out,
        delay: options.delay ?? 0,
        stagger: options.stagger ?? 0.08,
        scrollTrigger: {
          trigger: options.trigger ?? resolveTrigger(targets),
          start: 'top 85%',
          once: true,
        },
      },
    )
    .eventCallback('onComplete', () => gsap.set(targets, { autoAlpha: 1, y: 0 }))
}
