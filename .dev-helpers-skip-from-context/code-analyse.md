<analiza>
### **1. Analiza Struktury i Kodu Źródłowego**

#### **1.1. Przegląd Ogólny**
Projekt jest aplikacją internetową do zarządzania warsztatem samochodowym o nazwie "Garage Pro". Zbudowany jest w oparciu o nowoczesny stos technologiczny, z wyraźnym podziałem na frontend, backend (API) i logikę biznesową. Użycie TypeScriptu w całym projekcie zapewnia bezpieczeństwo typów i ułatwia analizę.

#### **1.2. Frontend (`src/components`, `src/pages`, `src/layouts`)**
*   **Framework:** Astro (`.astro`) jest używany do budowy stron (pages) i layoutów. Odpowiada za routing oparty na plikach i renderowanie po stronie serwera (SSR), co ma implikacje dla testów E2E i wydajności.
*   **Komponenty UI:** Interaktywne części interfejsu są zbudowane w React (`.tsx`). Struktura jest modularna i podzielona na główne domeny: `auth` (uwierzytelnianie), `reservations` (rezerwacje), `vehicles` (pojazdy) oraz `shared` (współdzielone) i `ui` (podstawowe komponenty, prawdopodobnie z biblioteki typu shadcn/ui).
*   **Zarządzanie Stanem:** Stan jest zarządzany lokalnie w komponentach oraz za pomocą customowych hooków Reacta (`src/components/.../hooks`). Przykłady to `useReservations`, `useVehicleForm`, `useAvailableReservations`. Te hooki hermetyzują logikę pobierania danych, filtrowania, sortowania i interakcji z API, co czyni je kluczowymi elementami do testowania.
*   **Routing:** Routing jest obsługiwany przez Astro na podstawie struktury katalogów w `src/pages`. Widoczne są zarówno strony statyczne (`index.astro`), jak i dynamiczne (`reservations/[id].astro`).

#### **1.3. Backend (API - `src/pages/api`)**
*   **Architektura:** API jest zaimplementowane jako zestaw endpointów (serverless functions) w katalogu `src/pages/api`. To podejście jest typowe dla frameworków takich jak Astro czy Next.js.
*   **Uwierzytelnianie:** Endpointy w `src/pages/api/auth` obsługują logikę rejestracji, logowania, wylogowywania i resetowania hasła. Middleware (`src/middleware/index.ts`) prawdopodobnie przechwytuje żądania, aby zweryfikować sesję użytkownika przy użyciu Supabase.
*   **Endpointy CRUD:** Widoczne są endpointy do zarządzania rezerwacjami (`reservations.ts`, `reservations/[id].ts`) i pojazdami (`vehicles.ts`, `vehicles/[license_plate].ts`). Obsługują one operacje tworzenia, odczytu, aktualizacji i usuwania danych.
*   **Logika Biznesowa:** Endpoint `reservations/available.ts` zawiera kluczową logikę biznesową do wyszukiwania dostępnych terminów, co czyni go krytycznym elementem do testowania.

#### **1.4. Logika Biznesowa i Dostęp do Danych (`src/lib`, `src/db`)**
*   **Baza Danych:** Projekt korzysta z Supabase, co jest widoczne w plikach `supabase.client.ts` i `database.types.ts`. Supabase pełni rolę bazy danych PostgreSQL oraz backendu do uwierzytelniania.
*   **Walidacja:** Schemy walidacji Zod znajdują się w `src/lib/validation`. Definiują one kształt danych dla DTO (Data Transfer Objects), co jest doskonałą praktyką zapewniającą integralność danych na poziomie API. Te schemy muszą być dokładnie przetestowane jednostkowo.
*   **Serwisy:** Logika komunikacji z zewnętrznymi API (np. `openrouter.service.ts` - do generowania rekomendacji AI) oraz bardziej złożone operacje na danych (np. `reservationAvailabilityService.ts`) są wydzielone do osobnych serwisów. To ułatwia ich izolację i testowanie.
*   **Typy Danych (`types.ts`, `db/database.types.ts`):** Centralne definicje typów i DTO zapewniają spójność w całej aplikacji.

