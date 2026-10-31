import { useEffect, useRef, useState } from 'react'
import ScrollSequence from './components/ScrollSequence'

const navigation = [
  { label: 'Start', href: '#start', current: true },
  { label: 'O firmie', href: 'https://www.geoland-gizycko.com/#wrapperMain' },
  { label: 'Oferta', href: 'https://www.geoland-gizycko.com/#:~:text=MAPY%20NUMERYCZNE' },
  { label: 'Kontakt', href: 'mailto:marcinstemplewski@wp.pl' },
]

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

export default function App() {
  const storyRef = useRef<HTMLElement>(null)

  return (
    <main id="start" ref={storyRef} className="story-shell relative w-full bg-background">
      <div className="hero-shell sticky top-0 isolate w-full overflow-hidden bg-background">
      <a href="#hero-title" className="skip-link">Przejdź do treści</a>
      <ScrollSequence containerRef={storyRef} />
      <Navigation />

      <section className="hero-content relative z-10 flex flex-col items-center justify-center px-6 text-center" style={{ paddingTop: 'calc(8rem - 75px)' }} aria-labelledby="hero-title">
        <div className="animate-fade-rise mb-7 flex items-center gap-3 text-[10px] font-medium tracking-[0.2em] text-muted uppercase sm:text-[11px]">
          <span className="h-px w-7 bg-black/25" />
          Usługi geodezyjne · Giżycko
          <span className="h-px w-7 bg-black/25" />
        </div>

        <h1 id="hero-title" tabIndex={-1} className="hero-title animate-fade-rise max-w-7xl font-display text-5xl leading-[0.95] font-normal tracking-[-2.46px] text-black sm:text-7xl md:text-8xl">
          Każda wielka <em className="font-normal text-muted">wizja</em>
          <br className="headline-break" />
          {' '}zaczyna się od <em className="font-normal text-muted">precyzji.</em>
        </h1>

        <p className="hero-description animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Mapy do celów projektowych, pomiary powykonawcze i podziały
          nieruchomości. Łączymy wiedzę i wieloletnie doświadczenie,
          by Twoje plany miały solidne podstawy.
        </p>

        <a href="tel:+48606803423" className="hero-cta button-dark animate-fade-rise-delay-2 mt-12 inline-flex items-center justify-center gap-7 rounded-full bg-black px-14 py-5 text-base text-white">
          Porozmawiajmy o projekcie
          <ArrowUpRight className="shrink-0" />
        </a>
        <p className="animate-fade-rise-delay-2 mt-5 text-[11px] tracking-[0.015em] text-muted">Geodeta uprawniony inż. Marcin Stemplewski</p>
      </section>

      <div className="story-outro pointer-events-none absolute z-10" aria-hidden="true">
        <p className="mb-4 text-[10px] tracking-[0.2em] text-muted uppercase">Geoland Giżycko</p>
        <p className="font-display text-5xl leading-[1.05] tracking-tight text-black sm:text-6xl">Precyzja u podstaw<br /><em className="text-muted">Twoich planów.</em></p>
      </div>

      <div className="scroll-cue pointer-events-none absolute z-20 flex flex-col items-center gap-3" aria-hidden="true">
        <span className="text-[9px] font-medium tracking-[0.18em] text-black/70 uppercase">Przewiń, by odkryć</span>
        <span className="scroll-track relative block h-10 w-px overflow-hidden bg-black/15"><span className="scroll-track-fill absolute inset-x-0 top-0 bg-black/65" /></span>
      </div>

      <div id="kontakt" className="hero-bottom relative z-10 mx-auto flex w-full max-w-7xl items-end justify-between gap-6 px-8 pb-7">
        <a className="address-link group flex items-center gap-3" href="https://www.google.com/maps/search/?api=1&query=Suwalska+30+11-500+Gi%C5%BCycko" target="_blank" rel="noreferrer" aria-label="Otwórz adres: ul. Suwalska 30, 11-500 Giżycko w Mapach Google">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/55 backdrop-blur-md">
            <svg width="15" height="18" viewBox="0 0 18 22" fill="none" aria-hidden="true"><path d="M16 8.5C16 14 9 20 9 20S2 14 2 8.5a7 7 0 1 1 14 0Z" stroke="currentColor" strokeWidth="1.2" /><circle cx="9" cy="8.5" r="2.25" stroke="currentColor" strokeWidth="1.2" /></svg>
          </span>
          <span className="text-left text-[11px] leading-[1.7] text-muted"><span className="text-black">Tu zaczynają się Twoje plany.</span><br />ul. Suwalska 30, 11-500 Giżycko</span>
        </a>
        <a href="tel:+48606803423" className="contact-number flex items-center gap-3 text-xs text-black transition-opacity hover:opacity-60">
          <span className="h-1.5 w-1.5 rounded-full bg-black/60" aria-hidden="true" />
          606 803 423 <ArrowUpRight className="ml-1" />
        </a>
      </div>
      <div className="story-progress absolute inset-x-0 bottom-0 z-20 h-[2px] origin-left bg-black/45" aria-hidden="true" />
      </div>
    </main>
  )
}
