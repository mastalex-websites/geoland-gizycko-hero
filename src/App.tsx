import { useEffect, useRef, useState, type ReactNode } from 'react'
import ScrollSequence from './components/ScrollSequence'

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
const DRIFT_EASING = 0.09
// The quote's scroll starts this share of the flight before its end, so the hero fades and the zoom starts on the last frames.
const QUOTE_FLIGHT_LEAD = 0.085
// Stages of the quote as shares of its scroll: hero fade, growth from the lens, move to the left.
const QUOTE_FADE_END = 0.08
const QUOTE_GROW_START = 0.091
const QUOTE_GROW_END = 0.659
const QUOTE_MOVE_END = 0.943
const QUOTE_MIN_SCALE = 0.008
// First frame that is fully black inside the lens; the quote never shows over an earlier one.
const QUOTE_LENS_FRAME = 232
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

function useEasedScroll<T extends HTMLElement>(getTarget: (element: T, value: number) => number, render: (element: T, value: number) => void, runWhenReduced = false) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || (reducedMotion.matches && !runWhenReduced)) return

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
  }, [getTarget, render, runWhenReduced])

  return ref
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const smoothstep = (value: number) => {
  const position = clamp(value, 0, 1)
  return position * position * (3 - 2 * position)
}

// Reads the frame actually drawn, which can trail the scroll position while frames load.
function isInsideLens(stage: HTMLElement) {
  const canvas = stage.closest('.hero-shell')?.querySelector('canvas')
  return Number(canvas?.dataset.frame) >= QUOTE_LENS_FRAME
}

// 0 until the last frames of the flight, 1 when the hero is about to unpin.
function getQuoteProgress(stage: HTMLElement) {
  const shell = stage.closest('main')
  const flight = shell?.querySelector<HTMLElement>('.flight-track')
  if (!shell || !flight) return 0
  const flightDistance = flight.offsetHeight - window.innerHeight
  const lead = flightDistance * QUOTE_FLIGHT_LEAD
  const scrolled = -shell.getBoundingClientRect().top - flightDistance + lead
  return clamp(scrolled / Math.max(1, shell.offsetHeight - flight.offsetHeight + lead), 0, 1)
}

