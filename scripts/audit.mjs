import { existsSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const URL = process.env.SMOKE_URL || 'http://localhost:5199/'
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find(existsSync)
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const problems = []

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
await page.goto(URL, { waitUntil: 'networkidle2' })
await page.click('.entry__skip').catch(() => {})
await wait(1800)

// Fonts actually loaded?
const fonts = await page.evaluate(async () => {
  await document.fonts.ready
  return ['Space Grotesk Variable', 'Instrument Serif']
    .map((f) => `${f}: ${document.fonts.check(`16px "${f}"`)}`)
})
console.log('fonts:', fonts.join(' | '))

// ---- Hero geometry ----
const hero = await page.evaluate(() => {
  const h1 = document.querySelector('.hero h1')
  const aside = document.querySelector('.hero__aside')
  const vis = document.querySelector('.hero__visual')
  const r = (el) => {
    const b = el.getBoundingClientRect()
    return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }
  }
  const fs = getComputedStyle(h1).fontSize
  const line0 = document.querySelector('.hero__line > span')
  return {
    h1: { ...r(h1), fs, lines: h1.children.length },
    aside: r(aside),
    visual: r(vis),
    lineYs: [0, 1, 2].map((i) => Math.round(h1.children[i].getBoundingClientRect().y)),
    scrollH: document.documentElement.scrollHeight,
  }
})
console.log('hero:', JSON.stringify(hero))

// ---- Lab stages ----
const lab = await page.evaluate(() => {
  const stages = document.querySelectorAll('.demo__stage')
  return Array.from(stages).map((s) => {
    const r = s.getBoundingClientRect()
    const style = getComputedStyle(s)
    return { cls: s.className, h: Math.round(r.height), border: style.borderTopColor }
  })
})
console.log('lab stages:', JSON.stringify(lab))

// ---- Global overflow audit (every element) ----
await page.evaluate(() => window.scrollTo(0, 0))
const over = await page.evaluate(() => {
  const vw = window.innerWidth
  const bad = []
  for (const el of document.querySelectorAll('*')) {
    const r = el.getBoundingClientRect()
    if (r.width > vw + 2 || r.right > vw + 4 || r.left < -4) {
      bad.push({ el: el.tagName + '.' + (el.className || '').toString().slice(0, 40), w: Math.round(r.width), right: Math.round(r.right), left: Math.round(r.left) })
    }
  }
  return bad.slice(0, 25)
})
console.log('overflow candidates:', over.length ? JSON.stringify(over) : 'none')

// Ping each section and check a sample of text nodes for visibility/zero-size.
const check = await page.evaluate(async () => {
  const named = {}
  for (const id of ['top', 'laboratory', 'transformation', 'work', 'techniques', 'contact']) {
    const el = document.getElementById(id)
    if (!el) named[id] = 'MISSING'
    else named[id] = `${Math.round(el.offsetHeight)}px`
  }
  return named
})
console.log('section heights:', JSON.stringify(check))

// Zero-size elements that aren't decorative.
const zero = await page.evaluate(() => {
  const out = []
  for (const el of document.querySelectorAll('img, button, a, h1, h2, h3, h4, p')) {
    const r = el.getBoundingClientRect()
    if (r.width < 2 && r.height < 2 && getComputedStyle(el).display !== 'none') {
      out.push(el.tagName + '.' + (el.className || '').toString().slice(0, 30))
    }
  }
  return out.slice(0, 20)
})
console.log('zero-size:', zero.length ? JSON.stringify(zero) : 'none')

// Scroll through techniques section; make sure canvas has content height.
await page.evaluate(() => document.getElementById('techniques').scrollIntoView({ block: 'center' }))
await wait(700)
const tech = await page.evaluate(() => {
  const stage = document.querySelector('.skills__stage')
  const canvas = document.querySelector('.skills__stage-canvas')
  const r = stage?.getBoundingClientRect()
  return { stage: r && { h: Math.round(r.height), w: Math.round(r.width) }, canvasChildren: canvas?.children.length }
})
console.log('techniques:', JSON.stringify(tech))

await browser.close()
if (problems.length) {
  problems.forEach((p) => console.error(' -', p))
  process.exit(1)
}
console.log('AUDIT DONE')