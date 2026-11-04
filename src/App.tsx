import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type FocusEvent, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import Hero from './components/Hero'
import PersistentHeader from './components/PersistentHeader'
import { useMagneticCard } from './components/useMagneticCard'
import { getOfferRailOffset } from './lib/offerRail'

const navigation = [
  { label: 'Start', href: '#start', current: true },
  { label: 'O firmie', href: '#o-firmie' },
  { label: 'Oferta', href: '#oferta' },
  { label: 'Kontakt', href: '#kontakt' },
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

const pinnedStory = window.matchMedia('(min-width: 768px) and (min-height: 561px) and (prefers-reduced-motion: no-preference)')

const STORY_ABOUT_REVEAL = [0.02, 0.55]
const STORY_ABOUT_SLIDE = [0.6, 0.9]
const STORY_EQUIPMENT_REVEAL = [0.92, 1.3]
const STORY_OFFER_SLIDE = [1.35, 1.65]
const STORY_CARD_STEP = 0.22
const STORY_PARTNER_MOVES = [[3.07, 3.37], [3.52, 3.82], [3.97, 4.27]]
const STORY_END = 4.42
const STORY_ANCHORS: Record<string, number> = { 'o-firmie': STORY_ABOUT_REVEAL[1], oferta: STORY_OFFER_SLIDE[1] }

const stackedOffer = window.matchMedia('(max-width: 767px) and (min-height: 561px) and (prefers-reduced-motion: no-preference)')
const STACK_TITLE_LANDING = 0.12
const STACK_CARDS_START = STACK_TITLE_LANDING
const STACK_TITLE_MOVE = [1.47, 1.77]
const STACK_CARDS_END = STACK_TITLE_MOVE[0] - 0.1
const STACK_PARTNER_MOVES = [[1.77, 2.07], [2.07, 2.37], [2.37, 2.67]]
const STACK_END = 3.02

const STORY_MAX_LAG = 0.15
const DRIFT_EASING = 0.09

const BLOCK_DRIFT = 0.12
const BLOCK_FADE_START = 0.35
const BLOCK_FADE_END = 0.6

const REVEAL_START = 0.8
const REVEAL_END = 0.55

function ArrowUpRight({ className = '' }: { className?: string }) {
  return <svg className={className} width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 15 15 5M5 5h10v10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [focusedControl, setFocusedControl] = useState<string | null>(null)
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

  const renderLayer = (visualCopy = false) => (
    <header ref={visualCopy ? undefined : navigationRef} className={visualCopy ? 'relative' : 'navigation-base-layer relative'}
      onFocusCapture={visualCopy ? undefined : (event) => {
        const target = event.target as HTMLElement
        setFocusedControl(target.matches(':focus-visible') ? target.dataset.navControl ?? null : null)
      }}
      onBlurCapture={visualCopy ? undefined : () => setFocusedControl(null)}>
      <nav className="navigation-shell mx-auto flex max-w-7xl items-center justify-between px-8 py-6" aria-label="Nawigacja główna">
        <a href="#start" data-nav-control="logo" data-visual-focus={visualCopy && focusedControl === 'logo' || undefined} aria-label="Geoland Giżycko — strona główna" className="wordmark flex items-baseline gap-2 text-black">
          <span className="font-display text-[35px] leading-none tracking-tight">Geoland<span className="logo-point">.</span></span>
          <span className="relative -top-3 text-[9px] font-medium tracking-[0.16em] uppercase">Giżycko</span>
        </a>
        <div className="desktop-navigation flex items-center gap-9">
          {navigation.map((item) => (
            <a key={item.label} href={item.href} data-nav-control={item.label} data-visual-focus={visualCopy && focusedControl === item.label || undefined} aria-current={item.current ? 'page' : undefined} className={`nav-link text-sm transition-colors hover:text-black ${item.current ? 'text-black' : 'text-muted'}`}>
              {item.label}
            </a>
          ))}
        </div>
        <a href="tel:+48606803423" data-nav-control="cta" data-visual-focus={visualCopy && focusedControl === 'cta' || undefined} className="nav-cta button-dark flex items-center gap-5 rounded-full bg-black px-6 py-2.5 text-sm text-white">
          Porozmawiajmy <ArrowUpRight />
        </a>
        <button ref={visualCopy ? undefined : toggleRef} data-nav-control="menu" data-visual-focus={visualCopy && focusedControl === 'menu' || undefined} type="button" className="mobile-toggle flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-full border border-black/10 bg-white/75" aria-label={menuOpen ? 'Zamknij menu' : 'Otwórz menu'} aria-expanded={menuOpen} aria-controls={visualCopy ? undefined : 'mobile-menu'} onClick={() => setMenuOpen((current) => !current)}>
          <span className={`h-px w-[18px] bg-black transition-transform ${menuOpen ? 'translate-y-[3px] rotate-45' : ''}`} />
          <span className={`h-px w-[18px] bg-black transition-transform ${menuOpen ? '-translate-y-[3px] -rotate-45' : ''}`} />
        </button>
      </nav>
      {menuOpen && !visualCopy && (
        <nav id="mobile-menu" aria-label="Menu mobilne" className="mobile-menu absolute right-6 left-6 top-full flex flex-col gap-1 rounded-2xl border border-black/10 bg-white/95 p-3 shadow-xl shadow-black/5 backdrop-blur-xl">
          {navigation.map((item) => <a key={item.label} href={item.href} className="rounded-xl px-5 py-3.5 text-sm text-black hover:bg-black/5" onClick={() => setMenuOpen(false)}>{item.label}</a>)}
          <a href="tel:+48606803423" className="mt-1 rounded-xl bg-black px-5 py-3.5 text-sm text-white">Zadzwoń: 606 803 423</a>
        </nav>
      )}
    </header>
  )

  return <>
    {renderLayer()}
    <div className="navigation-contact-layer" aria-hidden="true" inert>{renderLayer(true)}</div>
  </>
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


function getBlockDrift(block: HTMLElement, drift: number) {
  const { top, height } = block.getBoundingClientRect()
  const viewport = window.innerHeight
  const restingTop = top - drift * viewport * BLOCK_DRIFT
  return clamp((restingTop + height / 2 - viewport / 2) / viewport, -1, 1)
}


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

function getBlockReveal(block: HTMLElement) {
  const { top, height } = block.getBoundingClientRect()
  const viewport = window.innerHeight
  return clamp((viewport * REVEAL_START - top) / (viewport * (REVEAL_START - REVEAL_END) + height), 0, 1)
}


function renderOfferCards(root: HTMLElement, position: number, cardsStart: number, cardsEnd = cardsStart + offers.length * STORY_CARD_STEP) {
  const gallery = root.querySelector<HTMLElement>('.offer-gallery')
  const rail = root.querySelector<HTMLElement>('.offer-list')
  const card = rail?.querySelector<HTMLElement>('.offer-row')
  if (!gallery || !rail || !card) return
  const stride = card.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap)
  const travel = Math.max(0, rail.getBoundingClientRect().width - gallery.getBoundingClientRect().width)
  const progress = phase(position, [cardsStart, cardsEnd])
  rail.style.transform = translateX(-getOfferRailOffset(progress, travel, stride))
}

function moveOfferByKey(event: ReactKeyboardEvent<HTMLDivElement>) {

  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return
  const gallery = event.currentTarget
  const rail = gallery.querySelector<HTMLElement>('.offer-list')
  const card = rail?.querySelector<HTMLElement>('.offer-row')
  const stage = gallery.closest<HTMLElement>('.story-stage[data-pinned]')
  const scene = stage ?? gallery.closest<HTMLElement>('.offer-section[data-stacked]')
  if (!rail || !card || !scene) return
  const stride = card.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap)
  const stops = Math.max(1, Math.ceil((rail.getBoundingClientRect().width - gallery.getBoundingClientRect().width) / stride))
  const start = stage ? STORY_OFFER_SLIDE[1] : STACK_CARDS_START
  const duration = stage ? offers.length * STORY_CARD_STEP : STACK_CARDS_END - STACK_CARDS_START
  const position = -scene.getBoundingClientRect().top / window.innerHeight

  if (position < start - 0.01 || position > start + duration + 0.01) return
  const current = Math.round(phase(position, [start, start + duration]) * stops)
  const next = clamp(current + (event.key === 'ArrowRight' ? 1 : -1), 0, stops)
  if (next === current) return
  event.preventDefault()
  window.scrollTo({ top: scene.getBoundingClientRect().top + window.scrollY + (start + next / stops * duration) * window.innerHeight, behavior: 'smooth' })
}


