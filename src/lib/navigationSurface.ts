const clamp = (value: number) => Math.max(0, Math.min(1, value))

function luminance(rgb: number[]) {
  return rgb.reduce((sum, channel, index) => {
    const value = channel / 255
    const linear = value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    return sum + linear * [0.2126, 0.7152, 0.0722][index]
  }, 0)
}

export function getNavigationSurface(contactTop: number, headerHeight: number) {
  const position = clamp(1 - contactTop / Math.max(1, headerHeight + 24))
  const mix = position * position * (3 - 2 * position)
  const background = [228, 226, 216].map((channel) => Math.round(21 + (channel - 21) * mix))
  const lightness = luminance(background)
  const blackContrast = (lightness + 0.05) / 0.05
  const whiteContrast = 1.05 / (lightness + 0.05)
  const tone = blackContrast >= whiteContrast ? 'light' : 'dark'
  const ink = tone === 'light' ? 0 : 255
  const baseMuted = tone === 'light' ? 111 : 204
  let mutedInk = baseMuted

  // Preserve the page palette at either end, increasing contrast at mid-tones.
  for (let step = 0; step <= 20; step += 1) {
    mutedInk = Math.round(baseMuted + (ink - baseMuted) * step / 20)
    const mutedLightness = luminance([mutedInk, mutedInk, mutedInk])
    const contrast = (Math.max(lightness, mutedLightness) + 0.05) / (Math.min(lightness, mutedLightness) + 0.05)
    if (contrast >= 3) break
  }

  return { background, tone, ink, mutedInk, transitioning: position > 0 && position < 1 }
}
