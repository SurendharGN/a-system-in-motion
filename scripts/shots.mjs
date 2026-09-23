import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const URL = process.env.SMOKE_URL || 'http://localhost:5199/'
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'shots')
const shot = (name) => join(OUT, name)
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find(existsSync)
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

mkdirSync(OUT, { recursive: true })
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' })

for (const [label, vp] of [
  ['desktop', { width: 1440, height: 900 }],
  ['mobile', { width: 390, height: 844, isMobile: true, hasTouch: true }],
]) {
  const page = await browser.newPage()
  await page.setViewport(vp)
  await page.goto(URL, { waitUntil: 'networkidle2' })
  await page.click('.entry__skip').catch(() => {})
  await wait(1600)
  await page.screenshot({ path: shot(`${label}-01-hero.png`) })

  const targets = [
    ['laboratory', '02-lab'],
    ['transformation', '03-transform-intro'],
    ['techniques', '06-techniques'],
    ['contact', '07-closing'],
  ]
  for (const [id, name] of targets) {
    await page.evaluate((id) => document.getElementById(id).scrollIntoView({ block: 'start' }), id)
    await wait(900)
    await page.screenshot({ path: shot(`${label}-${name}.png`) })
  }

  // Mid-pin transformation (paper poster composition).
  if (label === 'desktop') {
    await page.evaluate(() => document.getElementById('transformation').scrollIntoView({ block: 'start' }))
    // Scroll past the intro so the pinned stage is active and near its end.
    for (let i = 0; i < 6; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.5))
      await wait(350)
    }
    await wait(600)
    await page.screenshot({ path: shot(`${label}-04-transform-pin.png`) })
  }
  await page.close()
}
await browser.close()
console.log('shots ->', OUT)