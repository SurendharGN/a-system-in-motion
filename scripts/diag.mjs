import { existsSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const URL = process.env.SMOKE_URL || 'http://localhost:5199/'
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find(existsSync)
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto(URL, { waitUntil: 'networkidle2' })

// Let the ENTRY play out untouched.
console.log('entry visible at load:', await page.evaluate(() => Boolean(document.querySelector('.entry'))))
for (let i = 0; i < 16; i++) {
  await wait(500)
  const entry = await page.evaluate(() => Boolean(document.querySelector('.entry')))
  if (!entry) { console.log('entry cleared after ~' + (i + 1) * 0.5 + 's'); break }
}
await wait(1600) // let hero intro finish

const hero = await page.evaluate(() => {
  const out = {}
  const grab = (sel, props) => {
    const el = document.querySelector(sel)
    if (!el) { out[sel] = 'MISSING'; return }
    const s = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    out[sel] = {
      visible: r.width > 1 && r.height > 1 && s.display !== 'none' && s.visibility !== 'hidden',
      opacity: s.opacity,
      transform: s.transform,
      color: s.color,
      y: Math.round(r.y), h: Math.round(r.height),
      text: (el.textContent || '').slice(0, 32),
    }
  }
  grab('.hero__title', [])
  grab('.hero__line:nth-child(1) > span', [])
  grab('.hero__line:nth-child(2) > span', [])
  grab('.hero__line:nth-child(3) > span', [])
  grab('.hero__meta', [])
  grab('.hero__aside', [])
  grab('.hero__bottom', [])
  grab('.hero__visual', [])
  const bodyBg = getComputedStyle(document.body).backgroundColor
  const heroEl = document.querySelector('.hero')
  const heroR = heroEl.getBoundingClientRect()
  return { ...out, bodyBg, heroY: Math.round(heroR.y), heroH: Math.round(heroR.height) }
})
console.log(JSON.stringify(hero, null, 1))

// Screenshot top 900px and report light-pixel ratio per horizontal band.
await page.screenshot({ path: 'hero-diag.png' })
await browser.close()