import { useEffect, useRef, useState } from 'react'
import { projects } from '../data/projects'
import { media } from '../data/media'
import { usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { projectsShowcase } from '../animations/projectsAnimations'
import { sectionHead } from '../animations/scrollAnimations'

/** Project cover with graceful fallback if the asset is missing. */
function PanelVisual({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="panel__visual">
      {failed ? (
        <div className="panel__visual-fallback">
          Replace placeholder — /{src.replace(/^\//, '')}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}

export default function ProjectShowcase() {
  const rootRef = useRef<HTMLElement | null>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (!rootRef.current) return
    const root = rootRef.current

    sectionHead(root)
    return projectsShowcase(root, reduced)
  }, [reduced])

  return (
    <section
      ref={rootRef}
      className="section projects"
      id="work"
      aria-labelledby="work-title"
    >
      <div className="shell">
        <header className="section-head">
          <span className="section-head__index" aria-hidden="true">
            03
          </span>
          <div className="section-head__body">
            <h2 id="work-title" className="section-head__title">
              Selected <em>work</em>
            </h2>
            <p className="section-head__note">
              Studies in interaction, motion and identity. Scroll to pull the
              chapter sideways.
            </p>
          </div>
        </header>
      </div>

      <div className="projects__viewport">
        <div className="projects__track">
          {projects.map((project) => {
            const item = media.projects[project.mediaKey]
            return (
              <article key={project.id} className="panel" aria-label={project.title}>
                <div className="panel__head">
                  <span className="panel__index">{project.index}</span>
                  <span className="panel__category">{project.category}</span>
                </div>

                <div className="panel__body">
                  <PanelVisual src={item.image} alt={item.alt} />

                  <div className="panel__info">
                    <h3 className="panel__title">
                      {project.title} <em>{project.titleAccent}</em>
                    </h3>
                    <p className="panel__desc">{project.description}</p>
                    <ul className="panel__tags">
                      {project.tags.map((tag) => (
                        <li key={tag} className="panel__tag">
                          {tag}
                        </li>
                      ))}
                    </ul>
                    {project.url && (
                      <a
                        className="panel__link"
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View project
                      </a>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}