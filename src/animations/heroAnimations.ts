import { gsap, ScrollTrigger, EASE } from '../lib/gsap'

/**
 * Hero entry sequence — runs once the entry overlay hands over.
 * Lines rise out of their masks, meta fades in, diagram settles.
 */
/** Pixel distance a masked line must travel to sit fully below its mask. */
const maskHeight = (_i: number, el: Element) =>
  Math.ceil((el.parentElement as HTMLElement | null)?.getBoundingClientRect().height || el.getBoundingClientRect().height)

export function heroIntro(
  scope: HTMLElement,
  opts: { reduced: boolean; onComplete?: () => void } = { reduced: false },
) {
  const ctx = gsap.context(() => {
    const lines = scope.querySelectorAll<HTMLElement>('.hero__line > span')
    const tl = gsap.timeline({ defaults: { ease: EASE.out } })

    if (opts.reduced) {
      // Reduced motion: present everything at rest.
      gsap.set('.hero__line > span', { y: 0 })
      gsap.set('.hero__meta, .hero__aside, .hero__bottom, .hero__visual', {
        autoAlpha: 1,
      })
      return
    }

    tl.fromTo(
      '.hero__line > span',
      { y: maskHeight },
      { y: 0, duration: 1.25, stagger: 0.11 },
      0,
    )
      .fromTo(
        '.hero__meta, .hero__aside, .hero__bottom',
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 },
        0.35,
      )
      .fromTo(
        '.hero__visual',
        { autoAlpha: 0, scale: 0.88, rotate: -8 },
        { autoAlpha: 0.9, scale: 1, rotate: 0, duration: 1.4 },
        0.2,
      )
      .fromTo(
        // pathLength="100" normalises every circle to a 0–100 dash range.
        '.system-diagram .ring',
        { strokeDashoffset: 100 },
        { strokeDashoffset: 0, duration: 1.1, stagger: 0.14 },
        0.4,
      )

    // Safety net: whatever happens mid-flight, the headline must resolve
    // visible once the sequence finishes.
    tl.eventCallback('onComplete', () => {
      gsap.set(lines, { y: 0 })
      opts.onComplete?.()
    })

    return () => {
      tl.kill()
    }
  }, scope)

  return () => ctx.revert()
}

/**
 * Subtle pointer parallax for the hero diagram + headline.
 * Returns a cleanup function; no-op on touch / reduced motion.
 */
export function heroPointer(
  scope: HTMLElement,
  opts: { reduced: boolean; touch: boolean },
) {
  if (opts.reduced || opts.touch) return () => {}

  const ctx = gsap.context(() => {
    const visual = scope.querySelector<HTMLElement>('.hero__visual')
    const title = scope.querySelector<HTMLElement>('.hero__title')
    if (!visual || !title) return

    const qx = gsap.quickTo(visual, 'x', { duration: 0.9, ease: EASE.soft })
    const qy = gsap.quickTo(visual, 'y', { duration: 0.9, ease: EASE.soft })
    const rx = gsap.quickTo(visual, 'rotateY', { duration: 1, ease: EASE.soft })
    const ry = gsap.quickTo(visual, 'rotateX', { duration: 1, ease: EASE.soft })
    const tx = gsap.quickTo(title, 'x', { duration: 1.2, ease: EASE.soft })

    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      qx(nx * 26)
      qy(ny * 20)
      rx(nx * -8)
      ry(ny * 6)
      tx(nx * -10)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, scope)

  return () => ctx.revert()
}

/**
 * Scroll behaviour for the hero — visual scales/rotates away as the
 * user leaves the section (purposeful: hands attention to section 01).
 */
export function heroScroll(scope: HTMLElement, reduced: boolean) {
  if (reduced) return () => {}

  const ctx = gsap.context(() => {
    gsap.to('.hero__visual', {
      scale: 0.72,
      rotate: 18,
      autoAlpha: 0.25,
      ease: 'none',
      scrollTrigger: {
        trigger: scope,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })
    gsap.to('.hero__title', {
      yPercent: -12,
      autoAlpha: 0.35,
      ease: 'none',
      scrollTrigger: {
        trigger: scope,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })
    gsap.to('.system-diagram .orbit', {
      rotate: 120,
      ease: 'none',
      transformOrigin: '50% 50%',
      svgOrigin: '200 200',
      scrollTrigger: {
        trigger: scope,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })
  }, scope)

  return () => ctx.revert()
}

export { EASE, ScrollTrigger }
