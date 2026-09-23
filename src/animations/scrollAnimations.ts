import { gsap, ScrollTrigger, EASE } from '../lib/gsap'

/** Section headers: index + title + note rise in on first view. */
export function sectionHead(scope: Element) {
  const head = scope.querySelector('.section-head')
  if (!head) return

  const items = head.querySelectorAll('.section-head__index, .section-head__title, .section-head__note')
  gsap
    .fromTo(
      items,
      { y: 32, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 1,
        ease: EASE.out,
        stagger: 0.1,
        scrollTrigger: { trigger: head, start: 'top 85%', once: true },
      },
    )
    .eventCallback('onComplete', () => gsap.set(items, { autoAlpha: 1, y: 0 }))
}

/** Magnetic interaction — element eases toward the pointer, capped range. */
export function magnetic(el: HTMLElement, opts: { disabled: boolean; strength?: number }) {
  if (opts.disabled) return () => {}

  const strength = opts.strength ?? 0.35
  let bounds: DOMRect | null = null

  const xTo = gsap.quickTo(el, 'x', { duration: 0.55, ease: EASE.soft })
  const yTo = gsap.quickTo(el, 'y', { duration: 0.55, ease: EASE.soft })

  const refresh = () => {
    bounds = el.getBoundingClientRect()
  }
  const onMove = (e: PointerEvent) => {
    if (!bounds) refresh()
    if (!bounds) return
    const cx = bounds.left + bounds.width / 2
    const cy = bounds.top + bounds.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.hypot(dx, dy)
    const radius = Math.max(bounds.width, bounds.height)
    if (dist > radius) {
      xTo(0)
      yTo(0)
      return
    }
    xTo(gsap.utils.clamp(-28, 28, dx * strength))
    yTo(gsap.utils.clamp(-28, 28, dy * strength))
  }
  const onLeave = () => {
    xTo(0)
    yTo(0)
  }
  const onFocus = () => {
    gsap.to(el, { scale: 1.06, duration: 0.4, ease: EASE.out })
  }
  const onBlur = () => {
    gsap.to(el, { scale: 1, duration: 0.4, ease: EASE.out })
  }

  refresh()
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('scroll', refresh, { passive: true })
  window.addEventListener('resize', refresh)
  el.addEventListener('pointerleave', onLeave)
  el.addEventListener('focus', onFocus)
  el.addEventListener('blur', onBlur)

  return () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('scroll', refresh)
    window.removeEventListener('resize', refresh)
    el.removeEventListener('pointerleave', onLeave)
    el.removeEventListener('focus', onFocus)
    el.removeEventListener('blur', onBlur)
    gsap.set(el, { clearProps: 'transform' })
  }
}

/** Scroll-scrubbed transformation inside a sticky stage. */
export function scrollTransform(scope: HTMLElement, reduced: boolean) {
  if (reduced) return () => {}

  const ctx = gsap.context(() => {
    const frame = scope.querySelector('.scroll-demo__frame')
    const panels = scope.querySelectorAll<HTMLElement>('.scroll-demo__panel')
    const bar = scope.querySelector<SVGPathElement>('.scroll-demo__progress .bar')
    if (!frame) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scope,
        start: 'top 70%',
        end: 'bottom 30%',
        scrub: 0.6,
        onUpdate: (self) => {
          if (bar) bar.style.strokeDashoffset = `${(1 - self.progress) * 100}`
        },
      },
    })

    tl.fromTo(frame, { scale: 0.72, rotate: -14 }, { scale: 1, rotate: 0, ease: 'none' })
      .to(panels[1], { xPercent: 42, rotate: 6, ease: 'none' }, 0)
      .to(panels[2], { xPercent: -40, yPercent: -28, rotate: -8, ease: 'none' }, 0)
      .fromTo(
        frame,
        { clipPath: 'inset(0% 0% 0% 0%)' },
        { clipPath: 'inset(6% 6% 6% 6%)', ease: 'none' },
        0,
      )
      .to(panels[0], { backgroundColor: '#e7e3d9', ease: 'none' }, 0.5)
  }, scope)
  return () => ctx.revert()
}