function getStackPosition(section: HTMLElement) {
  return clamp(-section.getBoundingClientRect().top / window.innerHeight, -1, STACK_END)
}


function getTitleHeight(position: number) {
  if (position <= -STACK_TITLE_LANDING) return -position
  if (position >= STACK_TITLE_LANDING) return 0
  return (STACK_TITLE_LANDING - position) ** 2 / (4 * STACK_TITLE_LANDING)
}


function renderOfferExit(root: HTMLElement, amount: number) {
  const distance = amount * window.innerHeight
  const title = root.querySelector<HTMLElement>('.offer-title')
  const list = root.querySelector<HTMLElement>('.offer-gallery')
  if (title) title.style.transform = `translate3d(0, ${(-distance).toFixed(1)}px, 0)`
  if (list) list.style.transform = `translate3d(0, ${distance.toFixed(1)}px, 0)`
}

function renderStack(section: HTMLElement, easedPosition: number) {
  const position = Math.max(easedPosition, getStackPosition(section) - STORY_MAX_LAG)


  const title = section.querySelector<HTMLElement>('.offer-title')
  const gallery = section.querySelector<HTMLElement>('.offer-gallery')
  const trail = Math.max(0, getTitleHeight(position) - Math.max(0, -getStackPosition(section)))
  const arrival = `0 ${(trail * window.innerHeight).toFixed(1)}px`
  if (title) {
    title.style.translate = arrival
    title.style.scale = '1'
  }
  if (gallery) gallery.style.translate = arrival

  renderOfferCards(section, position, STACK_CARDS_START, STACK_CARDS_END)
  renderOfferExit(section, eased(position, STACK_TITLE_MOVE))


  const width = section.clientWidth
  const label = section.querySelector<HTMLElement>('.partners-title')
  if (label) label.style.transform = translateX((1 - eased(position, STACK_TITLE_MOVE)) * width)
  section.querySelectorAll<HTMLElement>('.partners-item').forEach((item, index) => {
    item.style.transform = translateX((1 - eased(position, STACK_PARTNER_MOVES[index])) * width)
  })
}

