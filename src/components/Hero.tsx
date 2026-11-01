import { useRef } from 'react'
import HeroSequence from './HeroSequence'
import { STORY_SCROLL_SCREENS } from '../lib/lensHandoff'
import '../styles/hero.css'

function LensArrival() {
  return (
    <section className="lens-arrival absolute inset-0 z-10" data-active="false" data-visible="false" inert aria-hidden="true" aria-labelledby="opening-title">
      <div className="lens-arrival-copy">
        <h2 id="opening-title" className="opening-title font-light">
          <span className="opening-line">„Najlepsi geodeci</span>
          {' '}
          <span className="opening-line">w regionie”</span>
        </h2>
      </div>
    </section>
  )
}

export default function Hero() {
  const storyRef = useRef<HTMLElement>(null)

  return (
    <main id="start" ref={storyRef} className="current-hero story-shell relative w-full bg-background" style={{ height: `${(STORY_SCROLL_SCREENS + 1) * 100}svh` }}>
      <div className="hero-shell sticky top-0 isolate w-full overflow-hidden bg-background">
      <a href="#hero-title" className="skip-link">Przejdź do treści</a>
      <HeroSequence containerRef={storyRef} />

      <section className="hero-content relative z-10" aria-label="Usługi geodezyjne Geoland Giżycko">
      <div data-story-panel="0" data-active="true" className="story-panel">
        <h1 id="hero-title" tabIndex={-1} className="hero-title max-w-7xl font-display text-5xl leading-[0.95] font-normal tracking-[-2.46px] text-white sm:text-7xl md:text-8xl">
          Każda wielka <em className="font-normal text-white">wizja</em>
          <br className="headline-break" />
          {' '}zaczyna się od <em className="font-normal text-white">precyzji.</em>
        </h1>
      </div>

      <div data-story-panel="1" data-active="false" className="story-panel" inert aria-hidden="true">
        <h2 className="hero-title max-w-7xl font-display text-5xl leading-[0.95] font-normal tracking-[-2.46px] text-white sm:text-7xl md:text-8xl">Solidne podstawy<br /><em className="font-normal">Twoich planów.</em></h2>
        <p className="hero-description mt-8 max-w-2xl text-base leading-relaxed text-white sm:text-lg">
          Mapy do celów projektowych, pomiary powykonawcze i podziały
          nieruchomości.
        </p>
      </div>

      <div data-story-panel="2" data-active="false" className="story-panel story-panel-side" inert aria-hidden="true">
        <h2 className="story-heading font-display font-normal text-white">Wiedza<br />i <em>doświadczenie.</em></h2>
        <p className="hero-description mt-8 max-w-xl text-base leading-relaxed text-white sm:text-lg">Profesjonalny sprzęt pomiarowy, nowoczesne oprogramowanie geoinformatyczne i wieloletnie doświadczenie.</p>
      </div>

      </section>

      <LensArrival />
      <div className="story-progress absolute inset-x-0 bottom-0 z-20 h-[2px] origin-left bg-black/45" aria-hidden="true" />
      </div>
    </main>
  )
}
