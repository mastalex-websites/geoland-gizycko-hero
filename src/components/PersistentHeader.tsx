import { useEffect, useRef, type ReactNode } from 'react'
import '../styles/navigation.css'

export default function PersistentHeader({ navigation }: { navigation: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const header = ref.current
    const hero = document.querySelector<HTMLElement>('.current-hero')
    const contact = document.querySelector<HTMLElement>('.contact-section')
    if (!header || !hero) return
    let frame = 0

    const update = () => {
      frame = 0
      const middle = header.getBoundingClientRect().height / 2
      const pastHero = hero.getBoundingClientRect().bottom <= middle
      const onContact = !!contact && contact.getBoundingClientRect().top <= middle
      header.dataset.tone = !onContact && (pastHero || hero.hasAttribute('data-in-lens')) ? 'dark' : 'light'
      header.dataset.surface = onContact ? 'light' : pastHero ? 'dark' : 'hero'
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const observer = new MutationObserver(schedule)
    observer.observe(hero, { attributes: true, attributeFilter: ['data-in-lens'] })
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    update()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return <div ref={ref} className="persistent-header" data-tone="light" data-surface="hero">{navigation}</div>
}
