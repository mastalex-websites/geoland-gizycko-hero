import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type FocusEvent, type ReactNode } from 'react'
import Hero from './components/Hero'

const navigation = [
  { label: 'Start', href: '#start', current: true },
  { label: 'O firmie', href: 'https://www.geoland-gizycko.com/#wrapperMain' },
  { label: 'Oferta', href: 'https://www.geoland-gizycko.com/#:~:text=MAPY%20NUMERYCZNE' },
  { label: 'Kontakt', href: 'mailto:marcinstemplewski@wp.pl' },
]

const offers = [
  { name: 'MAPY NUMERYCZNE', text: 'Mapy zasadnicze, ewidencyjne, podziały gospodarcze, mapy sieci uzbrojenia podziemnego (energetyka, gaz, telekomunikacja) i inne.' },
  { name: 'MAPY DO CELÓW PROJEKTOWYCH', text: 'Aktualizacja mapy zasadniczej w obszarze planowanej inwestycji, w razie potrzeby uzupełniona zgodnie z aktualnymi przepisami.' },
  { name: 'POMIARY POWYKONAWCZE', text: 'Geodezyjna mapa powykonawcza z klauzulą o przyjęciu do Państwowego Zasobu Geodezyjnego, niezbędna do zgłoszenia zakończenia budowy.' },
  { name: 'TYCZENIA', text: 'Posadowienie obiektów budowlanych w terenie zgodnie z planem zagospodarowania terenu.' },
  { name: 'OKAZANIA GRANIC', text: 'Okazanie przebiegu granic działek ewidencyjnych na gruncie, w obecności stron.' },
  { name: 'PODZIAŁY NIERUCHOMOŚCI', text: 'Wydzielenie części działki jako odrębnej nieruchomości lub do włączenia w inną działkę, np. na sprzedaż, pod budowę lub uprawę.' },
]

const partners = [
  { name: 'Geo-Wektor Paweł Kobiałka', href: 'http://www.geo-wektor.com' },
  { name: 'Katalog Firm Firmowy.com.pl', href: 'http://www.firmowy.com.pl' },
  { name: 'Biuro Nieruchomości NOVADOM s.c. Giżycko', href: 'http://www.novadom.mazury.pl/' },
]

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
// Phones and reduced motion get a plain column instead of the pinned scene.
const pinnedStory = window.matchMedia('(min-width: 768px) and (min-height: 561px) and (prefers-reduced-motion: no-preference)')
// Scene timeline in viewport heights of scroll; only one thing moves at a time.
const STORY_ABOUT_REVEAL = [0.02, 0.55]
const STORY_ABOUT_SLIDE = [0.6, 0.9]
const STORY_EQUIPMENT_REVEAL = [0.92, 1.3]
const STORY_OFFER_SLIDE = [1.35, 1.65]
const STORY_CARD_STEP = 0.28
const STORY_OFFER_SPLIT = [3.2, 3.5]
const STORY_PARTNER_MOVES = [[3.5, 3.8], [3.95, 4.25], [4.4, 4.7]]
const STORY_END = 4.85
const DRIFT_EASING = 0.09
// Blocks below the opening: travel per viewport height, and the distances from centre where they start and finish fading.
const BLOCK_DRIFT = 0.12
const BLOCK_FADE_START = 0.35
const BLOCK_FADE_END = 0.6

