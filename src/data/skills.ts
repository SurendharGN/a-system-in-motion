export type TechniqueId =
  | 'reveal'
  | 'text'
  | 'cursor'
  | 'parallax'
  | 'liquid'
  | 'svg'
  | 'transition'
  | 'type'
  | 'stack'
  | 'scrub'

export type Technique = {
  id: TechniqueId
  num: string
  label: string
  note: string
}

/** Interactive skill demonstrations shown in the techniques section. */
export const techniques: Technique[] = [
  { id: 'reveal', num: '01', label: 'Image reveal', note: 'Mask / clip-path' },
  { id: 'text', num: '02', label: 'Text animation', note: 'Staggered lines' },
  { id: 'cursor', num: '03', label: 'Cursor interaction', note: 'Pointer field' },
  { id: 'parallax', num: '04', label: 'Parallax', note: 'Layered depth' },
  { id: 'liquid', num: '05', label: 'Liquid distortion', note: 'SVG displacement' },
  { id: 'svg', num: '06', label: 'SVG animation', note: 'Path drawing' },
  { id: 'transition', num: '07', label: 'Page transition', note: 'Panel wipe' },
  { id: 'type', num: '08', label: 'Interactive typography', note: 'Pointer tracking' },
  { id: 'stack', num: '09', label: '3D movement', note: 'CSS perspective' },
  { id: 'scrub', num: '10', label: 'Scroll animation', note: 'Scrubbed timeline' },
]
