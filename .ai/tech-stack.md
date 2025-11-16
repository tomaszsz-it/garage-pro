Frontend - Astro z React dla komponentów interaktywnych:
- Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
- React 19 zapewni interaktywność tam, gdzie jest potrzebna
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI

Backend - Supabase jako kompleksowe rozwiązanie backendowe:
- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników

AI - Komunikacja z modelami przez usługę Openrouter.ai:
- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

Testowanie - Kompleksowe pokrycie testowe z nowoczesnymi narzędziami:
- Vitest jako główny framework testowy z natywnym wsparciem TypeScript i ESM
- React Testing Library do testowania komponentów React 19 z naciskiem na user experience
- @testing-library/user-event v14+ do nowoczesnych symulacji interakcji użytkownika
- @astro/test do dedykowanych testów komponentów Astro
- Playwright do cross-browser testów end-to-end (Chrome, Firefox, Safari, Edge)
- MSW (Mock Service Worker) do mockowania API na poziomie network
- Storybook + Chromatic do testów wizualnych i dokumentacji komponentów
- Supabase Test Client do testowania integracji z bazą danych
- Lighthouse CI do automatycznych audytów wydajności w pipeline

CI/CD i Hosting:
- Github Actions do tworzenia pipeline'ów CI/CD
- Cloudflare Pages jako hosting aplikacji Astro
- DigitalOcean do hostowania aplikacji za pośrednictwem obrazu docker