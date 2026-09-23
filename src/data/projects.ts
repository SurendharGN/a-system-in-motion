import { media } from './media'
import type { ProjectMediaKey } from './media'

export type Project = {
  id: string
  index: string
  title: string
  titleAccent: string
  category: string
  year: string
  description: string
  tags: string[]
  mediaKey: ProjectMediaKey
  /** Optional external link — leave null when unavailable. */
  url: string | null
}

/**
 * Placeholder showcase data (no real clients or metrics).
 * Replace with actual projects when available.
 */
export const projects: Project[] = [
  {
    id: 'chromatic-field',
    index: '01',
    title: 'Chromatic',
    titleAccent: 'Field',
    category: 'Interaction Design',
    year: '—',
    description:
      'A cursor-reactive colour field where cells bloom, decay and hand energy to their neighbours. Built to study proximity-based feedback without a single page reload.',
    tags: ['Pointer physics', 'Canvas', 'Easing systems'],
    mediaKey: 'chromatic',
    url: null,
  },
  {
    id: 'kinetic-type-system',
    index: '02',
    title: 'Kinetic',
    titleAccent: 'Type',
    category: 'Motion Design',
    year: '—',
    description:
      'A modular type system where every letterform is an animated component — clip reveals, per-character timelines and scroll-bound sequences driven by one timeline grammar.',
    tags: ['GSAP timelines', 'Clip reveals', 'Type systems'],
    mediaKey: 'kinetic',
    url: null,
  },
  {
    id: 'signal',
    index: '03',
    title: 'Signal',
    titleAccent: 'Website',
    category: 'Website Design',
    year: '—',
    description:
      'An editorial website structured like a broadcast: full-bleed chapters, horizontal evidence panels and transitions that behave like channel changes.',
    tags: ['Art direction', 'Scroll chapters', 'Editorial layout'],
    mediaKey: 'signal',
    url: null,
  },
  {
    id: 'machine-garden',
    index: '04',
    title: 'Machine',
    titleAccent: 'Garden',
    category: 'AI Product Design',
    year: '—',
    description:
      'A product interface for steering generative systems — state previews, layered controls and feedback that makes probabilistic output feel legible.',
    tags: ['Product UI', 'State design', 'Prototyping'],
    mediaKey: 'garden',
    url: null,
  },
  {
    id: 'archive-01',
    index: '05',
    title: 'Archive',
    titleAccent: '01',
    category: 'Brand Identity',
    year: '—',
    description:
      'A living identity for a fictional archive: a grid that re-composes itself, mark logic that scales from favicon to facade, motion rules written into the system.',
    tags: ['Identity systems', 'Grid logic', 'Motion rules'],
    mediaKey: 'archive',
    url: null,
  },
]
