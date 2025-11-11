# Plan Testów dla Projektu Garage-Pro

## 1. Cele Testowania
- Zapewnienie, że wszystkie kluczowe funkcjonalności aplikacji działają zgodnie z wymaganiami.
- Odkrycie błędów na wczesnym etapie dzięki testom jednostkowym i integracyjnym.
- Sprawdzenie integralności systemu przy integracji z zewnętrznymi usługami (np. Supabase, Openrouter.ai).
- Weryfikacja bezpieczeństwa, wydajności i doświadczenia użytkownika w interfejsie.
- Zapewnienie ciągłości działania przy wprowadzeniu zmian w kodzie (regresji).
- Wykorzystanie nowoczesnych narzędzi testowych 2025 dla maksymalnej efektywności.

## 2. Zakres Testowania
- Testowanie komponentów frontendowych napisanych w Astro/React, w tym elementy dynamiczne i statyczne.
- Testy API i logiki backendowej (endpointy w `src/pages/api`) oraz integracji z bazą danych Supabase.
- Testy funkcjonalne kluczowych modułów takich jak: uwierzytelnianie, rezerwacje, zarządzanie pojazdami, oraz mechanizmy autoryzacji.
- Testy middleware oraz logiki obsługi błędów (w `src/lib/errors`).
- Testy wizualne komponentów opartych na Shadcn/ui i Tailwind.
- Testy wydajnościowe dla stron renderowanych przez Astro.
- Testy bezpieczeństwa, ze szczególnym naciskiem na polityki RLS w Supabase i uwierzytelnianie.

## 3. Strategie Testowe dla Konkretnych Technologii
- **Astro 5**: Testy renderowania stron i layoutów za pomocą `@astro/test`, sprawdzanie poprawności routingu i ładowania zasobów. Testy SSR vs CSR renderowania.
- **React 19**: Testy jednostkowe komponentów za pomocą React Testing Library z `@testing-library/user-event` v14+ dla nowoczesnej interakcji. Wykorzystanie nowych features React 19.
- **TypeScript 5**: Maksymalne wykorzystanie statycznego typowania do wczesnego wykrywania błędów, wsparte testami jednostkowymi w Vitest z native TypeScript support.
- **Tailwind 4 i Shadcn/ui**: Testy wizualne za pomocą Storybook + Chromatic dla visual regression testing, weryfikacja zgodności komponentów UI z wymaganiami designu.
- **Supabase**: Testy integracyjne z dedykowanym Supabase Test Client, mockowanie połączeń bazodanowych, testowanie polityk RLS i Edge Functions.

## 4. Rodzaje Testów
- **Testy jednostkowe**: Testowanie poszczególnych funkcji, komponentów i modułów za pomocą Vitest (np. obsługa logiki w `src/lib/services` i komponenty w `src/components/auth`).
- **Testy integracyjne**: Weryfikacja komunikacji między modułami z MSW do mockowania API, sprawdzanie poprawnego działania endpointów oraz integracji z Supabase.
- **Testy funkcjonalne**: Scenariusze użytkownika z React Testing Library i user-event, np. proces rejestracji, logowania, zarządzania rezerwacjami i pojazdami.
- **Testy end-to-end (E2E)**: Automatyzacja pełnych przepływów użytkownika za pomocą Playwright w celu symulacji rzeczywistych scenariuszy cross-browser.
- **Testy wizualne**: Automatyczne wykrywanie zmian UI za pomocą Chromatic, zapewnienie spójności designu komponentów Shadcn/ui.
- **Testy wydajnościowe**: Benchmarki dla stron Astro (SSR/SSG), ocena Web Vitals, analiza bundle size i optymalizacja ładowania.
- **Testy bezpieczeństwa**: Audyty zabezpieczeń RLS w Supabase, testowanie polityk autoryzacji i edge functions, skanowanie dependencies.

## 5. Priorytetowe Obszary Testowania
- **Uwierzytelnianie i autoryzacja**: Komponenty w `src/components/auth` oraz endpointy API związane z użytkownikami.
- **Moduł rezerwacji**: Testowanie komponentów rezerwacji, procesów tworzenia i edycji rezerwacji, a także integracji z backendem.
- **Integracja z Supabase**: Weryfikacja komunikacji, poprawności konfiguracji bazy danych i polityk bezpieczeństwa.
- **UI i interaktywność**: Testy wizualne i interakcyjne dla komponentów opartych na Shadcn/ui oraz Tailwind.
- **Middleware i obsługa błędów**: Sprawdzenie poprawności logiki middleware i systemu raportowania błędów, aby zapewnić stabilność aplikacji.

## 6. Narzędzia Testowe (Stack 2025)

### 🚀 Główne Framework Testowy
- **Vitest**: Nowoczesny framework testowy z native TypeScript/ESM support, szybszy od Jest
  - Konfiguracja: `vitest.config.ts` z integracją Astro
  - Hot reload podczas testowania
  - Built-in coverage z c8

### 🧪 Testy Komponentów
- **React Testing Library**: Testowanie komponentów React 19 z focus na user experience
- **@testing-library/user-event v14+**: Nowoczesne symulacje interakcji użytkownika
- **@astro/test**: Dedykowane narzędzia do testowania komponentów Astro

### 🌐 Testy End-to-End
- **Playwright**: Cross-browser testing (Chrome, Firefox, Safari, Edge)
  - Szybszy i bardziej stabilny niż Cypress
  - Built-in screenshots i video recording
  - Mobile testing support

### 🎨 Testy Wizualne
- **Storybook**: Dokumentacja i izolowane testowanie komponentów
- **Chromatic**: Automatyczne visual regression testing
  - CI/CD integration
  - Pixel-perfect comparisons

