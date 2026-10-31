import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

const FRAME_COUNT = 240
const CACHE_LIMIT = 24
const CONCURRENT_LOADS = 4
const frameUrl = (index: number) => `/media/frames/frame-${String(index).padStart(4, '0')}.webp`

export default function ScrollSequence({ containerRef }: { containerRef: RefObject<HTMLElement | null> }) {
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
    let activeLoads = 0
    let queue: number[] = []
    let viewportWidth = 0
    let viewportHeight = 0
    const cache = new Map<number, HTMLImageElement>()
    const loading = new Map<number, HTMLImageElement>()
    const failed = new Set<number>()
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const heroContent = container.querySelector<HTMLElement>('.hero-content')

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
      for (let offset = 1; offset <= (preference.matches ? 0 : 10); offset += 1) {
        nextQueue.push(target + offset * direction, target - offset * direction)
      }
      queue = nextQueue.filter((index) => index >= 0 && index < FRAME_COUNT)
      lastTarget = target
      pump()
    }

    const update = () => {
      animationFrame = 0
      if (disposed) return
      const rect = container.getBoundingClientRect()
      const distance = Math.max(1, container.offsetHeight - window.innerHeight)
      const progress = preference.matches ? 0 : Math.max(0, Math.min(1, -rect.top / distance))
      const nextTarget = Math.round(progress * (FRAME_COUNT - 1))
      container.style.setProperty('--scroll-progress', String(progress))
      if (heroContent) heroContent.inert = progress > 0.34
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
  }, [containerRef])

  return (
    <div className="sequence-scene pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <canvas ref={canvasRef} className="sequence-canvas absolute inset-0 h-full w-full" data-frame="0" />
      <div className="sequence-wash absolute inset-0" />
    </div>
  )
}
