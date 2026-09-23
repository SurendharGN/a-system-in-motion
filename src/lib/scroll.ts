import Lenis from 'lenis'

let lenis: Lenis | null = null

export function setLenis(instance: Lenis | null) {
  lenis = instance
}

export function getLenis() {
  return lenis
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return

  if (lenis) {
    lenis.scrollTo(el, { offset: -20, duration: 1.4 })
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Keep keyboard focus with the content we jumped to.
  const previous = document.activeElement as HTMLElement | null
  el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
  el.addEventListener(
    'blur',
    () => {
      el.removeAttribute('tabindex')
      previous?.focus?.({ preventScroll: true })
    },
    { once: true },
  )
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 1.4 })
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}
