import { useEffect, type RefObject } from 'react'

export function useMagneticCard(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current
    const card = root?.querySelector<HTMLElement>('.offer-card')
    if (!root || !card) return
    const enabled = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
    const value = [0, 0, 0, 0, 0]
    const velocity = [0, 0, 0, 0, 0]
    let target = [0, 0, 0, 0, 0]
    let frame = 0
    let previousTime = 0
    const properties = ['--magnet-x', '--magnet-y', '--magnet-rx', '--magnet-ry', '--magnet-hover']
    const units = ['px', 'px', 'deg', 'deg', '']

    const paint = () => properties.forEach((property, index) => {
      card.style.setProperty(property, `${value[index].toFixed(4)}${units[index]}`)
    })
    const tick = (time: number) => {
      const dt = previousTime ? Math.min((time - previousTime) / 1000, 0.032) : 1 / 60
      previousTime = time
      let moving = false
      value.forEach((position, index) => {
        velocity[index] += ((target[index] - position) * 200 - velocity[index] * 18) * dt
        value[index] += velocity[index] * dt
        if (Math.abs(target[index] - value[index]) > 0.001 || Math.abs(velocity[index]) > 0.001) moving = true
        else { value[index] = target[index]; velocity[index] = 0 }
      })
      paint()
      frame = moving ? requestAnimationFrame(tick) : 0
    }
    const animate = () => {
      if (!frame) { previousTime = 0; frame = requestAnimationFrame(tick) }
    }
    const move = (event: PointerEvent) => {
      if (!enabled.matches || event.pointerType !== 'mouse') return
      const rect = root.getBoundingClientRect()
      const x = Math.max(-0.5, Math.min(0.5, (event.clientX - rect.left) / rect.width - 0.5))
      const y = Math.max(-0.5, Math.min(0.5, (event.clientY - rect.top) / rect.height - 0.5))
      target = [x * 18, y * 14, -y * 5, x * 6, 1]
      animate()
    }
    const leave = () => { target = [0, 0, 0, 0, 0]; animate() }
    const reset = () => {
      cancelAnimationFrame(frame)
      frame = 0
      target = [0, 0, 0, 0, 0]
      value.fill(0)
      velocity.fill(0)
      paint()
    }
    const onPreference = () => { if (!enabled.matches) reset() }
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) reset() })
    observer.observe(root)
    root.addEventListener('pointerenter', move)
    root.addEventListener('pointermove', move)
    root.addEventListener('pointerleave', leave)
    window.addEventListener('blur', reset)
    enabled.addEventListener('change', onPreference)
    return () => {
      reset()
      observer.disconnect()
      root.removeEventListener('pointerenter', move)
      root.removeEventListener('pointermove', move)
      root.removeEventListener('pointerleave', leave)
      window.removeEventListener('blur', reset)
      enabled.removeEventListener('change', onPreference)
    }
  }, [ref])
}