function renderStory(stage: HTMLElement, easedPosition: number) {
  const position = Math.max(easedPosition, getStoryPosition(stage) - STORY_MAX_LAG)
  const width = stage.clientWidth
  const query = <T extends HTMLElement>(selector: string) => stage.querySelector<T>(selector)
  const blocks = stage.querySelectorAll('.about-block')

  const slid = eased(position, STORY_ABOUT_SLIDE) + eased(position, STORY_OFFER_SLIDE)
  const track = query('.story-track')
  if (track) track.style.transform = translateX(-slid * width)
  revealWords(blocks[0], phase(position, STORY_ABOUT_REVEAL))
  revealWords(blocks[1], phase(position, STORY_EQUIPMENT_REVEAL))

  renderOfferCards(stage, position, STORY_OFFER_SLIDE[1])

  renderOfferExit(stage, eased(position, STORY_PARTNER_MOVES[0]))


  const shown = STORY_PARTNER_MOVES.reduce((sum, move) => sum + eased(position, move), -1)
  stage.querySelectorAll<HTMLElement>('.partners-item').forEach((item, index) => {
    item.style.transform = translateX((index - shown) * width)
  })
  const label = query('.partners-title')
  if (label) label.style.transform = translateX(Math.max(0, -shown) * width)
}

function WordReveal({ text }: { text: string }) {
  return text.split(' ').map((word, index) => (
    <span key={index}>{index > 0 && ' '}<span className="story-word">{word}</span></span>
  ))
}

function AboutBlock({ title, className = '', drift, children }: { title: string; className?: string; drift: boolean; children: ReactNode }) {
  const ref = useEasedScroll<HTMLDivElement>(getBlockDrift, renderBlockDrift, { enabled: drift })
  const copyRef = useEasedScroll<HTMLDivElement>(getBlockReveal, revealWords, { enabled: drift })

  return (
    <div ref={ref} className={`about-block ${className}`}>
      <div ref={copyRef}>
        <h3 className="about-heading font-light">{title}</h3>
        {children}
      </div>
    </div>
  )
}

