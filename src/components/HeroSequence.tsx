import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { getStoryState } from '../lib/heroStoryProgress'
import { getLensHandoff, getQuoteMotion, VIDEO_SCROLL_SCREENS } from '../lib/lensHandoff'

const FRAME_COUNT = 240
const CACHE_LIMIT = 24
const CONCURRENT_LOADS = 4
const REDUCED_MOTION_STEPS = 12
// The lens begins filling the frame at 8 s; clear the mist before entering it.
const LENS_ENTRY_START = 192
const LENS_ENTRY_END = 204
const frameUrl = (index: number) => `${import.meta.env.BASE_URL}media/frames/frame-${String(index).padStart(4, '0')}.webp`

export default function HeroSequence({ containerRef }: { containerRef: RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d', { alpha: false })
    if (!container || !canvas || !context) return

    let disposed = false
    let animationFrame = 0
    let target = 0
    let lastTarget = 0
    let lastActiveStage = -1
    let activeLoads = 0
    let queue: number[] = []
    let viewportWidth = 0
    let viewportHeight = 0
    let sceneTravel = 0
    let displayedFrame = 0
    let previousTick = 0
    const cache = new Map<number, HTMLImageElement>()
    const loading = new Map<number, HTMLImageElement>()
    const failed = new Set<number>()
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const storyPanels = [...container.querySelectorAll<HTMLElement>('[data-story-panel]')]
    const arrival = container.querySelector<HTMLElement>('.lens-arrival')
    const arrivalCopy = container.querySelector<HTMLElement>('.lens-arrival-copy')
    const arrivalLines = [...container.querySelectorAll<HTMLElement>('.lens-arrival .opening-line')]
    const hero = container.querySelector<HTMLElement>('.hero-shell')

    const compose = (frame: number) => {
      const motion = getLensHandoff(sceneTravel, frame)
      const arrivalWidth = arrivalCopy?.offsetWidth || 1
      const quote = getQuoteMotion(sceneTravel, viewportWidth, arrivalWidth)
      const reduced = preference.matches
      container.style.setProperty('--camera-scale', String(reduced ? 1 : motion.cameraScale))
      container.style.setProperty('--scene-opacity', String(motion.sceneOpacity))
      container.style.setProperty('--outgoing-opacity', String(reduced ? Number(!motion.arrivalActive) : motion.outgoingOpacity))
      container.style.setProperty('--outgoing-shift', `${reduced ? 0 : motion.outgoingShift}px`)
      container.style.setProperty('--experience-description-opacity', String(reduced ? 1 : motion.descriptionOpacity))
      container.style.setProperty('--arrival-opacity', String(reduced ? Number(motion.arrivalActive) : motion.arrivalOpacity))
      container.style.setProperty('--arrival-scale', String(reduced ? 1 : quote.scale))
      container.style.setProperty('--arrival-x', `${reduced ? quote.restX : quote.x}px`)
      container.style.setProperty('--arrival-y', `${viewportHeight / 2}px`)
      // Lines start centred on the lens and settle into left alignment.
      arrivalLines.forEach((line) => {
        line.style.transform = `translateX(${reduced ? 0 : ((arrivalWidth - line.offsetWidth) / 2) * (1 - quote.move)}px)`
      })
      container.dataset.handoff = motion.phase.toFixed(4)

      const story = getStoryState(frame / (FRAME_COUNT - 1))
      const activeStage = motion.arrivalActive ? storyPanels.length : story.activeStage
      storyPanels.forEach((panel, index) => {
        panel.style.setProperty('--panel-opacity', String(story.opacities[index]))
        if (lastActiveStage !== activeStage) {
          panel.inert = index !== activeStage
          panel.setAttribute('aria-hidden', String(index !== activeStage))
          panel.dataset.active = String(index === activeStage)
        }
      })
      if (arrival) {
        arrival.dataset.visible = String(reduced ? motion.arrivalActive : motion.arrivalVisible)
        if (lastActiveStage !== activeStage) {
          arrival.inert = !motion.arrivalActive
          arrival.setAttribute('aria-hidden', String(!motion.arrivalActive))
          arrival.dataset.active = String(motion.arrivalActive)
        }
      }
      lastActiveStage = activeStage
      container.dataset.storyStage = String(activeStage)
    }

    const draw = () => {
      if (disposed || cache.size === 0) return
      // While a new frame is loading, retain the nearest decoded frame.
      let nearest = target
      if (!cache.has(target)) {
        let distance = Infinity
        for (const index of cache.keys()) {
          if (Math.abs(index - target) < distance) {
            nearest = index
            distance = Math.abs(index - target)
          }
        }
      }
      const image = cache.get(nearest)
      if (!image) return
      const scale = Math.max(viewportWidth / image.naturalWidth, viewportHeight / image.naturalHeight)
      const width = image.naturalWidth * scale
      const height = image.naturalHeight * scale
      context.drawImage(image, (viewportWidth - width) / 2, (viewportHeight - height) / 2, width, height)
      displayedFrame = nearest
      compose(nearest)
      canvas.dataset.frame = String(nearest)
      const mistOpacity = Math.max(0, Math.min(1, (LENS_ENTRY_END - nearest) / (LENS_ENTRY_END - LENS_ENTRY_START)))
      container.style.setProperty('--mist-opacity', String(mistOpacity))
      // The mobile cover crop puts dark glass behind the logo slightly earlier.
      container.toggleAttribute('data-in-lens', nearest >= (window.innerWidth < 768 ? 200 : LENS_ENTRY_END))
    }

    const trimCache = () => {
      if (cache.size <= CACHE_LIMIT) return
      const furthest = [...cache.keys()].sort((a, b) => Math.abs(b - target) - Math.abs(a - target))
      while (cache.size > CACHE_LIMIT) {
        const index = furthest.shift()
        if (index !== undefined) cache.delete(index)
      }
    }

    const pump = () => {
      if (disposed) return
      while (activeLoads < CONCURRENT_LOADS && queue.length) {
        const index = queue.shift()!
        if (cache.has(index) || loading.has(index) || failed.has(index)) continue
        const image = new Image()
        image.decoding = 'async'
        activeLoads += 1
        loading.set(index, image)
        image.onload = () => {
          activeLoads -= 1
          loading.delete(index)
          if (disposed) return
          cache.set(index, image)
          trimCache()
          draw()
          pump()
        }
        image.onerror = () => {
          activeLoads -= 1
          loading.delete(index)
          failed.add(index)
          pump()
        }
        image.src = frameUrl(index)
      }
    }

    const loadWindow = () => {
      const direction = target >= lastTarget ? 1 : -1
      const nextQueue = [target]
      // Load the requested frame first, then a small window in both directions.
      // This bounds decoded memory instead of retaining all 240 images.
      if (preference.matches) {
        const step = Math.round(target / (FRAME_COUNT - 1) * REDUCED_MOTION_STEPS)
        for (let offset = 1; offset <= 2; offset += 1) {
          nextQueue.push(
            Math.round((step + offset * direction) / REDUCED_MOTION_STEPS * (FRAME_COUNT - 1)),
            Math.round((step - offset * direction) / REDUCED_MOTION_STEPS * (FRAME_COUNT - 1)),
          )
        }
      } else {
        for (let offset = 1; offset <= 10; offset += 1) {
          nextQueue.push(target + offset * direction, target - offset * direction)
        }
      }
      queue = nextQueue.filter((index) => index >= 0 && index < FRAME_COUNT)
      lastTarget = target
      pump()
    }

    const update = (now = performance.now()) => {
      animationFrame = 0
      if (disposed) return
      const rect = container.getBoundingClientRect()
      const distance = Math.max(1, container.offsetHeight - window.innerHeight)
      const progress = Math.max(0, Math.min(1, -rect.top / distance))
      const travel = Math.max(0, -rect.top / window.innerHeight)
      const elapsed = Math.min(32, previousTick ? now - previousTick : 16.7)
      previousTick = now
      if (preference.matches || rect.bottom <= window.innerHeight || Math.abs(travel - sceneTravel) > 0.8) sceneTravel = travel
      else {
        sceneTravel += (travel - sceneTravel) * (1 - Math.exp(-elapsed / 80))
        if (Math.abs(travel - sceneTravel) < 0.0002) sceneTravel = travel
      }
      const videoProgress = Math.max(0, Math.min(1, sceneTravel / VIDEO_SCROLL_SCREENS))
      const frameProgress = preference.matches
        ? Math.round(videoProgress * REDUCED_MOTION_STEPS) / REDUCED_MOTION_STEPS
        : videoProgress
      const nextTarget = Math.round(frameProgress * (FRAME_COUNT - 1))
      container.style.setProperty('--scroll-progress', String(progress))
      container.style.setProperty('--viewport-height', `${window.innerHeight}px`)
      container.style.setProperty('--hero-mask-y', `${Math.max(0, -(hero?.getBoundingClientRect().top ?? 0))}px`)
      canvas.dataset.progress = videoProgress.toFixed(4)
      if (nextTarget !== target || !cache.size) {
        target = nextTarget
        draw()
        loadWindow()
      } else compose(displayedFrame)
      if (sceneTravel !== travel) animationFrame = requestAnimationFrame(update)
    }

    const requestUpdate = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(update)
    }

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      viewportWidth = Math.max(1, canvas.clientWidth)
      viewportHeight = Math.max(1, canvas.clientHeight)
      canvas.width = Math.round(viewportWidth * pixelRatio)
      canvas.height = Math.round(viewportHeight * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      draw()
      requestUpdate()
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', resize)
    preference.addEventListener('change', requestUpdate)
    resize()
    loadWindow()
    void document.fonts.ready.then(() => {
      if (!disposed) resize()
    })

    return () => {
      disposed = true
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', resize)
      preference.removeEventListener('change', requestUpdate)
      for (const image of loading.values()) {
        image.onload = null
        image.onerror = null
        image.src = ''
      }
      loading.clear()
      cache.clear()
    }
  }, [containerRef])

  return (
    <div className="sequence-scene pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <canvas ref={canvasRef} className="sequence-canvas absolute inset-0 h-full w-full" data-frame="0" />
      <div className="sequence-contrast absolute inset-0" />
      <div className="sequence-wash absolute inset-0" />
    </div>
  )
}