function renderQuote(stage: HTMLElement, progress: number) {
  const title = stage.querySelector<HTMLElement>('.opening-title')
  const backdrop = stage.querySelector<HTMLElement>('.quote-backdrop')
  const hero = stage.closest<HTMLElement>('.hero-shell')
  if (!title || !backdrop || !hero) return

  const heroFade = 1 - clamp(progress / QUOTE_FADE_END, 0, 1)
  hero.style.setProperty('--hero-fade', heroFade.toFixed(3))
  hero.toggleAttribute('data-hero-faded', heroFade === 0)
  backdrop.style.opacity = smoothstep((progress - QUOTE_GROW_END) / (1 - QUOTE_GROW_END)).toFixed(3)

  // Easing must not carry the quote back over the flight when scrolling up quickly.
  const visibility = isInsideLens(stage) ? clamp((progress - QUOTE_GROW_START) / QUOTE_FADE_END, 0, 1) : 0
  title.style.opacity = visibility.toFixed(3)
  if (reducedMotion.matches) return

  // The size changes evenly with the scroll, so the text never rushes at the end of the zoom.
  const grow = smoothstep((progress - QUOTE_GROW_START) / (QUOTE_GROW_END - QUOTE_GROW_START))
  const move = smoothstep((progress - QUOTE_GROW_END) / (QUOTE_MOVE_END - QUOTE_GROW_END))
  const scale = QUOTE_MIN_SCALE + (1 - QUOTE_MIN_SCALE) * grow
  const offset = (stage.clientWidth / 2 - title.offsetLeft - title.offsetWidth / 2) * (1 - move)
  title.style.transform = `translate(${offset.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`
  // Lines start centred on the lens and settle into left alignment.
  title.querySelectorAll<HTMLElement>('.opening-line').forEach((line) => {
    line.style.transform = `translateX(${(((title.offsetWidth - line.offsetWidth) / 2) * (1 - move)).toFixed(1)}px)`
  })
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

function OpeningQuote() {
  const stageRef = useEasedScroll<HTMLElement>(getQuoteProgress, renderQuote, true)

  return (
    <section ref={stageRef} className="quote-stage pointer-events-none absolute inset-0 z-[25] flex items-center" aria-labelledby="opening-title">
      <div className="quote-backdrop absolute inset-0" />
      <div className="mx-auto w-full max-w-7xl px-8">
        <h2 id="opening-title" className="opening-title font-light">
          <span className="opening-line">„Najlepsi geodeci</span>
          {' '}
          <span className="opening-line">w regionie”</span>
        </h2>
      </div>
    </section>
  )
}

function AboutBlock({ number, title, className = '', children }: { number: string; title: string; className?: string; children: ReactNode }) {
  const ref = useEasedScroll<HTMLDivElement>(getBlockDrift, renderBlockDrift)

  return (
    <div ref={ref} className={`about-block ${className}`}>
      <span className="about-number font-mono" aria-hidden="true">{number}</span>
      <div>
        <h3 className="about-heading font-light">{title}</h3>
        {children}
      </div>
    </div>
  )
}

function AboutSection() {
  return (
    <section className="about-section" aria-label="O firmie">
      <div className="about-grid mx-auto w-full max-w-7xl px-8">
        <AboutBlock number="01." title="Kompleksowe usługi">
          <p className="about-text font-mono">
            Geoland-Giżycko jest małą firmą geodezyjną oferującą kompleksowe usługi z zakresu pomiarów powykonawczych, map do celów projektowych i podziałów nieruchomości. Wiedza oraz wieloletnie doświadczenie zdobyte podczas realizacji zleceń geodezyjnych na terenie całego kraju, pozwalają nam na wykonanie usług na najwyższym poziomie.
          </p>
        </AboutBlock>
        <AboutBlock number="02." title="Sprzęt i oprogramowanie" className="about-block-offset">
          <p className="about-text font-mono">
            Dysponujemy profesjonalnym sprzętem pomiarowym oraz najnowszym oprogramowaniem geo-informatycznym co pozwala nam na wykonywanie usług na najwyższym poziomie. Gwarantujemy naszym klientom satysfakcję oraz zadowolenie z powierzonych nam prac.
          </p>
          <p className="about-signature font-mono">inż. Marcin Stemplewski</p>
        </AboutBlock>
      </div>
    </section>
  )
}

function OfferRow({ number, name, text }: { number: string; name: string; text: string }) {
  const ref = useEasedScroll<HTMLLIElement>(getBlockDrift, renderBlockDrift)

  return (
    <li ref={ref} className="offer-row">
      <span className="about-number font-mono" aria-hidden="true">{number}</span>
      <h3 className="offer-name font-light">{name}</h3>
      <p className="offer-text font-mono">{text}</p>
    </li>
  )
}

function OfferSection() {
  return (
    <section className="offer-section" aria-labelledby="offer-title">
      <div className="mx-auto w-full max-w-7xl px-8">
        <h2 id="offer-title" className="offer-title font-light">Oferta</h2>
        <ol className="offer-list">
          {offers.map((offer, index) => (
            <OfferRow key={offer.name} number={`${String(index + 1).padStart(2, '0')}.`} name={offer.name} text={offer.text} />
          ))}
        </ol>
      </div>
    </section>
  )
}

function PartnersSection() {
  const ref = useEasedScroll<HTMLDivElement>(getBlockDrift, renderBlockDrift)

  return (
    <section className="partners-section" aria-labelledby="partners-title">
      <div ref={ref} className="partners-block mx-auto w-full max-w-7xl px-8">
        <h2 id="partners-title" className="partners-title font-mono">Współpracujemy</h2>
        <ul className="partners-list">
          {partners.map((partner) => (
            <li key={partner.name} className="partners-item">
              <a href={partner.href} target="_blank" rel="noreferrer" className="partners-link dark-link font-light">{partner.name}</a>
            </li>
          ))}
        </ul>
      </div>
    </section>
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
  const storyRef = useRef<HTMLElement>(null)
  const flightRef = useRef<HTMLDivElement>(null)

  return (
    <>
    <main id="start" ref={storyRef} className="story-shell relative w-full bg-background">
      <div ref={flightRef} className="flight-track pointer-events-none absolute inset-x-0 top-0" aria-hidden="true" />
      <div className="hero-shell sticky top-0 isolate w-full overflow-hidden bg-background">
      <a href="#hero-title" className="skip-link">Przejdź do treści</a>
      <ScrollSequence containerRef={storyRef} flightRef={flightRef} />
      <Navigation />

      <section className="hero-content relative z-10" aria-label="Usługi geodezyjne Geoland Giżycko">
      <div data-story-panel="0" data-active="true" className="story-panel">
        <div className="hero-kicker mb-5 flex items-center gap-3 text-[10px] font-medium tracking-[0.2em] text-white uppercase sm:text-[11px]">
          <span className="h-px w-7 bg-white/65" />
          Usługi geodezyjne · Giżycko
          <span className="h-px w-7 bg-white/65" />
        </div>

        <h1 id="hero-title" tabIndex={-1} className="hero-title max-w-7xl font-display text-5xl leading-[0.95] font-normal tracking-[-2.46px] text-white sm:text-7xl md:text-8xl">
          Każda wielka <em className="font-normal text-white">wizja</em>
          <br className="headline-break" />
          {' '}zaczyna się od <em className="font-normal text-white">precyzji.</em>
        </h1>
      </div>

      <div data-story-panel="1" data-active="false" className="story-panel" inert aria-hidden="true">
        <p className="hero-kicker mb-5 text-[10px] font-medium tracking-[0.2em] text-white uppercase sm:text-[11px]">Od planów do realizacji</p>
        <h2 className="hero-title max-w-7xl font-display text-5xl leading-[0.95] font-normal tracking-[-2.46px] text-white sm:text-7xl md:text-8xl">Solidne podstawy<br /><em className="font-normal">Twoich planów.</em></h2>
        <p className="hero-description mt-8 max-w-2xl text-base leading-relaxed text-white sm:text-lg">
          Mapy do celów projektowych, pomiary powykonawcze i podziały
          nieruchomości.
        </p>
      </div>

      <div data-story-panel="2" data-active="false" className="story-panel story-panel-side" inert aria-hidden="true">
        <p className="hero-kicker mb-5 text-[10px] font-medium tracking-[0.2em] text-white uppercase sm:text-[11px]">Precyzja w terenie</p>
        <h2 className="story-heading font-display font-normal text-white">Wiedza<br />i <em>doświadczenie.</em></h2>
        <p className="hero-description mt-8 max-w-xl text-base leading-relaxed text-white sm:text-lg">Profesjonalny sprzęt pomiarowy, nowoczesne oprogramowanie geoinformatyczne i wieloletnie doświadczenie.</p>
      </div>

      <div data-story-panel="3" data-active="false" className="story-panel story-panel-side" inert aria-hidden="true">
        <p className="hero-kicker mb-5 text-[10px] font-medium tracking-[0.2em] text-white uppercase sm:text-[11px]">Geoland Giżycko</p>
        <h2 className="story-heading font-display font-normal text-white">Precyzja u podstaw<br /><em>Twoich planów.</em></h2>
        <a href="tel:+48606803423" className="hero-cta button-dark mt-10 inline-flex items-center justify-center gap-7 rounded-full border border-white/40 bg-black px-10 py-5 text-base text-white">
          Porozmawiajmy o projekcie
          <ArrowUpRight className="shrink-0" />
        </a>
        <p className="hero-credential mt-5 text-[11px] tracking-[0.015em] text-white">Geodeta uprawniony inż. Marcin Stemplewski</p>
      </div>
      </section>

      <div className="scroll-cue pointer-events-none absolute z-20 flex flex-col items-center gap-3" aria-hidden="true">
        <span className="text-[9px] font-medium tracking-[0.18em] text-white uppercase">Przewiń, by odkryć</span>
        <span className="scroll-track relative block h-10 w-px overflow-hidden bg-white/35"><span className="scroll-track-fill absolute inset-x-0 top-0 bg-white" /></span>
      </div>

      <div id="kontakt" className="hero-bottom relative z-10 mx-auto flex w-full max-w-7xl items-end justify-between gap-6 px-8 pb-7">
        <a className="address-link group flex items-center gap-3" href="https://www.google.com/maps/search/?api=1&query=Suwalska+30+11-500+Gi%C5%BCycko" target="_blank" rel="noreferrer" aria-label="Otwórz adres: ul. Suwalska 30, 11-500 Giżycko w Mapach Google">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur-md">
            <svg width="15" height="18" viewBox="0 0 18 22" fill="none" aria-hidden="true"><path d="M16 8.5C16 14 9 20 9 20S2 14 2 8.5a7 7 0 1 1 14 0Z" stroke="currentColor" strokeWidth="1.2" /><circle cx="9" cy="8.5" r="2.25" stroke="currentColor" strokeWidth="1.2" /></svg>
          </span>
          <span className="text-left text-[11px] leading-[1.7] text-white"><span className="text-white">Tu zaczynają się Twoje plany.</span><br />ul. Suwalska 30, 11-500 Giżycko</span>
        </a>
        <a href="tel:+48606803423" className="contact-number flex items-center gap-3 text-xs text-white transition-opacity hover:opacity-60">
          <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
          606 803 423 <ArrowUpRight className="ml-1" />
        </a>
      </div>
      <div className="story-progress absolute inset-x-0 bottom-0 z-20 h-[2px] origin-left bg-black/45" aria-hidden="true" />
      <OpeningQuote />
      </div>
    </main>
    <AboutSection />
    <OfferSection />
    <PartnersSection />
    <ContactSection />
    </>
  )
}
