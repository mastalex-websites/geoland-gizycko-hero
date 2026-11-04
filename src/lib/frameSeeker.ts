type SeekableVideo = Pick<HTMLVideoElement,
  'readyState' | 'seeking' | 'duration' | 'currentTime' | 'paused' | 'pause' | 'addEventListener' | 'removeEventListener'>

export function frameAtProgress(progress: number, count: number) {
  const value = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0
  return Math.round(value * (count - 1))
}



export function createFrameSeeker(video: SeekableVideo, { frameCount, fps, onFrame }: {
  frameCount: number
  fps: number
  onFrame: (frame: number) => void
}) {
  let wanted = 0
  let requested = -1
  let settled = -1
  let failed = false
  let disposed = false

  const flush = () => {
    if (disposed || failed || video.readyState < 2 || video.seeking || requested >= 0 || wanted === settled) return
    const duration = Number.isFinite(video.duration) ? video.duration : frameCount / fps
    requested = wanted
    try {

      video.currentTime = Math.min((wanted + 0.5) / fps, Math.max(0, duration - 0.001))
    } catch {
      requested = -1
    }
  }
  const onSeeked = () => {
    if (disposed || failed) return
    if (requested >= 0) {
      settled = requested
      onFrame(settled)
    }
    requested = -1
    flush()
  }
  const onError = () => { failed = true; requested = -1 }

  video.addEventListener('loadeddata', flush)
  video.addEventListener('canplay', flush)
  video.addEventListener('seeked', onSeeked)
  video.addEventListener('error', onError)

  return {
    setProgress(progress: number) {
      if (disposed) return
      wanted = frameAtProgress(progress, frameCount)
      if (!video.paused) video.pause()
      flush()
    },
    destroy() {
      disposed = true
      video.removeEventListener('loadeddata', flush)
      video.removeEventListener('canplay', flush)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
    },
  }
}
