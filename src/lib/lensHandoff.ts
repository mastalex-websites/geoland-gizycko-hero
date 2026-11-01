const clamp = (value: number) => Math.max(0, Math.min(1, value))
const smooth = (value: number) => {
  const position = clamp(value)
  return position * position * (3 - 2 * position)
}

// Optical centre and inner glass radius in the supplied 1280 × 720 frames.
// Interpolating the radius geometrically keeps the type on the camera's axis.
const LENS = [
  { frame: 170, x: 640, y: 293, radius: 22 },
  { frame: 180, x: 641, y: 304, radius: 34 },
  { frame: 190, x: 641, y: 316, radius: 61 },
  { frame: 200, x: 638, y: 331, radius: 112 },
  { frame: 210, x: 641, y: 342, radius: 219 },
  { frame: 220, x: 639, y: 350, radius: 410 },
  { frame: 230, x: 639, y: 357, radius: 815 },
  { frame: 239, x: 640, y: 360, radius: 1610 },
]

export const VIDEO_SCROLL_SCREENS = 2.6
export const STORY_SCROLL_SCREENS = 3.4

export function getLensHandoff(travel: number, displayedFrame = clamp(travel / VIDEO_SCROLL_SCREENS) * 239) {
  const phase = clamp((travel - VIDEO_SCROLL_SCREENS) / 0.35) * smooth((displayedFrame - 232) / 7)
  const preview = smooth((displayedFrame - 176) / 20)

  return {
    videoProgress: clamp(travel / VIDEO_SCROLL_SCREENS),
    phase,
    cameraScale: 1 + phase * 0.3,
    sceneOpacity: 1 - smooth(phase),
    outgoingOpacity: 1 - smooth((displayedFrame - 182) / 36),
    outgoingShift: smooth((displayedFrame - 176) / 42) * 64,
    descriptionOpacity: 1 - smooth((displayedFrame - 172) / 26),
    arrivalOpacity: preview * (0.85 + 0.15 * smooth((displayedFrame - 196) / 43)),
    arrivalVisible: preview > 0,
    arrivalActive: displayedFrame >= 200,
  }
}

export function getLensProjection(frame: number, width: number, height: number, textWidth: number, cameraScale: number, phase: number) {
  const position = Math.max(170, Math.min(239, frame))
  const next = LENS.findIndex((key) => key.frame >= position)
  const end = LENS[next]
  const start = LENS[Math.max(0, next - 1)]
  const blend = start === end ? 0 : (position - start.frame) / (end.frame - start.frame)
  const cover = Math.max(width / 1280, height / 720)
  const x = (start.x + (end.x - start.x) * blend - 640) * cover
  const y = (start.y + (end.y - start.y) * blend - 360) * cover
  const radius = start.radius * Math.pow(end.radius / start.radius, blend) * cover
  const projectedWidth = radius * 1.45
  const distantScale = projectedWidth / (projectedWidth + Math.max(1, textWidth) * 0.7)
  const settle = smooth(phase)

  return {
    x: width / 2 + x * cameraScale * (1 - settle),
    y: height / 2 + y * cameraScale * (1 - settle),
    scale: distantScale + (1 - distantScale) * settle,
  }
}