#### **1.5. Testy Istniejące**
*   **Testy jednostkowe/integracyjne:** Projekt zawiera już pewne testy, głównie dla komponentów React (`ReservationsFilterPanel.test.tsx`, `ReservationsList.test.tsx`) i hooków (`useReservations.test.ts`). Używana jest biblioteka React Testing Library.
*   **Testy API:** Istnieje test dla endpointu `reservations-available.test.ts`, co jest dobrym wzorcem do naśladowania dla pozostałych endpointów.
*   **Dokumentacja Testowa:** Plik `TESTING_SCENARIOS.md` w module `vehicles` jest doskonałym przykładem ręcznego planowania testów i może służyć jako podstawa do automatyzacji scenariuszy E2E.

### **2. Analiza Stosu Technologicznego i Strategie Testowe**

*   **Astro:** Testowanie stron Astro powinno koncentrować się na poprawnym renderowaniu i routingu. Testy End-to-End (E2E) z użyciem narzędzi takich jak Playwright lub Cypress są tutaj najskuteczniejsze. Pozwolą one zweryfikować, czy strony renderują się poprawnie z odpowiednimi danymi i czy nawigacja działa zgodnie z oczekiwaniami.
*   **React + TypeScript:** Należy kontynuować i rozszerzać istniejące testy jednostkowe i integracyjne przy użyciu **Jest/Vitest** oraz **React Testing Library**. Kluczowe jest testowanie komponentów w izolacji, symulowanie interakcji użytkownika (kliknięcia, wpisywanie tekstu) i weryfikowanie renderowanego wyniku. Customowe hooki (`useReservations`, `useVehicleForm`) powinny być testowane za pomocą `@testing-library/react-hooks` (lub natywnie w RTL), aby zweryfikować ich logikę niezależnie od UI.
*   **Supabase (Backend):**
    *   **API Endpoints:** Każdy endpoint w `src/pages/api` wymaga testów integracyjnych. Można do tego użyć frameworka takiego jak **Supertest** lub natywnego `fetch` w środowisku testowym (np. Vitest). Konieczne będzie uruchomienie testów w środowisku z dostępem do *testowej bazy danych Supabase*, aby uniknąć zanieczyszczenia danych produkcyjnych. Należy testować ścieżki "szczęśliwe", przypadki brzegowe i obsługę błędów (np. nieprawidłowe dane wejściowe, brak autoryzacji).
    *   **Row Level Security (RLS):** Kluczowe jest przetestowanie polityk bezpieczeństwa Supabase. Testy integracyjne API powinny obejmować scenariusze, w których użytkownik próbuje uzyskać dostęp lub zmodyfikować dane nienależące do niego.
*   **OpenRouter (Integracja AI):** Integracje z zewnętrznymi API są źródłem ryzyka (zmienność, koszty, błędy sieci). Strategia testowa powinna obejmować:
    *   **Testy jednostkowe serwisu `openrouter.service.ts`** z zamockowanym klientem HTTP, aby sprawdzić logikę obsługi odpowiedzi i błędów.
    *   **Testy komponentu `RecommendationDisplay.tsx`**, któremu przekazuje się różne zamockowane dane (długa rekomendacja, brak rekomendacji, tekst z błędami formatowania).
    *   Niewielką liczbę testów "canary" (dymnych) uruchamianych okresowo na środowisku deweloperskim, które faktycznie odpytują API OpenRouter, aby wykryć zmiany w jego działaniu.
*   **Zod:** Schemy walidacji są idealne do testów jednostkowych. Należy stworzyć zestaw testów dla każdej schemy, sprawdzając zarówno poprawne, jak i niepoprawne dane wejściowe dla każdego pola.

### **3. Identyfikacja Obszarów Ryzyka**

