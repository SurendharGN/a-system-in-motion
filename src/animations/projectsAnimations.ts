import { gsap, ScrollTrigger, EASE } from '../lib/gsap'

/**
 * Horizontal showcase.
 * Desktop: the track is pinned and scrubbed horizontally; each panel's
 * visual and title reveal inside the container timeline.
 * Mobile / reduced motion: panels stack; simple one-shot reveals.
 */
export function projectsShowcase(scope: HTMLElement, reduced: boolean) {
  const ctx = gsap.context(() => {
    const viewport = scope.querySelector<HTMLElement>('.projects__viewport')
    const track = scope.querySelector<HTMLElement>('.projects__track')
    const panels = scope.querySelectorAll<HTMLElement>('.panel')
    if (!viewport || !track || !panels.length) return

    const isHorizontal = () =>
      !reduced &&
      window.matchMedia('(min-width: 900px)').matches &&
      track.scrollWidth > viewport.clientWidth + 1

    if (!isHorizontal()) {
      // Mobile / reduced: reveal panels as they enter.
      gsap.fromTo(
        panels,
        { y: 60, autoAlpha: 0.4 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1.1,
          ease: EASE.out,
          stagger: 0.15,
          scrollTrigger: { trigger: viewport, start: 'top 78%', once: true },
        },
      )
      gsap.fromTo(
        scope.querySelectorAll('.panel__visual img'),
        { clipPath: 'inset(0% 0% 100% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.2,
          ease: EASE.out,
          stagger: 0.1,
          scrollTrigger: { trigger: viewport, start: 'top 78%', once: true },
        },
      )
      return
    }

    const tl = gsap.to(track, {
      x: () => -(track.scrollWidth - viewport.clientWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: viewport,
        start: 'top top',
        end: () => `+=${track.scrollWidth - viewport.clientWidth}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    })

    // Container-relative reveals per panel.
    panels.forEach((panel) => {
      const img = panel.querySelector<HTMLElement>('.panel__visual img')
      const title = panel.querySelector<HTMLElement>('.panel__title')
      const head = panel.querySelector<HTMLElement>('.panel__head')

      if (img) {
        gsap.fromTo(
          img,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 2.4,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tl,
              start: 'left 92%',
              end: 'left 30%',
              scrub: true,
            },
          },
        )
      }
      if (title) {
        gsap.fromTo(
          title,
          { yPercent: 60, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 1.4,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tl,
              start: 'left 75%',
              end: 'left 28%',
              scrub: true,
            },
          },
        )
      }
      if (head) {
        gsap.fromTo(
          head,
          { autoAlpha: 0, y: 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tl,
              start: 'left 85%',
              end: 'left 40%',
              scrub: true,
            },
          },
        )
      }
    })

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, scope)

  return () => ctx.revert()
}

export { EASE, ScrollTrigger }