function ArrowUpRight({ className = '' }: { className?: string }) {
  return <svg className={className} width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 15 15 5M5 5h10v10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigationRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }
    const onOutside = (event: PointerEvent) => {
      if (!navigationRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onOutside)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onOutside)
    }
  }, [menuOpen])

  return (
    <header ref={navigationRef} className="relative z-30">
      <nav className="navigation-shell mx-auto flex max-w-7xl items-center justify-between px-8 py-6" aria-label="Nawigacja główna">
        <a href="#start" aria-label="Geoland Giżycko — strona główna" className="wordmark flex items-baseline gap-2 text-black">
          <span className="font-display text-[35px] leading-none tracking-tight">Geoland<span className="logo-point">.</span></span>
          <span className="relative -top-3 text-[9px] font-medium tracking-[0.16em] uppercase">Giżycko</span>
        </a>
        <div className="desktop-navigation flex items-center gap-9">
          {navigation.map((item) => (
            <a key={item.label} href={item.href} aria-current={item.current ? 'page' : undefined} className={`nav-link text-sm transition-colors hover:text-black ${item.current ? 'text-black' : 'text-muted'}`}>
              {item.label}
            </a>
          ))}
        </div>
        <a href="tel:+48606803423" className="nav-cta button-dark flex items-center gap-5 rounded-full bg-black px-6 py-2.5 text-sm text-white">
          Porozmawiajmy <ArrowUpRight />
        </a>
        <button ref={toggleRef} type="button" className="mobile-toggle flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-full border border-black/10 bg-white/75" aria-label={menuOpen ? 'Zamknij menu' : 'Otwórz menu'} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen((current) => !current)}>
          <span className={`h-px w-[18px] bg-black transition-transform ${menuOpen ? 'translate-y-[3px] rotate-45' : ''}`} />
          <span className={`h-px w-[18px] bg-black transition-transform ${menuOpen ? '-translate-y-[3px] -rotate-45' : ''}`} />
        </button>
      </nav>
      {menuOpen && (
        <nav id="mobile-menu" aria-label="Menu mobilne" className="mobile-menu absolute right-6 left-6 top-full flex flex-col gap-1 rounded-2xl border border-black/10 bg-white/95 p-3 shadow-xl shadow-black/5 backdrop-blur-xl">
          {navigation.map((item) => <a key={item.label} href={item.href} className="rounded-xl px-5 py-3.5 text-sm text-black hover:bg-black/5" onClick={() => setMenuOpen(false)}>{item.label}</a>)}
          <a href="tel:+48606803423" className="mt-1 rounded-xl bg-black px-5 py-3.5 text-sm text-white">Zadzwoń: 606 803 423</a>
        </nav>
      )}
    </header>
  )
}

function useEasedScroll<T extends HTMLElement>(getTarget: (element: T, value: number) => number, render: (element: T, value: number) => void, { runWhenReduced = false, enabled = true } = {}) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || !enabled || (reducedMotion.matches && !runWhenReduced)) return

    const easing = reducedMotion.matches ? 1 : DRIFT_EASING
    let animationFrame = 0
    let value = getTarget(element, 0)
    const tick = () => {
      value += (getTarget(element, value) - value) * easing
      render(element, value)
      animationFrame = requestAnimationFrame(tick)
    }
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(animationFrame)
      if (entry.isIntersecting) animationFrame = requestAnimationFrame(tick)
      else {
        value = getTarget(element, value)
        render(element, value)
      }
    }, { rootMargin: '30% 0px' })

    render(element, value)
    observer.observe(element)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(animationFrame)
    }
  }, [getTarget, render, runWhenReduced, enabled])

  return ref
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const smoothstep = (value: number) => {
  const position = clamp(value, 0, 1)
  return position * position * (3 - 2 * position)
}

// Distance of the block's resting centre from the viewport centre, in viewport heights.
function getBlockDrift(block: HTMLElement, drift: number) {
  const { top, height } = block.getBoundingClientRect()
  const viewport = window.innerHeight
  const restingTop = top - drift * viewport * BLOCK_DRIFT
  return clamp((restingTop + height / 2 - viewport / 2) / viewport, -1, 1)
}

// The footer cannot reach the viewport centre, so it settles at the end of the page instead.
function getFooterDrift() {
  const remaining = document.documentElement.scrollHeight - window.innerHeight - window.scrollY
  return clamp(remaining / window.innerHeight, 0, 1)
}

function renderBlockDrift(block: HTMLElement, drift: number) {
  block.style.transform = `translate3d(0, ${(drift * window.innerHeight * BLOCK_DRIFT).toFixed(1)}px, 0)`
  block.style.opacity = clamp((BLOCK_FADE_END - Math.abs(drift)) / (BLOCK_FADE_END - BLOCK_FADE_START), 0, 1).toFixed(3)
}

const phase = (value: number, [start, end]: number[]) => clamp((value - start) / (end - start), 0, 1)
const eased = (value: number, range: number[]) => smoothstep(phase(value, range))
const translateX = (x: number) => `translate3d(${x.toFixed(1)}px, 0, 0)`

function getStoryPosition(stage: HTMLElement) {
  return clamp(-stage.getBoundingClientRect().top / window.innerHeight, 0, STORY_END)
}

function revealWords(block: Element | undefined, amount: number) {
  const words = block?.querySelectorAll<HTMLElement>('.story-word') ?? []
  words.forEach((word, index) => {
    const lit = phase(amount, [index / words.length * 0.85, index / words.length * 0.85 + 0.15])
    word.style.color = `rgb(${Math.round(92 + 136 * lit)}, ${Math.round(92 + 134 * lit)}, ${Math.round(92 + 124 * lit)})`
  })
}

