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

// Share of the viewport height each opening line travels; the gap between lines opens away from the centre.
const DRIFT_NEAR = 0.2
const DRIFT_FAR = 0.36
const DRIFT_EASING = 0.09

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

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.35 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return { ref, revealClass: visible ? 'animate-fade-rise' : 'opacity-0' }
}

function OpeningSection() {
  const { ref: sectionRef, revealClass } = useReveal<HTMLElement>()

  useEffect(() => {
    const section = sectionRef.current
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lines = [...section.querySelectorAll<HTMLElement>('[data-drift-line]')]
    let animationFrame = 0
    let drift = 0

    // -1 when the section enters from below, 0 when it fills the viewport, 1 when it has left.
    const getTarget = () => {
      const { top, height } = section.getBoundingClientRect()
      return Math.min(1, Math.max(-1, -top / height))
    }
    const render = () => {
      lines.forEach((line, index) => {
        const leading = (drift < 0) === (index === 0)
        const shift = -drift * window.innerHeight * (leading ? DRIFT_NEAR : DRIFT_FAR)
        line.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`
      })
    }
    const tick = () => {
      drift += (getTarget() - drift) * DRIFT_EASING
      render()
      animationFrame = requestAnimationFrame(tick)
    }
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(animationFrame)
      if (entry.isIntersecting) animationFrame = requestAnimationFrame(tick)
      else {
        drift = getTarget()
        render()
      }
    })

    drift = getTarget()
    render()
    observer.observe(section)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(animationFrame)
    }
  }, [sectionRef])

  return (
    <section ref={sectionRef} className="opening-section flex items-center" aria-labelledby="opening-title">
      <div className="mx-auto w-full max-w-7xl px-8">
        <h2 id="opening-title" className={`opening-title font-light ${revealClass}`}>
          <span data-drift-line className="opening-line">Najlepsi geodeci</span>
          {' '}
          <span data-drift-line className="opening-line">w regionie</span>
        </h2>
      </div>
    </section>
  )
}

function AboutBlock({ number, title, className = '', children }: { number: string; title: string; className?: string; children: ReactNode }) {
  const { ref, revealClass } = useReveal<HTMLDivElement>()

  return (
    <div ref={ref} className={`about-block ${className} ${revealClass}`}>
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
  const { ref, revealClass } = useReveal<HTMLLIElement>()

  return (
    <li ref={ref} className={`offer-row ${revealClass}`}>
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

export default function App() {
  const storyRef = useRef<HTMLElement>(null)

  return (
    <>
    <main id="start" ref={storyRef} className="story-shell relative w-full bg-background">
      <div className="hero-shell sticky top-0 isolate w-full overflow-hidden bg-background">
      <a href="#hero-title" className="skip-link">Przejdź do treści</a>
      <ScrollSequence containerRef={storyRef} />
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
      </div>
    </main>
    <OpeningSection />
    <AboutSection />
    <OfferSection />
    </>
  )
}
