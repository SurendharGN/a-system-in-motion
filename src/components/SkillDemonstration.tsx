import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { techniques } from '../data/skills'
import { sectionHead } from '../animations/scrollAnimations'
import { useInView } from '../hooks/useInView'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { stageComponents } from './SkillStages'

/**
 * Interactive technique index: pick a technique, watch the canvas
 * demonstrate it. Fully usable with keyboard (tablist behaviour).
 */
export default function SkillDemonstration() {
  const rootRef = useRef<HTMLElement | null>(null)
  const [activeId, setActiveId] = useState<(typeof techniques)[number]['id']>(
    'reveal',
  )
  const activeIndex = techniques.findIndex((t) => t.id === activeId)
  const { ref: canvasRef, inView } = useInView<HTMLDivElement>(0.2)
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    if (rootRef.current) sectionHead(rootRef.current)
  }, [])

  const Stage = stageComponents[activeId]

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      const next = techniques[(activeIndex + 1) % techniques.length]
      setActiveId(next.id)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = techniques[(activeIndex - 1 + techniques.length) % techniques.length]
      setActiveId(prev.id)
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActiveId(techniques[0].id)
    } else if (e.key === 'End') {
      e.preventDefault()
      setActiveId(techniques[techniques.length - 1].id)
    }
  }

  return (
    <section
      ref={(el) => {
        rootRef.current = el
      }}
      className="section skills"
      id="techniques"
      aria-labelledby="skills-title"
    >
      <div className="shell">
        <header className="section-head">
          <span className="section-head__index" aria-hidden="true">
            04
          </span>
          <div className="section-head__body">
            <h2 id="skills-title" className="section-head__title">
              Technique <em>index</em>
            </h2>
            <p className="section-head__note">
              A living catalogue of the tools I reach for. Select a technique —
              the canvas will demonstrate it.
            </p>
          </div>
        </header>

        <div className="skills__layout">
          <div
            role="tablist"
            aria-label="Techniques"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
            className="skills__list"
          >
            {techniques.map((technique, i) => (
              <button
                key={technique.id}
                type="button"
                role="tab"
                id={`tab-${technique.id}`}
                aria-selected={activeId === technique.id}
                aria-controls="skills-canvas"
                tabIndex={activeId === technique.id ? 0 : -1}
                className="skills__item"
                onClick={() => setActiveId(technique.id)}
              >
                <span className="skills__item-num">{technique.num}</span>
                <span className="skills__item-label">{technique.label}</span>
                <span className="skills__item-dot" aria-hidden="true" />
              </button>
            ))}
          </div>

          <div
            ref={canvasRef}
            id="skills-canvas"
            className="skills__stage"
            role="tabpanel"
            aria-labelledby={`tab-${activeId}`}
          >
            <div className="skills__stage-bar" aria-hidden="true">
              <span>Demo — {techniques[activeIndex]?.label}</span>
              <span>{techniques[activeIndex]?.note}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                className="skills__stage-canvas"
                initial={{ opacity: 0, scale: 0.985, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.985, y: -14 }}
                transition={{ duration: reduced ? 0 : 0.32, ease: 'easeOut' }}
              >
                <Stage running={inView} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}