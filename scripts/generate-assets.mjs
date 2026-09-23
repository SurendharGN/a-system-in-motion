/**
 * Generates placeholder SVG artwork for the media configuration.
 * Run once: `node scripts/generate-assets.mjs`
 *
 * These are deliberate, code-drawn placeholders — swap real photography
 * (webp/avif) into the same /public/images paths when available.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = (p) => join(root, 'public', p)

const ACCENT = '#ff4d1c'
const PAPER = '#e7e3d9'
const INK = '#131310'
const BG = '#101013'

const wrap = (body, w = 1600, h = 1100) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${BG}"/>
${body}
</svg>
`

function chromatic() {
  const cells = []
  const cols = 10
  const rows = 8
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const t = ((x + y) % 2) * 0.35 + Math.random() * 0.25
      const size = 120 * (0.5 + Math.random() * 0.5)
      const cx = x * 160 + 80
      const cy = y * 138 + 80
      const fill = t > 0.5 ? ACCENT : '#26262c'
      cells.push(
        `<rect x="${cx - size / 2}" y="${cy - size / 2}" width="${size}" height="${size}" fill="${fill}" opacity="${(0.55 + t * 0.4).toFixed(2)}"/>`,
      )
    }
  }
  return wrap(cells.join('\n'))
}

function kinetic() {
  const bars = []
  for (let i = 0; i < 9; i++) {
    const x = 220 + i * 150
    const h = 260 + Math.sin(i * 1.7) * 180
    const y = 550 - h / 2
    const fill = i === 4 ? ACCENT : i % 3 === 0 ? PAPER : '#2a2a31'
    bars.push(`<rect x="${x}" y="${y}" width="86" height="${h}" fill="${fill}"/>`)
  }
  const text = `<text x="120" y="940" font-family="Georgia, serif" font-style="italic" font-size="220" fill="${PAPER}">TYPE</text>`
  return wrap(bars.join('\n') + '\n' + text)
}

function signal() {
  const wave = []
  const stride = 40
  for (let x = 0; x <= 1600; x += stride) {
    const y = 550 + Math.sin(x * 0.008) * 240 + Math.sin(x * 0.02) * 60
    wave.push(`${x},${y.toFixed(0)}`)
  }
  const grid = []
  for (let y = 120; y < 1100; y += 140) {
    grid.push(`<line x1="0" y1="${y}" x2="1600" y2="${y}" stroke="#202026" stroke-width="2"/>`)
  }
  const poly = `<polygon points="${wave.join(' ')} 1600,1100 0,1100" fill="${ACCENT}" opacity="0.9"/>`
  const line = `<polyline points="${wave.join(' ')}" fill="none" stroke="${PAPER}" stroke-width="6"/>`
  return wrap(grid.join('\n') + '\n' + poly + '\n' + line)
}

function garden() {
  const nodes = []
  const seeds = 26
  const pts = []
  for (let i = 0; i < seeds; i++) {
    const a = Math.random() * Math.PI * 2
    const r = Math.sqrt(Math.random()) * 620 + 60
    pts.push({ x: 800 + Math.cos(a) * r, y: 550 + Math.sin(a) * r })
  }
  const links = []
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)
      if (d < 380) {
        links.push(
          `<line x1="${pts[i].x.toFixed(0)}" y1="${pts[i].y.toFixed(0)}" x2="${pts[j].x.toFixed(0)}" y2="${pts[j].y.toFixed(0)}" stroke="#2a2a31" stroke-width="2"/>`,
        )
      }
    }
  }
  pts.forEach((p, i) => {
    const r = 6 + (i % 5) * 3
    const fill = i % 4 === 0 ? ACCENT : '#3a3a42'
    nodes.push(`<circle cx="${p.x.toFixed(0)}" cy="${p.y.toFixed(0)}" r="${r}" fill="${fill}"/>`)
  })
  return wrap(links.join('\n') + '\n' + nodes.join('\n'))
}

function archive() {
  const els = []
  els.push('<rect x="120" y="140" width="1360" height="4" fill="' + PAPER + '"/>')
  for (let i = 0; i < 9; i++) {
    const y = 260 + i * 92
    const w = 900 - (i % 4) * 120
    const fill = i === 3 ? ACCENT : '#2a2a31'
    els.push(`<rect x="120" y="${y}" width="${w}" height="${i % 3 === 0 ? 64 : 22}" fill="${fill}"/>`)
    els.push(`<text x="${w + 220}" y="${y + 34}" font-family="monospace" font-size="26" fill="#8d8981">A—${String(i + 1).padStart(2, '0')}</text>`)
  }
  return wrap(els.join('\n'))
}

function heroSystem() {
  const rings = [160, 120, 78].map(
    (r, i) =>
      `<circle cx="200" cy="200" r="${r}" fill="none" stroke="${i === 1 ? ACCENT : '#8d8981'}" stroke-width="1.5"/>`,
  )
  const orbit = `<g>
    <circle cx="200" cy="200" r="140" fill="none" stroke="#4a4a52" stroke-width="1"/>
    <circle cx="200" cy="60" r="8" fill="${ACCENT}"/>
  </g>`
  return wrap(rings.join('\n') + '\n' + orbit, 400, 400).replace('width="400" height="400"', 'width="400" height="400" viewBox="0 0 400 400"')
}

function grainTexture() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260">
  <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/></filter>
  <rect width="100%" height="100%" filter="url(#n)" opacity="0.5"/>
</svg>
`
}

const files = {
  'images/hero/hero-system.svg': heroSystem(),
  'images/projects/project-chromatic.svg': chromatic(),
  'images/projects/project-kinetic.svg': kinetic(),
  'images/projects/project-signal.svg': signal(),
  'images/projects/project-garden.svg': garden(),
  'images/projects/project-archive.svg': archive(),
  'images/textures/grain.svg': grainTexture(),
}

const keepDirs = ['videos/hero', 'videos/projects', 'videos/backgrounds', 'fonts']

for (const [rel, content] of Object.entries(files)) {
  const path = out(rel)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
  console.log('write', rel)
}

for (const dir of keepDirs) {
  mkdirSync(out(dir), { recursive: true })
  writeFileSync(join(out(dir), '.gitkeep'), '')
}
console.log('asset tree ready under /public')