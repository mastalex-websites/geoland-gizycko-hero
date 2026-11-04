import test from 'node:test'
import assert from 'node:assert/strict'
import { createFrameSeeker, frameAtProgress } from '../src/lib/frameSeeker.ts'

class Video extends EventTarget {
  readyState = 2
  seeking = false
  duration = 10
  paused = true
  seeks = []
  time = 0
  get currentTime() { return this.time }
  set currentTime(value) { this.time = value; this.seeks.push(value); this.seeking = true }
  pause() { this.paused = true }
  finishSeek() { this.seeking = false; this.dispatchEvent(new Event('seeked')) }
}

test('scroll positions address all 240 frames and stay inside the clip', () => {
  assert.equal(frameAtProgress(-1, 240), 0)
  assert.equal(frameAtProgress(0, 240), 0)
  assert.equal(frameAtProgress(0.5, 240), 120)
  assert.equal(frameAtProgress(1, 240), 239)
  assert.equal(frameAtProgress(2, 240), 239)
  assert.equal(frameAtProgress(NaN, 240), 0)
})

test('rapid scrolling keeps one seek in flight and then uses only the latest destination', () => {
  const video = new Video(), shown = []
  const seeker = createFrameSeeker(video, { frameCount: 240, fps: 24, onFrame: frame => shown.push(frame) })
  seeker.setProgress(0)
  for (let frame = 1; frame < 240; frame += 1) seeker.setProgress(frame / 239)
  assert.equal(video.seeks.length, 1)
  assert.deepEqual(shown, [], 'captions must wait for a decoded video frame')
  video.finishSeek()
  assert.deepEqual(shown, [0])
  assert.equal(video.seeks.length, 2)
  assert.equal(video.seeks[1], 239.5 / 24)
  assert.ok(video.seeks[1] < video.duration)
  video.finishSeek()
  assert.deepEqual(shown, [0, 239])
  seeker.setProgress(1)
  assert.equal(video.seeks.length, 2, 'the settled frame needs no repeated seeking')
  seeker.destroy()
})

test('loading waits for media data and backtracking replaces a pending destination', () => {
  const video = new Video(), shown = []
  video.readyState = 0
  const seeker = createFrameSeeker(video, { frameCount: 240, fps: 24, onFrame: frame => shown.push(frame) })
  seeker.setProgress(1)
  assert.equal(video.seeks.length, 0)
  video.readyState = 2
  video.dispatchEvent(new Event('loadeddata'))
  assert.equal(video.seeks.length, 1)
  seeker.setProgress(0.5)
  seeker.setProgress(0)
  video.finishSeek()
  assert.deepEqual(shown, [239])
  assert.equal(video.seeks[1], 0.5 / 24)
  video.finishSeek()
  assert.deepEqual(shown, [239, 0])
  seeker.destroy()
})

test('the video stays paused and a disposed controller cannot resume work', () => {
  const video = new Video(), shown = []
  video.paused = false
  const seeker = createFrameSeeker(video, { frameCount: 240, fps: 24, onFrame: frame => shown.push(frame) })
  seeker.setProgress(0.5)
  assert.equal(video.paused, true)
  seeker.destroy()
  video.finishSeek()
  seeker.setProgress(1)
  assert.equal(video.seeks.length, 1)
  assert.deepEqual(shown, [])
})
