import test from 'node:test'
import assert from 'node:assert/strict'
import { getLensHandoff, getLensProjection, STORY_SCROLL_SCREENS, VIDEO_SCROLL_SCREENS } from '../src/lib/lensHandoff.ts'

test('the film retains its scroll distance and the next section gets a reading pause', () => {
  assert.equal(getLensHandoff(VIDEO_SCROLL_SCREENS).videoProgress, 1)
  assert.equal(getLensHandoff(VIDEO_SCROLL_SCREENS / 2).videoProgress, 0.5)
  const end = getLensHandoff(STORY_SCROLL_SCREENS)
  assert.equal(end.phase, 1)
  assert.equal(end.sceneOpacity, 0)
  assert.equal(getLensProjection(239, 1280, 720, 740, end.cameraScale, end.phase).scale, 1)
  assert.equal(end.arrivalOpacity, 1)
})

test('the camera continues forward and one readable caption survives the handoff', () => {
  let previousScale = 1
  for (let step = 0; step <= 1000; step += 1) {
    const motion = getLensHandoff(step / 1000 * STORY_SCROLL_SCREENS)
    assert.ok(motion.cameraScale >= previousScale)
    previousScale = motion.cameraScale
    const visibleOpacity = motion.arrivalActive ? motion.arrivalOpacity : motion.outgoingOpacity
    assert.ok(visibleOpacity >= 0.5)
    assert.ok(motion.sceneOpacity >= 0 && motion.sceneOpacity <= 1)
  }
})

test('the next heading is already in the distant lens and grows with the decoded film', () => {
  const distant = getLensHandoff(2.9, 190)
  assert.ok(distant.arrivalVisible)
  assert.ok(distant.arrivalOpacity > 0.5)
  assert.equal(distant.sceneOpacity, 1, 'loading a later frame must not fade the lens early')
  let previous = 0
  for (let frame = 180; frame <= 239; frame += 1) {
    const projection = getLensProjection(frame, 1280, 720, 740, 1, 0)
    assert.ok(projection.scale >= previous)
    assert.ok(Math.abs(projection.x - 640) <= 2)
    previous = projection.scale
  }
  assert.ok(getLensProjection(190, 1280, 720, 740, 1, 0).scale < 0.2)
  assert.ok(getLensProjection(220, 1280, 720, 740, 1, 0).scale > 0.5)
})
