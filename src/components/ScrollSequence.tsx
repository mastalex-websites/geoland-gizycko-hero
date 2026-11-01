import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { getStoryState } from '../lib/storyProgress'

const FRAME_COUNT = 240
const CACHE_LIMIT = 24
const CONCURRENT_LOADS = 4
const REDUCED_MOTION_STEPS = 12
// The lens begins filling the frame at 8 s; clear the mist before entering it.
const LENS_ENTRY_START = 192
const LENS_ENTRY_END = 204
const frameUrl = (index: number) => `${import.meta.env.BASE_URL}media/frames/frame-${String(index).padStart(4, '0')}.webp`

export default function ScrollSequence({ containerRef, flightRef }: { containerRef: RefObject<HTMLElement | null>; flightRef: RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const flight = flightRef.current
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d', { alpha: false })
    if (!container || !flight || !canvas || !context) return

    let disposed = false
    let animationFrame = 0
    let target = 0
    let lastTarget = 0
    let lastActiveStage = -1
    let activeLoads = 0
    let queue: number[] = []
    let viewportWidth = 0
    let viewportHeight = 0
    const cache = new Map<number, HTMLImageElement>()
    const loading = new Map<number, HTMLImageElement>()
    const failed = new Set<number>()
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const storyPanels = [...container.querySelectorAll<HTMLElement>('[data-story-panel]')]

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
      canvas.dataset.frame = String(nearest)
      const mistOpacity = Math.max(0, Math.min(1, (LENS_ENTRY_END - nearest) / (LENS_ENTRY_END - LENS_ENTRY_START)))
      container.style.setProperty('--mist-opacity', String(mistOpacity))
      container.toggleAttribute('data-in-lens', nearest >= LENS_ENTRY_END)
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

    const update = () => {
      animationFrame = 0
      if (disposed) return
      const rect = container.getBoundingClientRect()
      const distance = Math.max(1, flight.offsetHeight - window.innerHeight)
      const progress = Math.max(0, Math.min(1, -rect.top / distance))
      const frameProgress = preference.matches
        ? Math.round(progress * REDUCED_MOTION_STEPS) / REDUCED_MOTION_STEPS
        : progress
      const nextTarget = Math.round(frameProgress * (FRAME_COUNT - 1))
      container.style.setProperty('--scroll-progress', String(progress))
      const story = getStoryState(progress)
      storyPanels.forEach((panel, index) => {
        panel.style.setProperty('--panel-opacity', String(story.opacities[index]))
        if (lastActiveStage !== story.activeStage) {
          panel.inert = index !== story.activeStage
          panel.setAttribute('aria-hidden', String(index !== story.activeStage))
          panel.dataset.active = String(index === story.activeStage)
        }
      })
      lastActiveStage = story.activeStage
      container.dataset.storyStage = String(story.activeStage)
      canvas.dataset.progress = progress.toFixed(4)
      if (nextTarget !== target || !cache.size) {
        target = nextTarget
        draw()
        loadWindow()
      }
    }

    const requestUpdate = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(update)
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      viewportWidth = Math.max(1, rect.width)
      viewportHeight = Math.max(1, rect.height)
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
  }, [containerRef, flightRef])

  return (
    <div className="sequence-scene pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <canvas ref={canvasRef} className="sequence-canvas absolute inset-0 h-full w-full" data-frame="0" />
      <div className="sequence-contrast absolute inset-0" />
      <div className="sequence-wash absolute inset-0" />
    </div>
  )
}
