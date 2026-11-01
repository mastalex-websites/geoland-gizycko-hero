import test from 'node:test'
import assert from 'node:assert/strict'
import { getNavigationSurface } from '../src/lib/navigationSurface.ts'

const luminance = (rgb) => rgb.map((channel) => {
  const value = channel / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0)

test('the header matches the surrounding dark and contact sections', () => {
  assert.deepEqual(getNavigationSurface(200, 82).background, [21, 21, 21])
  assert.equal(getNavigationSurface(200, 82).tone, 'dark')
  assert.deepEqual(getNavigationSurface(0, 82).background, [228, 226, 216])
  assert.equal(getNavigationSurface(0, 82).tone, 'light')
  assert.deepEqual(getNavigationSurface(-100, 82).background, [228, 226, 216])
})

test('one pixel of scroll cannot trigger a full backdrop switch, in either direction', () => {
  for (const height of [64, 82, 88, 100]) {
    let previous = getNavigationSurface(height + 25, height)
    for (let top = height + 24; top >= -1; top -= 1) {
      const current = getNavigationSurface(top, height)
      current.background.forEach((value, index) => {
        assert.ok(value >= previous.background[index])
        assert.ok(value - previous.background[index] <= 4)
      })
      previous = current
    }
  }
})

test('navigation ink stays readable throughout the colour transition', () => {
  for (let top = -10; top <= 150; top += 0.5) {
    const { background, tone } = getNavigationSurface(top, 82)
    const lightness = luminance(background)
    const contrast = tone === 'light' ? (lightness + 0.05) / 0.05 : 1.05 / (lightness + 0.05)
    assert.ok(contrast >= 4.5, `insufficient contrast at contact position ${top}`)
    const { mutedInk } = getNavigationSurface(top, 82)
    const mutedLightness = luminance([mutedInk, mutedInk, mutedInk])
    const mutedContrast = (Math.max(mutedLightness, lightness) + 0.05) / (Math.min(mutedLightness, lightness) + 0.05)
    assert.ok(mutedContrast >= 3, `insufficient secondary link contrast at ${top}`)
  }
})
