import test from 'node:test'
import assert from 'node:assert/strict'
import { getOfferRailOffset } from '../src/lib/offerRail.ts'

test('the gallery starts with the first service and finishes with the whole last card visible', () => {
  for (const [travel, stride] of [[1180, 398], [1400, 328], [2300, 584]]) {
    assert.equal(getOfferRailOffset(-1, travel, stride), 0)
    assert.equal(getOfferRailOffset(0, travel, stride), 0)
    assert.equal(getOfferRailOffset(1, travel, stride), travel)
    assert.equal(getOfferRailOffset(2, travel, stride), travel)
  }
  assert.equal(getOfferRailOffset(0.5, 0, 300), 0)
})

test('scrolling through a magnetic stop never reverses or jumps', () => {
  const travel = 1180, stride = 398
  let previous = 0
  for (let frame = 0; frame <= 10000; frame += 1) {
    const current = getOfferRailOffset(frame / 10000, travel, stride)
    assert.ok(current >= previous)
    assert.ok(current - previous < 0.2)
    previous = current
  }
  const stops = Math.ceil(travel / stride)
  for (let index = 1; index < stops; index += 1) {
    const at = index / stops
    assert.equal(getOfferRailOffset(at, travel, stride), index * stride)
    assert.ok(getOfferRailOffset(at + 0.001, travel, stride) - getOfferRailOffset(at - 0.001, travel, stride) < 0.03)
  }
})
