import test from 'node:test'
import assert from 'node:assert/strict'
import { getNavigationSurface } from '../src/lib/navigationSurface.ts'

test('cream starts at the actual contact edge, with no early fade', () => {
  for (const height of [64, 82, 88, 100]) {
    assert.equal(getNavigationSurface(height + 24, height).boundary, height)
    assert.equal(getNavigationSurface(Infinity, height).boundary, height)
    assert.equal(getNavigationSurface(0, height).boundary, 0)
    assert.equal(getNavigationSurface(-100, height).boundary, 0)
  }
})

test('the boundary follows fractional scroll positions equally in both directions', () => {
  for (const height of [64, 82, 88, 100]) {
    const positions = Array.from({ length: height * 4 + 1 }, (_, index) => index / 4)
    for (const top of [...positions, ...positions.reverse()]) {
      assert.equal(getNavigationSurface(top, height).boundary, top)
    }
  }
})

test('resizing keeps the section boundary aligned and clamps it to the header', () => {
  for (const height of [64, 82, 88, 100]) {
    assert.equal(getNavigationSurface(42.75, height).boundary, 42.75)
    assert.equal(getNavigationSurface(90, height).boundary, Math.min(90, height))
  }
})
