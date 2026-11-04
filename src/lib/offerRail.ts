export function getOfferRailOffset(progress: number, travel: number, stride: number) {
  if (travel <= 0 || stride <= 0) return 0
  const stops = Math.ceil(travel / stride)
  const position = Math.max(0, Math.min(1, progress)) * stops
  const index = Math.min(Math.floor(position), stops - 1)
  const fraction = position - index
  const ease = fraction * fraction * (3 - 2 * fraction)
  const start = index * stride
  return start + (Math.min(travel, start + stride) - start) * ease
}
