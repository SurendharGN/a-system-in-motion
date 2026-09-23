/**
 * Headless QA smoke test (desktop + mobile viewports).
 *
 * Usage:
 *   node scripts/smoke.mjs            # assumes dev server on :5199
 *   SMOKE_URL=http://localhost:5199 node scripts/smoke.mjs
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const URL = process.env.SMOKE_URL || 'http://localhost:5199/'
const CHROME = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find(existsSync)

if (!CHROME) {
  console.error('No Chrome binary found. Set CHROME_PATH.')
  process.exit(1)
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const errors = []

async function runViewport(browser, viewport, label) {
  const page = await browser.newPage()
  await page.setViewport(viewport)
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[${label}] console: ${msg.text()}`)
  })
  page.on('pageerror', (err) => errors.push(`[${label}] pageerror: ${err.message}`))
  page.on('requestfailed', (req) => {
    const url = req.url()
    if (!url.startsWith('data:') && !url.includes('fonts')) {
      errors.push(`[${label}] requestfailed: ${url}`)
    }
  })

  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 })

  // Skip entry for stable screenshots / scroll testing.
  await page.click('.entry__skip').catch(() => {})

  // Allow the hero intro to run.
  await wait(1400)

  const hero = await page.evaluate(() => {
    const h = document.querySelector('.hero__line > span')
    return h ? getComputedStyle(h).transform : 'missing'
  })
  console.log(`[${label}] hero line transform after intro =`, hero !== 'missing' ? 'ok' : '<missing>')

  // Scroll through the whole page in steps; record anomalies.
  const report = await page.evaluate(async () => {
    const info = { height: document.documentElement.scrollHeight, pins: 0 }
    const steps = 24
    for (let i = 1; i <= steps; i++) {
      window.scrollTo(0, (document.documentElement.scrollHeight * i) / steps)
      await new Promise((r) => setTimeout(r, 120))
    }
    document.querySelectorAll('.pin-spacer').forEach((el) => {
      info.pins += 1
    })
    const sections = ['laboratory', 'transformation', 'work', 'techniques', 'contact']
      .map((id) => {
        const el = document.getElementById(id)
        return el ? { id, w: el.offsetWidth, page: document.body.scrollWidth > window.innerWidth + 2 } : { id, w: 0 }
      })
    return { ...info, sections, overflowX: document.documentElement.scrollWidth > window.innerWidth + 2 }
  })
  console.log(`[${label}] scrollHeight=${report.height} pins=${report.pins} overflowX=${report.overflowX}`)
  for (const s of [...report.sections, { id: 'body', page: report.overflowX }]) {
    if (s.page) console.error(`[${label}] HORIZONTAL OVERFLOW near '${s.id}' (offsetWidth=${s.w})`)
  }

  // Keyboard: open menu, walk the techniques tabs with arrow keys.
  if (viewport.width >= 900) {
    await page.click('button.skills__item')
    await wait(400)
    await page.focus('#tab-reveal')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await wait(300)
    const selected = await page.evaluate(
      () => document.querySelector('.skills__item[aria-selected="true"]')?.textContent?.trim().split('\n')[0] || '',
    )
    console.log(`[${label}] tablist arrow selection =`, selected.trim())
  } else {
    await page.click('.nav__toggle').catch(() => {})
    await wait(500)
    const items = await page.$$eval('.menu__link', (els) => els.length)
    console.log(`[${label}] mobile menu links =`, items)
  }

  await page.close()
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu'],
})

try {
  await runViewport(browser, { width: 1440, height: 900 }, 'desktop')
  await runViewport(browser, { width: 390, height: 844, isMobile: true, hasTouch: true }, 'mobile')
} finally {
  await browser.close()
}

if (errors.length) {
  console.error('\nSMOKE FAILURES:')
  errors.forEach((e) => console.error(' -', e))
  process.exit(1)
}
console.log('\nSMOKE OK')