function AboutSection({ drift }: { drift: boolean }) {
  return (
    <section id="o-firmie" className="about-section" aria-label="O firmie">
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
  useMagneticCard(ref)

  return (
    <li ref={ref} className="offer-row" style={{ '--note-rotation': `${[-1.8, 1.6, -1.2, 2, -1.5, 1.3][index]}deg` } as CSSProperties}>
      <div className="offer-card">
        <h3 className="offer-name font-light">{name}</h3>
        <div className="offer-note"><p className="offer-text font-mono">{text}</p></div>
      </div>
    </li>
  )
}

function OfferSection({ drift, stacked }: { drift: boolean; stacked: boolean }) {
  const ref = useEasedScroll<HTMLElement>(getStackPosition, renderStack, { enabled: stacked })

  return (
    <section ref={ref} id="oferta" className="offer-section" data-stacked={stacked || undefined} aria-labelledby="offer-title">
      <div className="offer-layout mx-auto w-full max-w-7xl px-8">
        <h2 id="offer-title" className="offer-title font-light">Oferta</h2>
        <div className="offer-gallery" role="region" aria-label="Usługi geodezyjne" tabIndex={drift ? undefined : 0} onKeyDown={moveOfferByKey}>
          <ol className="offer-list">
            {offers.map((offer, index) => (
              <OfferRow key={offer.name} index={index} name={offer.name} text={offer.text} drift={drift} />
            ))}
          </ol>
        </div>
        {stacked && <PartnersSection drift={false} />}
      </div>
    </section>
  )
}


function showPartner(event: FocusEvent<HTMLAnchorElement>, index: number) {
  const stage = event.currentTarget.closest<HTMLElement>('.story-stage[data-pinned]')
  const stack = event.currentTarget.closest<HTMLElement>('.offer-section[data-stacked]')
  const scene = stage ?? stack
  const moves = stage ? STORY_PARTNER_MOVES : STACK_PARTNER_MOVES
  if (scene) window.scrollTo(0, scene.getBoundingClientRect().top + window.scrollY + moves[index][1] * window.innerHeight)
}

function PartnersSection({ drift }: { drift: boolean }) {
  const ref = useEasedScroll<HTMLDivElement>(getBlockDrift, renderBlockDrift, { enabled: drift })

  return (
    <section className="partners-section" aria-labelledby="partners-title">
      <div ref={ref} className="partners-block mx-auto w-full max-w-7xl px-8">
        <h2 id="partners-title" className="partners-title font-light">Współpracujemy</h2>
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

const subscribeStoryLayout = (onChange: () => void) => {
  pinnedStory.addEventListener('change', onChange)
  stackedOffer.addEventListener('change', onChange)
  return () => {
    pinnedStory.removeEventListener('change', onChange)
    stackedOffer.removeEventListener('change', onChange)
  }
}

function StoryStage() {
  const pinned = useSyncExternalStore(subscribeStoryLayout, () => pinnedStory.matches)
  const stacked = useSyncExternalStore(subscribeStoryLayout, () => stackedOffer.matches)
  const ref = useEasedScroll<HTMLDivElement>(getStoryPosition, renderStory, { enabled: pinned })


  const scrollToPinnedAnchor = (id: string, behavior?: ScrollBehavior) => {
    const position = STORY_ANCHORS[id]
    const stage = ref.current
    if (position === undefined || !stage?.hasAttribute('data-pinned')) return false
    window.scrollTo({ top: stage.getBoundingClientRect().top + window.scrollY + position * window.innerHeight, behavior })
    return true
  }
  const scrollToPinnedAnchorRef = useRef(scrollToPinnedAnchor)

  useLayoutEffect(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined

    if (navigation?.type === 'reload' || navigation?.type === 'back_forward') return
    const id = location.hash.slice(1)
    if (id && !scrollToPinnedAnchorRef.current(id, 'instant')) document.getElementById(id)?.scrollIntoView({ behavior: 'instant' })
  }, [])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const href = (event.target as Element).closest('a')?.getAttribute('href')
      if (!href?.startsWith('#') || !scrollToPinnedAnchorRef.current(href.slice(1))) return
      event.preventDefault()
      history.replaceState(null, '', href)
    }
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('click', onClick)
    }
  }, [])


  return (
    <div key={`${pinned}-${stacked}`} ref={ref} className="story-stage" data-pinned={pinned || undefined} data-stacked-offer={stacked || undefined}>
      <div className="story-camera">
        <div className="story-track">
          <AboutSection drift={!pinned} />
          <OfferSection drift={!pinned && !stacked} stacked={stacked} />
        </div>
        {!stacked && <PartnersSection drift={!pinned} />}
      </div>
    </div>
  )
}

function ContactSection() {
  const ref = useEasedScroll<HTMLDivElement>(getFooterDrift, renderBlockDrift)

  return (
    <footer id="kontakt" className="contact-section" aria-labelledby="contact-title">
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
    <div className="site-with-navigation">
      <PersistentHeader navigation={<Navigation />} />
      <Hero />
      <StoryStage />
      <ContactSection />
    </div>
  )
}
