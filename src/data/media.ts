/**
 * Central media configuration.
 *
 * Every path below points at a local placeholder SVG in /public/images.
 * Replace the placeholder files with real webp/avif exports (same paths,
 * or update this file only) — components never hardcode asset paths.
 *
 * Missing / placeholder assets:
 *  - images/projects/*.svg  -> replace with project cover photography (1600px wide, webp)
 *  - images/hero/*.svg      -> replace with hero portrait / film still if desired
 *  - images/textures/*      -> optional paper/grain textures
 *  - videos/                -> optional loops (add poster + mp4/webm pairs)
 */
export const media = {
  hero: {
    image: '/images/hero/hero-system.svg',
    alt: 'Abstract system diagram of concentric rings and a moving node',
  },
  projects: {
    chromatic: {
      image: '/images/projects/project-chromatic.svg',
      alt: 'Chromatic Field — gradient cell field poster',
    },
    kinetic: {
      image: '/images/projects/project-kinetic.svg',
      alt: 'Kinetic Type System — stacked letterform poster',
    },
    signal: {
      image: '/images/projects/project-signal.svg',
      alt: 'Signal — waveform and grid poster',
    },
    garden: {
      image: '/images/projects/project-garden.svg',
      alt: 'Machine Garden — generative node cluster poster',
    },
    archive: {
      image: '/images/projects/project-archive.svg',
      alt: 'Archive 01 — editorial index poster',
    },
  },
  textures: {
    grain: '/images/textures/grain.svg',
    paper: '/images/textures/paper.svg',
  },
} as const

export type ProjectMediaKey = keyof typeof media.projects