### 🔗 Mockowanie API
- **MSW (Mock Service Worker)**: Mockowanie API na poziomie network
  - Realistyczne testowanie bez prawdziwego API
  - Współdzielone mocks między testami i developmentem

### 🗄️ Testy Bazy Danych
- **Supabase Test Client**: Dedykowane narzędzia do testowania integracji
- **PostgreSQL Test Containers**: Izolowane środowiska testowe
- **Supabase CLI**: Lokalne środowisko z migracji

### ⚡ Testy Wydajnościowe
- **Lighthouse CI**: Automatyczne audyty wydajności w pipeline
- **Web Vitals**: Monitoring Core Web Vitals
- **Bundle Analyzer**: Analiza rozmiaru bundli Astro

### 🔒 Testy Bezpieczeństwa
- **npm audit**: Skanowanie dependencies
- **Supabase RLS Tester**: Weryfikacja Row Level Security
- **OWASP ZAP**: Automatyczne skanowanie bezpieczeństwa

## 7. Kryteria Akceptacji

### 📊 Pokrycie Testów
- **Kod coverage**: minimum 80% dla krytycznych modułów
- **Komponenty UI**: 100% pokrycie komponentów Shadcn/ui
- **API endpoints**: 95% pokrycie wszystkich endpointów

### 🚀 Wydajność
- **Core Web Vitals**: 
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- **Bundle size**: maksymalnie 250KB (gzipped)
- **API response time**: < 500ms dla 95% requestów

### 🔒 Bezpieczeństwo
- **Zero krytycznych** luk bezpieczeństwa w dependencies
- **100% pokrycie** polityk RLS w Supabase
- **Wszystkie endpointy** zabezpieczone autoryzacją

### 🎨 Jakość UI
- **Zero regresji wizualnych** w Chromatic
- **Accessibility score** > 95% w Lighthouse
- **Cross-browser compatibility** w Chrome, Firefox, Safari, Edge

### 📈 Automatyzacja
- **CI/CD pipeline** z automatycznymi testami
- **Pre-commit hooks** z linting i formatowaniem
- **Automated deployment** tylko po przejściu wszystkich testów

## 8. Harmonogram Wdrożenia (2025)

### 🚀 Sprint 1: Setup i Podstawowe Testy (1 tydzień)
- **Dzień 1-2**: Konfiguracja Vitest + @astro/test
- **Dzień 3-4**: Setup React Testing Library + user-event
- **Dzień 5-7**: Pierwsze testy jednostkowe dla utils i services

### 🔧 Sprint 2: Testy Komponentów (2 tygodnie)
- **Tydzień 1**: Testy komponentów UI (Shadcn/ui)
- **Tydzień 2**: Testy komponentów biznesowych (auth, reservations)
- **MSW setup**: Mockowanie API endpoints

### 🌐 Sprint 3: Testy E2E i Wizualne (2 tygodnie)
- **Tydzień 1**: Playwright setup i podstawowe flow
- **Tydzień 2**: Storybook + Chromatic dla visual testing
- **CI/CD integration**: Automatyzacja w GitHub Actions

### 🔒 Sprint 4: Bezpieczeństwo i Wydajność (1 tydzień)
- **Dzień 1-3**: Testy RLS w Supabase
- **Dzień 4-5**: Lighthouse CI setup
- **Dzień 6-7**: Security scanning i audit

### 📊 Sprint 5: Optimalizacja i Dokumentacja (1 tydzień)
- **Code coverage optimization**
- **Performance benchmarking**
- **Team training i dokumentacja**

## 9. Konfiguracje i Setup

### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import { getViteConfig } from 'astro/config'

export default defineConfig(
  getViteConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test-setup.ts'],
      coverage: {
        provider: 'c8',
        reporter: ['text', 'json', 'html'],
        threshold: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
          }
        }
      }
    }
  })
)
```

### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' }
  ]
})
```

## 10. Najlepsze Praktyki

### 🧪 Unit Testing
- **Arrange-Act-Assert** pattern
- **Descriptive test names** opisujące behavior
- **Single responsibility** - jeden test = jedna funkcjonalność
- **Mock external dependencies** z MSW

### 🎭 Component Testing  
- **Test behavior, not implementation**
- **User-centric approach** z user-event
- **Accessibility testing** z @testing-library/jest-dom
- **Snapshot testing** tylko dla stabilnych UI

### 🌐 E2E Testing
- **Page Object Model** pattern
- **Data-testid attributes** zamiast CSS selectors
- **Independent test scenarios**
- **Cleanup after each test**

### 📊 Performance Testing
- **Budget-based testing** dla bundle size
- **Real User Metrics** monitoring
- **Progressive enhancement** testing
- **Mobile-first performance** optimization

## 11. Zasoby i Zespół

### 👥 Role i Odpowiedzialności
- **Lead Developer**: Architektura testów, code review, mentoring
- **Frontend Developer**: Unit testy komponentów, visual testing
- **Backend Developer**: API testing, integracje z Supabase
- **DevOps Engineer**: CI/CD pipeline, deployment automation
- **QA Engineer**: E2E scenarios, manual exploratory testing

### 🛠️ Wymagane Narzędzia
- **Node.js 18+** z npm/yarn
- **TypeScript 5+** dla type safety
- **Git hooks** (husky + lint-staged)
- **VS Code extensions**: Vitest, Playwright Test for VSCode
- **Browser extensions**: React DevTools, Lighthouse

### 📚 Szkolenia i Dokumentacja
- **Onboarding guide** dla nowych członków zespołu
- **Testing best practices** workshop
- **Code review checklist** dla testów
- **Performance budget** guidelines
- **Security testing** procedures