/** Interactive grid — pointer proximity lights and displaces cells. */
export function interactiveGrid(
  scope: HTMLElement,
  opts: { touch: boolean; reduced: boolean },
) {
  const tiles = Array.from(scope.querySelectorAll<HTMLElement>('.tile'))
  if (!tiles.length) return () => {}

  let raf = 0
  let pointer = { x: -9999, y: -9999 }

  const paint = () => {
    raf = 0
    for (const tile of tiles) {
      const r = tile.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const d = Math.hypot(pointer.x - cx, pointer.y - cy)
      const radius = 140
      const t = Math.max(0, 1 - d / radius)
      const lit = t > 0.55
      tile.classList.toggle('is-lit', lit)
      if (!opts.reduced) {
        const s = 1 + t * 0.35
        tile.style.transform = `scale(${s.toFixed(3)})`
        tile.style.zIndex = t > 0.4 ? '2' : '1'
      }
    }
  }

  const request = () => {
    if (!raf) raf = requestAnimationFrame(paint)
  }

  const onMove = (e: PointerEvent) => {
    pointer = { x: e.clientX, y: e.clientY }
    request()
  }

  const onLeave = () => {
    pointer = { x: -9999, y: -9999 }
    tiles.forEach((tile) => {
      tile.classList.remove('is-lit')
      tile.style.transform = ''
    })
  }

  // Touch: tap lights a radial wave instead of hover tracking.
  const onTouch = (e: TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    pointer = { x: touch.clientX, y: touch.clientY }
    request()
    window.setTimeout(onLeave, 700)
  }

  if (opts.touch || opts.reduced) {
    scope.addEventListener('touchstart', onTouch, { passive: true })
  } else {
    scope.addEventListener('pointermove', onMove, { passive: true })
    scope.addEventListener('pointerleave', onLeave)
  }

  return () => {
    if (raf) cancelAnimationFrame(raf)
    if (opts.touch || opts.reduced) {
      scope.removeEventListener('touchstart', onTouch)
    } else {
      scope.removeEventListener('pointermove', onMove)
      scope.removeEventListener('pointerleave', onLeave)
    }
  }
}

