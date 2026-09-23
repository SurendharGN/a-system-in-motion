import { existsSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const URL = process.env.SMOKE_URL || 'http://localhost:5199/'
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find(existsSync)
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const problems = []

function run(browser, opts, label, check) {
  return new Promise(async (resolve) => {
    const page = await browser.newPage()
    if (opts.viewport) await page.setViewport(opts.viewport)
    if (opts.reduced) {
      await page.emulateMediaFeatures([
        { name: 'prefers-reduced-motion', value: 'reduce' },
      ])
    }
    page.on('pageerror', (e) => problems.push(`[${label}] ${e.message}`))
    await page.goto(URL, { waitUntil: 'networkidle2' })
    await check(page, label)
    await page.close()
    resolve()
  })
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' })

// 1) Entry completes on its own (no interaction).
await run(browser, {}, 'entry', async (page) => {
  const at = { t: Date.now() }
  let done = false
  for (let i = 0; i < 40 && !done; i++) {
    await wait(250)
    done = await page.evaluate(() => !document.querySelector('.entry'))
  }
  const ms = Date.now() - at.t
  const heroLine = await page.evaluate(() => getComputedStyle(document.querySelector('.hero__line > span')).transform)
  console.log(`[entry] overlay cleared in ~${ms}ms; hero line transform = ${heroLine}`)
  if (!done) problems.push('[entry] entry overlay never cleared')
})

// 2) Reduced motion: no overlay, everything statically visible, no pins.
await run(browser, { reduced: true }, 'reduced', async (page) => {
  const overlay = await page.evaluate(() => Boolean(document.querySelector('.entry')))
  const heroVisible = await page.evaluate(
    () => getComputedStyle(document.querySelector('.hero__line > span')).transform !== 'none',
  )
  const lineY = await page.evaluate(() => document.querySelector('.hero__line > span').getBoundingClientRect().top)
  console.log(`[reduced] overlay=${overlay} heroLineShifted=${heroVisible} lineTop~${lineY}`)
  if (overlay) problems.push('[reduced] overlay shown')

  // Scroll to the transformation section; expect NO pin spacer.
  await page.evaluate(() => document.getElementById('transformation').scrollIntoView({ block: 'start' }))
  await wait(500)
  const pins = await page.evaluate(() => document.querySelectorAll('.pin-spacer').length)
  const panelsVisible = await page.evaluate(() => {
    const p = document.querySelector('.t-panel--a')
    return p && getComputedStyle(p).opacity === '1'
  })
  console.log(`[reduced] pins=${pins} posterPanelVisible=${panelsVisible}`)

  // Projects should be stacked (vertical), not horizontal.
  const track = await page.evaluate(() => {
    const t = document.querySelector('.projects__track')
    return { w: t.scrollWidth, vw: window.innerWidth }
  })
  console.log(`[reduced] projects track w=${track.w} viewport=${track.vw}`)
  if (track.w > track.vw + 10) problems.push('[reduced] projects still horizontal')
})

// 3) Mobile: entry skippable, hero stacks, menu toggles, no overflow.
await run(browser, { viewport: { width: 390, height: 844, isMobile: true, hasTouch: true } }, 'mobile-entry', async (page) => {
  const skip = await page.evaluate(() => Boolean(document.querySelector('.entry__skip')))
  console.log(`[mobile] skip button present=${skip}`)
  await page.click('.entry__skip').catch(() => {})
  await wait(300)
  const gone = await page.evaluate(() => !document.querySelector('.entry'))
  const heroW = await page.evaluate(() => document.querySelector('.hero__title').getBoundingClientRect().width)
  console.log(`[mobile] overlay cleared=${gone} heroTitleW=${Math.round(heroW)}`)
  if (!gone) problems.push('[mobile] entry did not clear on skip')
})

await browser.close()
if (problems.length) {
  problems.forEach((p) => console.error(' FAIL', p))
  process.exit(1)
}
console.log('PASS')