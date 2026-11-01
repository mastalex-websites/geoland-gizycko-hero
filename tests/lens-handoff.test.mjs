import test from 'node:test'
import assert from 'node:assert/strict'
import { getLensHandoff, getQuoteMotion, STORY_SCROLL_SCREENS, VIDEO_SCROLL_SCREENS } from '../src/lib/lensHandoff.ts'

test('the film retains its scroll distance and the next section gets a reading pause', () => {
  assert.equal(getLensHandoff(VIDEO_SCROLL_SCREENS).videoProgress, 1)
  assert.equal(getLensHandoff(VIDEO_SCROLL_SCREENS / 2).videoProgress, 0.5)
  const end = getLensHandoff(STORY_SCROLL_SCREENS)
  assert.equal(end.phase, 1)
  assert.equal(end.sceneOpacity, 0)
  assert.equal(getQuoteMotion(STORY_SCROLL_SCREENS, 1440, 740).scale, 1)
  assert.equal(end.arrivalOpacity, 1)
})

test('the camera continues forward and the quote waits for the black inside of the lens', () => {
  let previousScale = 1
  for (let step = 0; step <= 1000; step += 1) {
    const travel = step / 1000 * STORY_SCROLL_SCREENS
    const motion = getLensHandoff(travel)
    assert.ok(motion.cameraScale >= previousScale)
    previousScale = motion.cameraScale
    assert.ok(motion.sceneOpacity >= 0 && motion.sceneOpacity <= 1)
    if (travel / VIDEO_SCROLL_SCREENS * 239 < 232) assert.equal(motion.arrivalVisible, false)
  }
})

test('a lagging film holds the quote back, then it grows from the lens and moves left', () => {
  const lagging = getLensHandoff(3.2, 190)
  assert.equal(lagging.arrivalVisible, false)
  assert.equal(lagging.arrivalOpacity, 0)
  assert.equal(lagging.sceneOpacity, 1, 'loading a later frame must not fade the lens early')
  assert.ok(getLensHandoff(2.59, 238).arrivalOpacity > 0)
  let previous = 0
  for (let travel = 2.54; travel <= 3.54; travel += 0.01) {
    const quote = getQuoteMotion(travel, 1440, 740)
    assert.ok(quote.scale >= previous)
    assert.equal(quote.x, 720, 'the zoom stays on the axis of the lens')
    previous = quote.scale
  }
  assert.ok(getQuoteMotion(2.54, 1440, 740).scale < 0.01)
  const settled = getQuoteMotion(4.04, 1440, 740)
  assert.equal(settled.x, 112 + 370, 'the quote ends on the left edge of the page')
  assert.equal(settled.move, 1)
})
