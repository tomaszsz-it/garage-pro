
***# Kompleksowy Plan Testów dla Projektu "Garage Pro"

## 1. Cele testowania

Głównym celem testów jest zapewnienie wysokiej jakości, niezawodności i bezpieczeństwa aplikacji "Garage Pro". Cele szczegółowe obejmują:

*   **Weryfikacja funkcjonalna:** Upewnienie się, że wszystkie funkcje aplikacji, takie jak zarządzanie rezerwacjami, pojazdami i uwierzytelnianie, działają zgodnie ze specyfikacją.
*   **Zapewnienie integralności i bezpieczeństwa danych:** Potwierdzenie, że dane użytkowników są poprawnie walidowane, przechowywane i chronione przed nieautoryzowanym dostępem.
*   **Gwarancja stabilności i wydajności:** Identyfikacja i eliminacja potencjalnych problemów z wydajnością oraz zapewnienie, że aplikacja jest odporna na błędy.
*   **Potwierdzenie użyteczności (Usability):** Zapewnienie, że interfejs użytkownika jest intuicyjny, responsywny i spójny na różnych urządzeniach i przeglądarkach.
*   **Walidacja integracji:** Sprawdzenie, czy integracje z usługami zewnętrznymi (Supabase, OpenRouter) działają poprawnie i czy aplikacja jest odporna na ich ewentualne awarie.

## 2. Zakres testowania

### W zakresie (In-Scope):

*   **Moduł Uwierzytelniania:** Rejestracja, logowanie, wylogowywanie, resetowanie hasła, ochrona tras.
*   **Moduł Zarządzania Pojazdami:** Pełny cykl życia (CRUD) pojazdów użytkownika.
*   **Moduł Zarządzania Rezerwacjami:**
    *   Proces tworzenia nowej rezerwacji (wyszukiwanie dostępnych terminów).
    *   Wyświetlanie, filtrowanie, sortowanie i paginacja listy rezerwacji.
    *   Wyświetlanie szczegółów rezerwacji.
    *   Edycja i anulowanie istniejących rezerwacji.
*   **API Backendu:** Wszystkie endpointy w `src/pages/api` pod kątem logiki biznesowej, walidacji i autoryzacji.
*   **Interfejs Użytkownika:** Responsywność, spójność wizualna i interaktywność komponentów.
*   **Integracja z AI:** Wyświetlanie rekomendacji i obsługa przypadków, gdy rekomendacja nie jest dostępna.

### Poza zakresem (Out-of-Scope):

*   Testowanie infrastruktury i wewnętrznej implementacji usług zewnętrznych (Supabase, OpenRouter).
*   Testowanie wydajności bazowej bazy danych PostgreSQL (zakładamy, że Supabase zapewnia odpowiednią skalowalność).
*   Testowanie kodu źródłowego bibliotek firm trzecich (np. React, Astro, komponenty UI).
*   Testy penetracyjne wykraczające poza weryfikację logiki autoryzacji w aplikacji.

## 3. Strategie testowe dla konkretnych technologii

*   **Astro (`.astro`):**
    *   **Strategia:** Testy End-to-End (E2E).
    *   **Opis:** Symulacja interakcji użytkownika w przeglądarce w celu weryfikacji routingu, renderowania treści i działania komponentów "wyspowych" (client-side interactive).
*   **React (`.tsx`):**
    *   **Strategia:** Piramida testów: Testy jednostkowe i integracyjne.
    *   **Opis:**
        *   **Komponenty:** Testowanie przy użyciu React Testing Library, koncentrując się na zachowaniu z perspektywy użytkownika. Weryfikacja renderowania w zależności od `props`, obsługa zdarzeń i interakcji.
        *   **Hooki:** Testowanie logiki w izolacji za pomocą `@testing-library/react-hooks` (lub natywnie w RTL), mockowanie zapytań API w celu weryfikacji zarządzania stanem (ładowanie, błąd, sukces).
*   **API (Serverless Functions):**
    *   **Strategia:** Testy integracyjne API.
    *   **Opis:** Odpytywanie każdego endpointu za pomocą klienta HTTP w środowisku testowym połączonym z dedykowaną, testową bazą danych Supabase. Testy powinny obejmować weryfikację kodów statusu HTTP, struktury odpowiedzi JSON, walidacji danych wejściowych i logiki autoryzacji.
*   **Supabase (Baza Danych):**
    *   **Strategia:** Testowanie poprzez API oraz testy polityk bezpieczeństwa.
    *   **Opis:** Weryfikacja polityk RLS (Row Level Security) poprzez pisanie testów integracyjnych API, które próbują wykonywać operacje na danych nienależących do zalogowanego użytkownika i oczekują odpowiedzi o błędzie autoryzacji (np. 403 Forbidden).
*   **Zod (Walidacja):**
    *   **Strategia:** Testy jednostkowe.
    *   **Opis:** Dla każdej schemy walidacji należy stworzyć zestaw przypadków testowych sprawdzających poprawne i niepoprawne dane dla każdego pola, w tym przypadki brzegowe.

## 4. Rodzaje testów

