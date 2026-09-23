import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

/** Register GSAP plugins exactly once. */
export function initGsap() {
  if (registered) return
  gsap.registerPlugin(ScrollTrigger)
  registered = true
}

initGsap()

export const EASE = {
  out: 'power3.out',
  inOut: 'power3.inOut',
  soft: 'power2.inOut',
  expo: 'expo.out',
} as const

export { gsap, ScrollTrigger }
