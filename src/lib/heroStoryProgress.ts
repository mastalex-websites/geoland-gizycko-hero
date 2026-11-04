const TRANSITIONS = [0.25, 0.5]
const BLEND_HALF_WIDTH = 0.04

export function getStoryState(progress: number) {
  const position = Math.max(0, Math.min(1, progress))
  const activeStage = TRANSITIONS.filter((boundary) => position >= boundary).length
  const opacities = [0, 0, 0]

  for (let index = 0; index < TRANSITIONS.length; index += 1) {
    const start = TRANSITIONS[index] - BLEND_HALF_WIDTH
    const end = TRANSITIONS[index] + BLEND_HALF_WIDTH
    if (position >= start && position <= end) {
      const blend = (position - start) / (end - start)
      opacities[index] = 1 - blend
      opacities[index + 1] = blend
      return { activeStage, opacities }
    }
  }

  opacities[activeStage] = 1
  return { activeStage, opacities }
}