| Rodzaj Testu | Cel | Zakres w Projekcie | Narzędzia |
| :--- | :--- | :--- | :--- |
| **Testy Jednostkowe** | Weryfikacja poprawności działania małych, izolowanych fragmentów kodu. | Funkcje pomocnicze, schemy walidacji Zod, proste komponenty UI, customowe hooki (z mockami). | Vitest/Jest |
| **Testy Integracyjne** | Sprawdzenie, czy różne części aplikacji poprawnie ze sobą współpracują. | Złożone komponenty (widoki) z hookami, formularze, endpointy API z logiką serwisów i bazą danych. | React Testing Library, Supertest, Vitest/Jest |
| **Testy End-to-End (E2E)** | Symulacja pełnych scenariuszy użytkownika w rzeczywistym środowisku. | Proces rejestracji i logowania, tworzenie rezerwacji, zarządzanie pojazdami. | Playwright, Cypress |
| **Testy Funkcjonalne** | Weryfikacja, czy aplikacja spełnia wymagania biznesowe (scenariusze z `TESTING_SCENARIOS.md`). | Realizowane głównie przez testy E2E i integracyjne. | Playwright, Cypress, RTL |
| **Testy Responsywności** | Zapewnienie poprawnego wyświetlania i działania aplikacji na różnych rozmiarach ekranu. | Sprawdzanie kluczowych widoków (lista rezerwacji/pojazdów, formularze) na viewportach mobilnych i desktopowych. | Playwright/Cypress (zmienne viewporty) |
| **Testy Bezpieczeństwa** | Weryfikacja mechanizmów uwierzytelniania i autoryzacji. | Ochrona tras, polityki RLS w Supabase, walidacja danych wejściowych. | Testy integracyjne API, manualne testy eksploracyjne. |
| **Testy Użyteczności** | Ocena intuicyjności i łatwości obsługi interfejsu. | Spójność nawigacji, czytelność komunikatów, obsługa stanów ładowania i błędów. | Testy manualne, zbieranie opinii od użytkowników. |

## 5. Priorytetowe obszary testowania

1.  **P1 (Krytyczne):**
    *   **Ścieżka uwierzytelniania:** Pełny cykl od rejestracji do wylogowania.
    *   **Ścieżka tworzenia rezerwacji:** Kluczowy proces biznesowy; musi działać bezbłędnie.
    *   **Walidacja i autoryzacja w API:** Zabezpieczenie przed niepoprawnymi danymi i nieautoryzowanym dostępem.

2.  **P2 (Wysokie):**
    *   **Zarządzanie rezerwacjami (CRUD):** Pełna obsługa rezerwacji po ich utworzeniu.
    *   **Zarządzanie pojazdami (CRUD):** Podstawa do działania modułu rezerwacji.
    *   **Filtrowanie i sortowanie list:** Kluczowa funkcjonalność dla użytkownika.

3.  **P3 (Średnie):**
    *   **Obsługa błędów i stanów ładowania:** Zapewnienie dobrego UX.
    *   **Responsywność interfejsu:** Dostępność na urządzeniach mobilnych.
    *   **Integracja z AI:** Funkcja dodatkowa, której ewentualna awaria nie blokuje głównych procesów.

## 6. Narzędzia testowe

*   **Framework do testów jednostkowych i integracyjnych:** **Vitest** (nowoczesna alternatywa dla Jesta, z natywnym wsparciem dla TypeScript i ESM).
*   **Biblioteka do testowania komponentów React:** **React Testing Library** (już używana w projekcie).
*   **Framework do testów E2E:** **Playwright** (ze względu na szybkość, niezawodność i doskonałe narzędzia deweloperskie, w tym możliwość testowania na różnych przeglądarkach).
*   **Narzędzie do testowania API:** **Supertest** lub natywny `fetch` wewnątrz Vitest do testowania endpointów API.
*   **Mockowanie API:** **Mock Service Worker (MSW)** do mockowania zapytań API w testach komponentów i E2E, co zapewnia spójność i niezależność od działającego backendu.
*   **CI/CD:** **GitHub Actions** do automatycznego uruchamiania testów (jednostkowych, integracyjnych i E2E) przy każdym pushu i pull requeście.

## 7. Kryteria akceptacji

*   **Pokrycie kodu (Code Coverage):**
    *   Testy jednostkowe i integracyjne: > 80% dla kluczowych modułów (logika biznesowa, hooki, walidacja).
    *   Pokrycie ogólne projektu: > 70%.
*   **Wyniki testów:** 100% testów automatycznych musi zakończyć się sukcesem w głównym branchu na CI.
*   **Błędy:** Brak otwartych błędów o priorytecie krytycznym (Blocker, Critical) przed wdrożeniem na produkcję.
*   **Scenariusze E2E:** Wszystkie zdefiniowane krytyczne ścieżki użytkownika muszą być pokryte testami E2E i przechodzić je pomyślnie.
*   **Przegląd kodu:** Każda zmiana w kodzie musi zostać zatwierdzona przez co najmniej jednego innego dewelopera.

## 8. Harmonogram i zasoby

Testowanie powinno być procesem ciągłym, zintegrowanym z cyklem rozwoju oprogramowania.

*   **Faza 1: Uzupełnienie testów jednostkowych i integracyjnych (Sprint 1-2)**
    *   **Zasoby:** 1-2 deweloperów.
    *   **Zadania:** Osiągnięcie założonego progu pokrycia kodu dla istniejących funkcjonalności, w szczególności dla hooków, serwisów i walidacji Zod. Stworzenie testów integracyjnych dla wszystkich endpointów API.
*   **Faza 2: Implementacja testów E2E (Sprint 2-3)**
    *   **Zasoby:** 1 deweloper z doświadczeniem w Playwright/Cypress.
    *   **Zadania:** Zautomatyzowanie krytycznych ścieżek użytkownika: rejestracja/logowanie, tworzenie rezerwacji, dodawanie pojazdu. Konfiguracja CI/CD do uruchamiania tych testów.
*   **Faza 3: Testy ciągłe i regresyjne (Ciągłe)**
    *   **Zasoby:** Cały zespół deweloperski.
    *   **Zadania:** Pisanie testów dla każdej nowej funkcjonalności i poprawki błędów. Regularne uruchamianie pełnego zestawu testów w celu wykrywania regresji. Okresowe przeprowadzanie manualnych testów eksploracyjnych.