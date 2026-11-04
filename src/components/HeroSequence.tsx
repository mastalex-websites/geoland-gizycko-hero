import { useEffect, useRef, type RefObject } from 'react'
import { getStoryState } from '../lib/heroStoryProgress'
import { getLensHandoff, getQuoteMotion, STORY_SCROLL_SCREENS, VIDEO_SCROLL_SCREENS } from '../lib/lensHandoff'
import { createFrameSeeker, frameAtProgress } from '../lib/frameSeeker'

const FRAME_COUNT = 240
const FRAME_RATE = 24
const REDUCED_MOTION_STEPS = 12
const LENS_ENTRY_START = 192
const LENS_ENTRY_END = 204

export default function HeroSequence({ containerRef }: { containerRef: RefObject<HTMLElement | null> }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const video = videoRef.current
    if (!container || !video) return

    let disposed = false
    let animationFrame = 0
    let needsMeasure = true
    let lastTarget = -1
    let lastActiveStage = -1
    let lastComposedFrame = -1
    let lastComposedTravel = -1
    let displayedFrame = 0
    let sceneTravel = 0
    let previousTick = 0
    let viewportWidth = 1
    let viewportHeight = 1
    let scrollUnit = 1
    let containerTop = 0
    let containerHeight = 1
    let heroHeight = 1
    let arrivalWidth = 1
    let lineWidths: number[] = []
    let restLeft: number | undefined
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const storyPanels = [...container.querySelectorAll<HTMLElement>('[data-story-panel]')]
    const arrival = container.querySelector<HTMLElement>('.lens-arrival')
    const arrivalCopy = container.querySelector<HTMLElement>('.lens-arrival-copy')
    const arrivalLines = [...container.querySelectorAll<HTMLElement>('.lens-arrival .opening-line')]
    const hero = container.querySelector<HTMLElement>('.hero-shell')


    const measure = () => {
      viewportWidth = Math.max(1, video.clientWidth)
      viewportHeight = Math.max(1, video.clientHeight)
      containerTop = container.getBoundingClientRect().top + window.scrollY
      containerHeight = container.offsetHeight
      heroHeight = hero?.clientHeight || viewportHeight


      scrollUnit = Math.max(1, (containerHeight - heroHeight) / STORY_SCROLL_SCREENS)
      arrivalWidth = arrivalCopy?.offsetWidth || 1
      lineWidths = arrivalLines.map(line => line.offsetWidth)
      const nextBlock = document.querySelector('.story-stage[data-pinned] .about-block')
      restLeft = nextBlock ? parseFloat(getComputedStyle(nextBlock).paddingLeft) : undefined
      needsMeasure = false
    }

    const compose = (frame: number) => {
      const motion = getLensHandoff(sceneTravel, frame)
      const quote = getQuoteMotion(sceneTravel, viewportWidth, arrivalWidth, restLeft)
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
      arrivalLines.forEach((line, index) => {
        line.style.transform = `translateX(${reduced ? 0 : ((arrivalWidth - lineWidths[index]) / 2) * (1 - quote.move)}px)`
      })
      container.dataset.handoff = motion.phase.toFixed(4)

      const story = getStoryState(frame / (FRAME_COUNT - 1))
      const activeStage = motion.arrivalActive ? storyPanels.length : story.activeStage
      storyPanels.forEach((panel, index) => {
        panel.style.setProperty('--panel-opacity', String(story.opacities[index]))
        panel.style.setProperty('--panel-travel', story.opacities[index + 1] > 0 ? '-16px' : '16px')
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
      if (frame !== lastComposedFrame) {
        const mistOpacity = Math.max(0, Math.min(1, (LENS_ENTRY_END - frame) / (LENS_ENTRY_END - LENS_ENTRY_START)))
        container.style.setProperty('--mist-opacity', String(mistOpacity))
      }
      container.toggleAttribute('data-in-lens', frame >= (viewportWidth < 768 ? 200 : LENS_ENTRY_END))
      lastActiveStage = activeStage
      lastComposedFrame = frame
      lastComposedTravel = sceneTravel
      container.dataset.storyStage = String(activeStage)
    }

    video.muted = video.defaultMuted = true
    video.autoplay = video.loop = false
    video.pause()
    const seeker = createFrameSeeker(video, {
      frameCount: FRAME_COUNT,
      fps: FRAME_RATE,
      onFrame(frame) {
        displayedFrame = frame
        video.dataset.frame = String(frame)
        requestUpdate()
      },
    })

    const update = (now: number) => {
      animationFrame = 0
      if (disposed || document.hidden) return
      const measured = needsMeasure
      if (measured) measure()
      const scroll = window.scrollY
      const travel = Math.max(0, (scroll - containerTop) / scrollUnit)
      const elapsed = Math.min(32, previousTick ? now - previousTick : 16.7)
      previousTick = now

      if (preference.matches || containerTop + containerHeight - scroll <= heroHeight || Math.abs(travel - sceneTravel) > 0.8) sceneTravel = travel
      else {
        sceneTravel += (travel - sceneTravel) * (1 - Math.exp(-elapsed / 80))
        if (Math.abs(travel - sceneTravel) < 0.0002) sceneTravel = travel
      }
      const videoProgress = Math.max(0, Math.min(1, travel / VIDEO_SCROLL_SCREENS))
      const frameProgress = preference.matches ? Math.round(videoProgress * REDUCED_MOTION_STEPS) / REDUCED_MOTION_STEPS : videoProgress
      const target = frameAtProgress(frameProgress, FRAME_COUNT)
      if (target !== lastTarget) {
        lastTarget = target
        video.dataset.targetFrame = String(target)
        seeker.setProgress(frameProgress)
      }
      const progress = Math.max(0, Math.min(1, (scroll - containerTop) / Math.max(1, containerHeight - heroHeight)))
      const heroTop = Math.min(Math.max(containerTop - scroll, 0), containerTop + containerHeight - heroHeight - scroll)
      container.style.setProperty('--scroll-progress', String(progress))
      container.style.setProperty('--viewport-height', `${heroHeight}px`)
      container.style.setProperty('--hero-mask-y', `${Math.max(0, -heroTop)}px`)
      video.dataset.progress = videoProgress.toFixed(4)
      if (measured || displayedFrame !== lastComposedFrame || sceneTravel !== lastComposedTravel) compose(displayedFrame)

      if (sceneTravel !== travel) animationFrame = requestAnimationFrame(update)
    }
    const requestUpdate = () => {
      if (!disposed && !animationFrame) animationFrame = requestAnimationFrame(update)
    }
    const requestMeasure = () => { needsMeasure = true; requestUpdate() }
    const observer = new ResizeObserver(requestMeasure)
    observer.observe(container)
    observer.observe(video)
    if (arrivalCopy) observer.observe(arrivalCopy)
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestMeasure, { passive: true })
    window.addEventListener('pageshow', requestMeasure)
    document.addEventListener('visibilitychange', requestUpdate)
    preference.addEventListener('change', requestUpdate)
    requestMeasure()
    void document.fonts.ready.then(() => { if (!disposed) requestMeasure() })

    return () => {
      disposed = true
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
      seeker.destroy()
      video.pause()
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestMeasure)
      window.removeEventListener('pageshow', requestMeasure)
      document.removeEventListener('visibilitychange', requestUpdate)
      preference.removeEventListener('change', requestUpdate)
    }
  }, [containerRef])

  return (
    <div className="sequence-scene pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <video ref={videoRef} className="sequence-video absolute inset-0 h-full w-full" src={`${import.meta.env.BASE_URL}media/geoland-hero-scrub-720p.mp4`} poster={`${import.meta.env.BASE_URL}media/geoland-poster.jpg`} width={1280} height={720} preload="auto" muted playsInline controls={false} disablePictureInPicture disableRemotePlayback tabIndex={-1} data-frame="0" />
      <div className="sequence-contrast absolute inset-0" />
      <div className="sequence-wash absolute inset-0" />
    </div>
  )
}
