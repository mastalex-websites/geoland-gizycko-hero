import test from 'node:test'
import assert from 'node:assert/strict'
import { getStoryState } from '../src/lib/storyProgress.ts'

test('the entire journey always has a readable caption', () => {
  for (let sample = 0; sample <= 1000; sample += 1) {
    const { activeStage, opacities } = getStoryState(sample / 1000)
    assert.ok(Math.max(...opacities) >= 0.499999, `blank caption at ${sample / 1000}`)
    assert.ok(opacities[activeStage] >= 0.499999, `active caption hidden at ${sample / 1000}`)
    assert.ok(Math.abs(opacities.reduce((sum, value) => sum + value, 0) - 1) < 1e-9)
    assert.ok(opacities.every((opacity) => opacity >= 0 && opacity <= 1))
    const visible = opacities.map((opacity, index) => opacity > 0 ? index : -1).filter((index) => index >= 0)
    assert.ok(visible.length <= 2)
    if (visible.length === 2) assert.equal(visible[1] - visible[0], 1)
  }
})

test('the introduction and contact remain visible at the journey endpoints', () => {
  assert.deepEqual(getStoryState(0), { activeStage: 0, opacities: [1, 0, 0, 0] })
  assert.deepEqual(getStoryState(1), { activeStage: 3, opacities: [0, 0, 0, 1] })
  assert.equal(getStoryState(-1).activeStage, 0)
  assert.equal(getStoryState(2).activeStage, 3)
})

test('crossfades transfer the active caption at each transition', () => {
  for (const [index, boundary] of [0.25, 0.5, 0.75].entries()) {
    assert.equal(getStoryState(boundary - 0.001).activeStage, index)
    assert.equal(getStoryState(boundary + 0.001).activeStage, index + 1)
  }
})
