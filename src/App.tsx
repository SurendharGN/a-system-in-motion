import { useEffect, useState, Suspense, lazy } from 'react'
import { usePrefersReducedMotion } from './hooks/useMediaQuery'
import { useSmoothScroll, useScrollLock } from './hooks/useSmoothScroll'
import { ScrollTrigger } from './lib/gsap'
import Entry from './components/Entry'
import Navigation from './components/Navigation'
import Grain from './components/Grain'
import CustomCursor from './components/CustomCursor'
import Hero from './components/Hero'
import MotionLab from './components/MotionLab'
import VisualTransformation from './components/VisualTransformation'
import ProjectShowcase from './components/ProjectShowcase'
import Closing from './components/Closing'

// Lazy: heavy interactive modules load just before their section appears.
const SkillDemonstration = lazy(() => import('./components/SkillDemonstration'))

export default function App() {
  const reduced = usePrefersReducedMotion()
  const [entered, setEntered] = useState(reduced)

  useSmoothScroll(entered)
  useScrollLock(!entered)

  // Recalculate pinned positions once the entry overlay releases.
  useEffect(() => {
    if (entered) {
      const t = window.setTimeout(() => ScrollTrigger.refresh(), 350)
      return () => window.clearTimeout(t)
    }
  }, [entered])

  return (
    <>
      <a className="skip-link" href="#laboratory">
        Skip to content
      </a>

      {!entered && <Entry onComplete={() => setEntered(true)} />}

      <Grain />
      <CustomCursor />
      <Navigation />

      <main>
        <Hero play={entered} />
        <MotionLab />
        <VisualTransformation />
        <ProjectShowcase />
        <Suspense fallback={null}>
          <SkillDemonstration />
        </Suspense>
        <Closing />
      </main>
    </>
  )
}