function renderStory(stage: HTMLElement, position: number) {
  const width = stage.clientWidth
  const height = window.innerHeight
  const query = <T extends HTMLElement>(selector: string) => stage.querySelector<T>(selector)
  const blocks = stage.querySelectorAll('.about-block')

  const slid = eased(position, STORY_ABOUT_SLIDE) + eased(position, STORY_OFFER_SLIDE)
  const track = query('.story-track')
  if (track) track.style.transform = translateX(-slid * width)
  revealWords(blocks[0], phase(position, STORY_ABOUT_REVEAL))
  revealWords(blocks[1], phase(position, STORY_EQUIPMENT_REVEAL))

  // Each card rises over the previous one and leaves its heading showing.
  stage.querySelectorAll<HTMLElement>('.offer-row').forEach((card, index) => {
    if (index === 0) return
    const start = STORY_OFFER_SLIDE[1] + (index - 1) * STORY_CARD_STEP
    const open = eased(position, [start, start + STORY_CARD_STEP * 0.8])
    card.style.transform = `translate3d(0, ${((1 - open) * height * 1.1).toFixed(1)}px, 0)`
  })

  // The offer opens to both sides, clearing the screen before the next name arrives.
  const split = eased(position, STORY_OFFER_SPLIT) * width * 0.7
  const title = query('.offer-title')
  const list = query('.offer-list')
  if (title) title.style.transform = translateX(-split)
  if (list) list.style.transform = translateX(split)

  // Every name enters from the side and pushes the previous one out along the same line.
  const shown = STORY_PARTNER_MOVES.reduce((sum, move) => sum + eased(position, move), -1)
  stage.querySelectorAll<HTMLElement>('.partners-item').forEach((item, index) => {
    item.style.transform = translateX((index - shown) * width)
  })
  const label = query('.partners-title')
  const progress = query('.partners-progress')
  const labelOpacity = phase(position, [STORY_OFFER_SPLIT[1] - 0.08, STORY_OFFER_SPLIT[1] + 0.1]).toFixed(3)
  if (label) label.style.opacity = labelOpacity
  if (progress) {
    progress.style.opacity = labelOpacity
    progress.style.setProperty('--partners-shown', ((shown + 1) / STORY_PARTNER_MOVES.length).toFixed(3))
  }
}

function WordReveal({ text }: { text: string }) {
  return text.split(' ').map((word, index) => (
    <span key={index}>{index > 0 && ' '}<span className="story-word">{word}</span></span>
  ))
}

function AboutBlock({ title, className = '', drift, children }: { title: string; className?: string; drift: boolean; children: ReactNode }) {
  const ref = useEasedScroll<HTMLDivElement>(getBlockDrift, renderBlockDrift, { enabled: drift })

  return (
    <div ref={ref} className={`about-block ${className}`}>
      <div>
        <h3 className="about-heading font-light">{title}</h3>
        {children}
      </div>
    </div>
  )
}

function AboutSection({ drift }: { drift: boolean }) {
  return (
    <section className="about-section" aria-label="O firmie">
      <div className="about-grid mx-auto w-full max-w-7xl px-8">
        <AboutBlock title="Kompleksowe usługi" drift={drift}>
          <p className="about-text font-mono">
            <WordReveal text="Geoland-Giżycko jest małą firmą geodezyjną oferującą kompleksowe usługi z zakresu pomiarów powykonawczych, map do celów projektowych i podziałów nieruchomości. Wiedza oraz wieloletnie doświadczenie zdobyte podczas realizacji zleceń geodezyjnych na terenie całego kraju, pozwalają nam na wykonanie usług na najwyższym poziomie." />
          </p>
        </AboutBlock>
        <AboutBlock title="Sprzęt i oprogramowanie" className="about-block-offset" drift={drift}>
          <p className="about-text font-mono">
            <WordReveal text="Dysponujemy profesjonalnym sprzętem pomiarowym oraz najnowszym oprogramowaniem geo-informatycznym co pozwala nam na wykonywanie usług na najwyższym poziomie. Gwarantujemy naszym klientom satysfakcję oraz zadowolenie z powierzonych nam prac." />
          </p>
          <p className="about-signature font-mono"><WordReveal text="inż. Marcin Stemplewski" /></p>
        </AboutBlock>
      </div>
    </section>
  )
}