*   **Uwierzytelnianie i autoryzacja:** Błędy w tym module mogą prowadzić do poważnych luk w bezpieczeństwie (np. dostęp do danych innego użytkownika). Middleware i polityki RLS w Supabase są krytyczne.
*   **Logika biznesowa rezerwacji:** Proces tworzenia rezerwacji (`/reservations/available`) jest złożony i obejmuje wiele kroków (wybór usługi, znalezienie terminu, wybór pojazdu, potwierdzenie). Błąd na którymkolwiek etapie uniemożliwia użytkownikowi wykonanie kluczowej akcji w aplikacji.
*   **Integralność danych:** Zapewnienie, że tylko poprawne dane są zapisywane do bazy danych. Ryzyko leży w walidacji (Zod) po stronie serwera i obsłudze przypadków brzegowych.
*   **Zależności zewnętrzne (Supabase, OpenRouter):** Aplikacja jest zależna od dostępności i spójności działania zewnętrznych usług. Należy zapewnić odporność aplikacji na ich awarie (np. poprzez odpowiednią obsługę błędów, mechanizmy ponawiania).
*   **Zarządzanie stanem po stronie klienta:** Złożone interakcje w UI (filtrowanie, sortowanie, paginacja) mogą prowadzić do niespójności stanu, jeśli nie są odpowiednio zarządzane i testowane. Hook `useReservations` jest tutaj kluczowy.

### **4. Poziomy Testowania**

*   **Testy Jednostkowe:**
    *   **Cel:** Weryfikacja małych, izolowanych fragmentów kodu.
    *   **Zakres:** Funkcje pomocnicze (`lib/utils.ts`), schemy walidacji Zod (`lib/validation`), proste komponenty UI, customowe hooki (z zamockowanymi zależnościami).
*   **Testy Integracyjne:**
    *   **Cel:** Weryfikacja współpracy kilku modułów.
    *   **Zakres:** Komponenty-widoki (`ReservationsView`, `VehiclesView`) wraz z ich hookami; testowanie pełnych formularzy; testowanie endpointów API w połączeniu z logiką serwisów i (testową) bazą danych.
*   **Testy End-to-End (E2E):**
    *   **Cel:** Symulacja pełnych scenariuszy użytkownika w przeglądarce.
    *   **Zakres:** Pełny proces rejestracji i logowania; kompletny przepływ tworzenia rezerwacji; zarządzanie pojazdami (dodanie, edycja, usunięcie i sprawdzenie efektu na liście).
*   **Testy Statyczne i Lintery:**
    *   **Cel:** Wykrywanie problemów bez uruchamiania kodu.
    *   **Zakres:** Użycie TypeScript, ESLint i Prettier do zapewnienia spójności i jakości kodu w całym projekcie.

### **5. Priorytety Testowania**

1.  **Krytyczne (Najwyższy Priorytet):**
    *   **Moduł uwierzytelniania:** Rejestracja, logowanie, ochrona tras po stronie klienta i serwera.
    *   **Główny przepływ biznesowy:** Pełny proces tworzenia nowej rezerwacji (od wyboru usługi do potwierdzenia).
    *   **API CRUD dla rezerwacji i pojazdów:** Zapewnienie poprawnego działania podstawowych operacji na danych oraz walidacji i autoryzacji.
2.  **Wysoki Priorytet:**
    *   **Zarządzanie rezerwacjami:** Wyświetlanie listy rezerwacji, filtrowanie, sortowanie, paginacja, edycja i anulowanie.
    *   **Zarządzanie pojazdami:** Pełny cykl życia pojazdu (CRUD).
    *   **Walidacja (Zod):** Pełne pokrycie testami jednostkowymi wszystkich schem.
3.  **Średni Priorytet:**
    *   **Integracja z AI (OpenRouter):** Testowanie UI i obsługi różnych odpowiedzi (w tym błędów) z zamockowanego serwisu.
    *   **Responsywność interfejsu:** Weryfikacja (głównie przez testy E2E na różnych viewportach), czy aplikacja jest używalna na urządzeniach mobilnych i desktopowych.
    *   **Obsługa błędów i stany ładowania:** Zapewnienie, że użytkownik otrzymuje czytelne komunikaty o błędach i widzi wskaźniki ładowania.
4.  **Niski Priorytet:**
    *   **Komponenty UI (`src/components/ui`):** Podstawowe testy "dymne" sprawdzające, czy komponenty renderują się bez błędów.
    *   **Strony statyczne (`Welcome.astro`):** Weryfikacja w ramach testów E2E.

</analiza>