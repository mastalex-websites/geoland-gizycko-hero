const clamp = (value: number) => Math.max(0, Math.min(1, value))
const smooth = (value: number) => {
  const position = clamp(value)
  return position * position * (3 - 2 * position)
}

export const VIDEO_SCROLL_SCREENS = 2.6
export const STORY_SCROLL_SCREENS = 4.14
// First frame that is fully black inside the lens; the quote never shows over an earlier one.
const QUOTE_LENS_FRAME = 232
// Quote stages in screens of scroll: it starts on the last frames, grows from the lens, then moves left.
const QUOTE_GROW_START = 2.54
const QUOTE_GROW_END = 3.54
const QUOTE_MOVE_END = 4.04
const QUOTE_FADE_IN = 0.14
const QUOTE_MIN_SCALE = 0.008
const PAGE_WIDTH = 1280
const PAGE_GUTTER = 32

export function getLensHandoff(travel: number, displayedFrame = clamp(travel / VIDEO_SCROLL_SCREENS) * 239) {
  const phase = clamp((travel - VIDEO_SCROLL_SCREENS) / 0.35) * smooth((displayedFrame - 232) / 7)
  const insideLens = displayedFrame >= QUOTE_LENS_FRAME && travel > QUOTE_GROW_START

  return {
    videoProgress: clamp(travel / VIDEO_SCROLL_SCREENS),
    phase,
    cameraScale: 1 + phase * 0.3,
    sceneOpacity: 1 - smooth(phase),
    outgoingOpacity: 1 - smooth((displayedFrame - 182) / 36),
    outgoingShift: smooth((displayedFrame - 176) / 42) * 64,
    descriptionOpacity: 1 - smooth((displayedFrame - 172) / 26),
    arrivalOpacity: insideLens ? clamp((travel - QUOTE_GROW_START) / QUOTE_FADE_IN) : 0,
    arrivalVisible: insideLens,
    arrivalActive: insideLens,
  }
}

export function getQuoteMotion(travel: number, width: number, textWidth: number) {
  // The size changes evenly with the scroll, so the text never rushes at the end of the zoom.
  const grow = smooth((travel - QUOTE_GROW_START) / (QUOTE_GROW_END - QUOTE_GROW_START))
  const move = smooth((travel - QUOTE_GROW_END) / (QUOTE_MOVE_END - QUOTE_GROW_END))
  const restX = Math.max(PAGE_GUTTER, (width - PAGE_WIDTH) / 2 + PAGE_GUTTER) + textWidth / 2

  return {
    x: width / 2 + (restX - width / 2) * move,
    restX,
    scale: QUOTE_MIN_SCALE + (1 - QUOTE_MIN_SCALE) * grow,
    move,
  }
}
