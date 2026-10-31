# Geoland Giżycko — scrollytelling hero

Samodzielna sekcja hero w React, Vite, Tailwind CSS 4 i TypeScript.
Jedna przypięta scena zajmuje 360 wysokości ekranu przewijania. Scroll
steruje sekwencją klatek z filmu: w dół do przodu, w górę do tyłu.

```sh
npm install
npm run dev
```

Build produkcyjny: `npm run build`. Podgląd buildu: `npm run preview`.

## Treść i media

Źródło informacji: https://www.geoland-gizycko.com/ (odczyt 31.10.2026).
Zachowano zakres wymienionych usług, nazwisko, uprawnienia, adres i numer
telefonu. Nagłówek jest autorską parafrazą marketingową. Pozycje „O firmie”
i „Oferta” prowadzą do obecnej strony firmy; nie dodano kolejnych sekcji.
Przyciski kontaktu otwierają połączenie telefoniczne.

240 klatek WebP w `public/media/frames/` pochodzi wyłącznie z pliku
użytkownika `gemini_generated_video_0e750e90.mp4` (24 klatki/s, 1280 × 720).
Nie użyto generowania obrazów. Poster to również klatka z tego filmu.

`ScrollSequence.tsx` rysuje klatki na canvas. Pasywny listener scrolla
aktualizuje scenę przez `requestAnimationFrame`, bez pętli odtwarzania
i bez aktualizowania React przy każdym scrollu. Wczytywane są cztery obrazy
naraz; pamięć przechowuje maksymalnie 24 zdekodowane klatki. Przy szybkim
przewijaniu do czasu załadowania właściwej klatki wyświetla się najbliższa.
Obsługiwane są zmiany rozmiaru okna, odwracanie scrolla i preferencja
ograniczenia ruchu. W tym trybie przewijanie nadal działa, a scena przełącza
się pomiędzy 13 statycznymi ujęciami zamiast płynnego przybliżenia.

Biała mgła jest ograniczona do górnych 176 px. Zaczyna znikać przy klatce
192 i jest całkowicie niewidoczna od klatki 204, gdy kamera wchodzi
w soczewkę. Jej przezroczystość zależy od faktycznie wyświetlonej klatki,
więc działa również przy cofaniu scrolla i doczytywaniu obrazów.

Fonty Instrument Serif oraz Inter importowane są w `src/styles/fonts.css`;
animacje i przejścia sceny znajdują się w `src/styles/theme.css`.

## GitHub Pages

Kod: https://github.com/mastalex-websites/geoland-gizycko-hero

Strona: https://mastalex-websites.github.io/geoland-gizycko-hero/

Repozytorium jest publiczne. Workflow `.github/workflows/deploy-pages.yml`
buduje i publikuje stronę po pushu na `main`. GitHub Pages korzysta
z GitHub Actions. Nazwa repozytorium ustawia ścieżkę `VITE_BASE_PATH`,
uwzględnianą w adresach klatek i pozostałych zasobów.
Lokalnie aplikację uruchamia się przez `npm run dev` pod `/`.

## Sprawdzenie regresji przewijania

Po `npm run dev` otwórz `/tests/reduced-motion.html`. Ten lokalny test
uruchamia prawdziwą aplikację z jej stylami ograniczonego ruchu, bez zmiany
ustawień systemu. Klawisz End ma przewinąć stronę i pokazać ostatnią klatkę
(239), a Home ma wrócić do klatki 0. Fixture nie jest częścią buildu strony.