/** Hover/scroll text distortion — per-character distance response. */
export function textDistortion(
  scope: HTMLElement,
  opts: { touch: boolean; reduced: boolean },
) {
  const root = scope.querySelector<HTMLElement>('.distort')
  const chars = Array.from(scope.querySelectorAll<HTMLElement>('.distort__char'))
  if (!root || !chars.length) return () => {}

  if (opts.reduced) return () => {}

  if (opts.touch) {
    // No hover on touch: a gentle wave tied to scroll progress instead.
    const st = gsap.to(chars, {
      y: (i) => (i % 2 ? -10 : 10),
      stagger: { each: 0.04, yoyo: true, repeat: -1 },
      ease: 'sine.inOut',
      duration: 1.1,
      yoyo: true,
      repeat: -1,
    })
    return () => {
      st.kill()
      gsap.set(chars, { clearProps: 'all' })
    }
  }

  let raf = 0
  let px = -9999
  let py = -9999

  const paint = () => {
    raf = 0
    for (const char of chars) {
      const r = char.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const d = Math.hypot(px - cx, py - cy)
      const t = Math.max(0, 1 - d / 170)
      const y = -t * 26
      const rot = (px - cx) * 0.06 * t
      char.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${(1 + t * 0.28).toFixed(3)})`
    }
  }

  const onMove = (e: PointerEvent) => {
    px = e.clientX
    py = e.clientY
    root.classList.add('is-hot')
    if (!raf) raf = requestAnimationFrame(paint)
  }
  const onLeave = () => {
    root.classList.remove('is-hot')
    chars.forEach((c) => (c.style.transform = ''))
  }

  root.addEventListener('pointermove', onMove, { passive: true })
  root.addEventListener('pointerleave', onLeave)

  return () => {
    if (raf) cancelAnimationFrame(raf)
    root.removeEventListener('pointermove', onMove)
    root.removeEventListener('pointerleave', onLeave)
  }
}

/**
 * Pinned "one source, many states" sequence.
 * circle → cell grid → poster panels → typography.
 */
export function visualTransformation(scope: HTMLElement, reduced: boolean) {
  const ctx = gsap.context(() => {
    const stage = scope.querySelector('.transform__stage')
    if (!stage) return

    const cells = stage.querySelectorAll<HTMLElement>('.t-cell')
    const disc = stage.querySelector<HTMLElement>('.t-disc')
    const panels = stage.querySelectorAll<HTMLElement>('.t-panel')
    const typeLines = stage.querySelectorAll<HTMLElement>('.t-type span')
    const steps = scope.querySelectorAll<HTMLElement>('.transform__steps i')

    if (reduced) {
      // Reduced motion: resolve directly to the poster composition.
      gsap.set(panels, { autoAlpha: 1, scale: 1 })
      gsap.set(typeLines, { y: 0 })
      gsap.set([disc, cells], { autoAlpha: 0 })
      return
    }

    const maskHeight = (_i: number, el: Element) =>
      Math.ceil(
        (el.parentElement as HTMLElement | null)?.getBoundingClientRect().height ||
          el.getBoundingClientRect().height,
      )

    // lay cells out in a 3×3 grid (they start stacked under the disc)
    const cell = cells[0]
    const cellSize = (cell?.offsetWidth || 96) as number
    const spacing = cellSize + Math.max(18, cellSize * 0.34)

    cells.forEach((cell, i) => {
      const col = i % 3
      const row = Math.floor(i / 3)
      gsap.set(cell, {
        xPercent: -50,
        yPercent: -50,
        left: '50%',
        top: '50%',
        x: 0,
        y: 0,
        scale: 0.25,
        autoAlpha: 0,
      })
    })

    gsap.set(panels, { autoAlpha: 0, scale: 0.8 })
    gsap.set(typeLines, { y: maskHeight })

    const setStep = (index: number) => {
      steps.forEach((s, i) => s.classList.toggle('is-on', i <= index))
    }

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.transform__pin',
        start: 'top top',
        end: '+=320%',
        pin: '.transform__pin',
        scrub: 0.7,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress
          setStep(p < 0.28 ? 0 : p < 0.55 ? 1 : p < 0.8 ? 2 : 3)
        },
      },
    })

    // 01 — a single source
    tl.fromTo(disc, { scale: 0.35, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1 })
      .to(disc, { scale: 1.15, duration: 0.6 })
      // 02 — it fragments into a grid
      .to(disc, { autoAlpha: 0, scale: 0.5, duration: 0.5 }, 1.4)
      .to(
        cells,
        {
          autoAlpha: 1,
          scale: 1,
          duration: 1,
          stagger: { each: 0.06, from: 'center' },
        },
        1.4,
      )
      // 03 — cells fly into poster panels
      .to(
        cells,
        {
          x: (i: number) => ((i % 3) - 1) * spacing,
          y: (i: number) => (Math.floor(i / 3) - 1) * spacing,
          scale: (i: number) => (i % 4 === 0 ? 1.6 : 1),
          backgroundColor: (i: number) =>
            i === 4 ? '#ff4d1c' : i % 3 === 0 ? '#e7e3d9' : '#131310',
          duration: 1.4,
        },
        2.6,
      )
      .to(cells, { autoAlpha: 0, duration: 0.6 }, 3.6)
      .to(
        panels,
        { autoAlpha: 1, scale: 1, duration: 1, stagger: 0.18 },
        3.7,
      )
      // 04 — typography lands
      .to(typeLines, { y: 0, duration: 1, stagger: 0.2 }, 4.6)
      .to({}, { duration: 0.8 }) // hold
      // Final resolve — the composition must always land visible.
      .set(panels, { autoAlpha: 1, scale: 1 })
      .set(typeLines, { y: 0 })

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, scope)

  return () => ctx.revert()
}

export { EASE, ScrollTrigger }