function OfferRow({ index, name, text, drift }: { index: number; name: string; text: string; drift: boolean }) {
  const ref = useEasedScroll<HTMLLIElement>(getBlockDrift, renderBlockDrift, { enabled: drift })

  return (
    <li ref={ref} className="offer-row" style={{ '--card': index } as CSSProperties}>
      <h3 className="offer-name font-light">{name}</h3>
      <p className="offer-text font-mono">{text}</p>
    </li>
  )
}

function OfferSection({ drift }: { drift: boolean }) {
  return (
    <section className="offer-section" aria-labelledby="offer-title">
      <div className="offer-layout mx-auto w-full max-w-7xl px-8">
        <h2 id="offer-title" className="offer-title font-light">Oferta</h2>
        <ol className="offer-list">
          {offers.map((offer, index) => (
            <OfferRow key={offer.name} index={index} name={offer.name} text={offer.text} drift={drift} />
          ))}
        </ol>
      </div>
    </section>
  )
}

// Keyboard focus brings the name on screen, because it may still be waiting off to the side.
function showPartner(event: FocusEvent<HTMLAnchorElement>, index: number) {
  const stage = event.currentTarget.closest<HTMLElement>('.story-stage[data-pinned]')
  if (stage) window.scrollTo(0, stage.getBoundingClientRect().top + window.scrollY + STORY_PARTNER_MOVES[index][1] * window.innerHeight)
}

function PartnersSection({ drift }: { drift: boolean }) {
  const ref = useEasedScroll<HTMLDivElement>(getBlockDrift, renderBlockDrift, { enabled: drift })

  return (
    <section className="partners-section" aria-labelledby="partners-title">
      <div ref={ref} className="partners-block mx-auto w-full max-w-7xl px-8">
        <h2 id="partners-title" className="partners-title font-mono">Współpracujemy</h2>
        <div className="partners-progress" aria-hidden="true" />
        <ul className="partners-list">
          {partners.map((partner, index) => (
            <li key={partner.name} className="partners-item">
              <a href={partner.href} target="_blank" rel="noreferrer" className="partners-link dark-link font-light" onFocus={(event) => showPartner(event, index)}>{partner.name}</a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const subscribePinnedStory = (onChange: () => void) => {
  pinnedStory.addEventListener('change', onChange)
  return () => pinnedStory.removeEventListener('change', onChange)
}

function StoryStage() {
  const pinned = useSyncExternalStore(subscribePinnedStory, () => pinnedStory.matches)
  const ref = useEasedScroll<HTMLDivElement>(getStoryPosition, renderStory, { enabled: pinned })

  // Remounting on a layout change drops every inline style left by the other layout.
  return (
    <div key={String(pinned)} ref={ref} className="story-stage" data-pinned={pinned || undefined}>
      <div className="story-camera">
        <div className="story-track">
          <AboutSection drift={!pinned} />
          <OfferSection drift={!pinned} />
        </div>
        <PartnersSection drift={!pinned} />
      </div>
    </div>
  )
}

function ContactSection() {
  const ref = useEasedScroll<HTMLDivElement>(getFooterDrift, renderBlockDrift)

  return (
    <footer className="contact-section" aria-labelledby="contact-title">
      <div ref={ref} className="contact-block mx-auto w-full max-w-7xl px-8">
        <h2 id="contact-title" className="offer-title font-light">Kontakt</h2>
        <div className="contact-grid">
          <div>
            <p className="contact-name font-light">GEOLAND Giżycko Usługi Geodezyjne</p>
            <p className="contact-text font-mono">Geodeta Uprawniony inż. Marcin Stemplewski</p>
          </div>
          <div className="contact-details font-mono">
            <p className="contact-text">ul. Suwalska 30<br />11-500 Giżycko</p>
            <p className="contact-text"><a href="tel:+48606803423" className="dark-link">tel. 606-803-423</a></p>
            <p className="contact-text">
              <a href="http://www.geoland-gizycko.com" className="dark-link">www.geoland-gizycko.com</a>
              <br />
              e-mail: <a href="mailto:marcinstemplewski@wp.pl" className="dark-link">marcinstemplewski@wp.pl</a>
            </p>
            <p className="contact-text">NIP: 845-164-89-83<br />REGON: 281351664</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <Hero navigation={<Navigation />} />
      <StoryStage />
      <ContactSection />
    </>
  )
}
