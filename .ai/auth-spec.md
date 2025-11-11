# Specyfikacja Techniczna: Moduł Uwierzytelniania i Autoryzacji

## 1. Architektura Interfejsu Użytkownika (UI)

### 1.1. Stany Aplikacji (Auth vs. Non-Auth)

Interfejs użytkownika będzie dynamicznie dostosowywał się do stanu uwierzytelnienia.

-   **Użytkownik Niezalogowany (Non-Auth):**
    -   Widzi ogólnodostępne strony: strona główna (`/`), dostępne terminy (`/reservations/available`).
    -   W nawigacji (`Navigation.astro`) widoczne są przyciski "Zaloguj się" i "Zarejestruj się".
    -   Próba dostępu do stron chronionych (np. `/reservations`, `/vehicles`) powoduje automatyczne przekierowanie do `/login`.

-   **Użytkownik Zalogowany (Auth):**
    -   Ma dostęp do wszystkich stron, w tym chronionych: "Moje rezerwacje" (`/reservations`) i "Moje pojazdy" (`/vehicles`).
    -   W nawigacji zamiast przycisków logowania/rejestracji widoczny jest przycisk "Wyloguj się" oraz ewentualnie nazwa użytkownika.

### 1.2. Nowe Strony (Astro)

Zostaną utworzone następujące strony w katalogu `src/pages/`:

-   `auth/login.astro`: Strona logowania. Będzie zawierać komponent React `LoginForm`.
-   `auth/register.astro`: Strona rejestracji. Będzie zawierać komponent React `RegisterForm`.
-   `auth/forgot-password.astro`: Strona do inicjowania procesu odzyskiwania hasła. Będzie zawierać komponent `ForgotPasswordForm`.
-   `auth/reset-password.astro`: Strona, na którą użytkownik trafia z linku w mailu, aby ustawić nowe hasło. Będzie zawierać `ResetPasswordForm`.
-   `api/auth/[...slug].ts`: Endpointy API do obsługi logiki autentykacji (szczegóły w sekcji 2.2).

### 1.3. Nowe Komponenty (React)

W katalogu `src/components/auth/` zostaną utworzone komponenty klienckie do obsługi formularzy:

-   `LoginForm.tsx`: Formularz logowania z polami na e-mail i hasło. Będzie obsługiwał walidację po stronie klienta i wysyłał dane do `POST /api/auth/login`.
-   `RegisterForm.tsx`: Formularz rejestracji z polami na e-mail, hasło i powtórzenie hasła.
-   `ForgotPasswordForm.tsx`: Formularz z polem na e-mail do wysłania linku resetującego hasło.
-   `ResetPasswordForm.tsx`: Formularz do wprowadzenia i potwierdzenia nowego hasła.
-   `AuthNav.tsx`: Komponent kliencki umieszczony w nawigacji, który będzie renderował przyciski "Zaloguj/Zarejestruj" lub "Wyloguj" na podstawie stanu sesji odczytanego po stronie klienta (w celu uniknięcia "mignięcia" interfejsu).

### 1.4. Modyfikacje Istniejących Komponentów

-   `src/components/shared/Navigation.astro`:
    -   Główne linki nawigacyjne ("Rezerwacje", "Pojazdy") będą renderowane warunkowo, na podstawie sesji użytkownika przekazanej z `Astro.locals`.
    -   Zamiast statycznych przycisków, zostanie wstawiony komponent `<AuthNav client:load />` do obsługi dynamicznych akcji.
-   `src/components/Welcome.astro`:
    -   Zostanie usunięta zduplikowana logika nawigacji. Komponent będzie pełnił wyłącznie funkcję informacyjną/powitalną na stronie głównej. Nawigacja będzie zapewniana przez `Layout.astro`.
-   `src/layouts/Layout.astro`:
    -   Będzie odpytywał o sesję użytkownika z `Astro.locals.user` i przekazywał ją jako `prop` do `Navigation.astro`, aby umożliwić renderowanie odpowiednich linków po stronie serwera.

### 1.5. Walidacja Formularzy i Obsługa Błędów

-   **Walidacja Inline**: Formularze React będą używać biblioteki `zod` (w połączeniu np. z `react-hook-form`) do walidacji danych w czasie rzeczywistym (np. format e-maila, minimalna długość hasła).
-   **Komunikaty Błędów**:
    -   Błędy walidacji będą wyświetlane bezpośrednio pod polami formularza.
    -   Błędy zwracane z API (np. "Użytkownik o tym e-mailu już istnieje", "Nieprawidłowe hasło") będą wyświetlane w formie globalnego komunikatu (`Sonner`) nad formularzem.

### 1.6. Inicjalizacja Stanu Uwierzytelnienia po Stronie Klienta

Aby zapewnić spójny stan uwierzytelnienia po stronie klienta i uniknąć "mignięcia" interfejsu (FOUC), zostanie wdrożony następujący mechanizm:

1.  **Przekazanie Danych z Serwera**: Główny layout aplikacji (`src/layouts/Layout.astro`) odczyta dane użytkownika z `Astro.locals.user`.
2.  **Komponent Dostawcy (Provider)**: Dane te (`user` lub `null`) zostaną przekazane jako `prop` do głównego komponentu React, który będzie opakowywał całą zawartość strony, np. `<AppProvider user={user}><slot /></AppProvider>`.
3.  **Kliencki Store (Zustand/Context)**: Wewnątrz `AppProvider.tsx`, przekazany obiekt użytkownika posłuży do zainicjowania klienckiego "store'a" (przy użyciu np. React Context lub Zustand).
4.  **Dostęp w Komponentach**: Wszystkie inne komponenty klienckie (np. `AuthNav.tsx`) będą mogły odczytać stan zalogowania bezpośrednio z tego store'a, zapewniając natychmiastową i spójną reakcję interfejsu na stan sesji.

## 2. Logika Backendowa

### 2.1. Middleware (`src/middleware/index.ts`)

Middleware będzie kluczowym elementem systemu:

1.  Na każde żądanie, utworzy serwerowy klient Supabase.
2.  Sprawdzi, czy w ciasteczkach (`Astro.cookies`) znajduje się ważna sesja Supabase.
3.  Jeśli sesja istnieje, dane użytkownika zostaną pobrane i umieszczone w `Astro.locals.user`, dzięki czemu będą dostępne w każdej stronie i endpoincie API.
4.  Jeśli sesja nie istnieje, `Astro.locals.user` będzie `null`.
5.  Dla chronionych tras (np. `/reservations`), middleware sprawdzi `Astro.locals.user`. Jeśli jest `null`, nastąpi przekierowanie (`Astro.redirect`) na stronę `/auth/login`.

### 2.2. Architektura API Endpoints

Endpointy zostaną zaimplementowane jako Astro API Routes w pliku `src/pages/api/auth/[...slug].ts`.

-   `POST /api/auth/login`:
    -   Przyjmuje: `email`, `password`.
    -   Wywołuje `supabase.auth.signInWithPassword()`.
    -   Supabase automatycznie zarządza ciasteczkami sesji w odpowiedzi.
    -   Zwraca: `200 OK` lub błąd `401 Unauthorized`.

-   `POST /api/auth/register`:
    -   Przyjmuje: `email`, `password`.
    -   Wywołuje `supabase.auth.signUp()`. Supabase wyśle e-mail z linkiem weryfikacyjnym.
    -   Zwraca: `201 Created` lub błąd `400 Bad Request` (np. gdy użytkownik istnieje).

-   `POST /api/auth/logout`:
    -   Nie przyjmuje body.
    -   Wywołuje `supabase.auth.signOut()`.
    -   Czyści ciasteczka sesji.
    -   Zwraca: `200 OK`.

-   `POST /api/auth/forgot-password`:
    -   Przyjmuje: `email`.
    -   Wywołuje `supabase.auth.resetPasswordForEmail()`.
    -   Zwraca: `200 OK` (nawet jeśli e-mail nie istnieje, ze względów bezpieczeństwa).

-   `GET /api/auth/callback`:
    -   Endpoint wymagany przez Supabase do sfinalizowania autentykacji po kliknięciu linku weryfikacyjnego lub przy logowaniu przez dostawców OAuth (nawet jeśli nie są używani, jego obecność jest dobrą praktyką). brak definicji roli sekretariatu blokuje pełną autoryzację więc endpoint /api/auth/callback bez OAuth bedzie nieużyty.

### 2.3. Walidacja Danych (Zod)

Każdy endpoint API będzie walidował przychodzące dane za pomocą schematów `zod`, zapewniając, że przetwarzane są tylko poprawne i bezpieczne dane.

### 2.4. Obsługa Błędów i Wyjątków

Backend będzie zwracał spójne i przewidywalne odpowiedzi, zwłaszcza w przypadku błędów.

-   **Struktura Odpowiedzi**:
    -   Sukces: `{ success: true, data: { ... } }`
    -   Błąd: `{ success: false, error: { message: 'Czytelny komunikat błędu' } }`
-   **Kody Statusu HTTP**:
    -   `200 OK` / `201 Created`: Operacja zakończona sukcesem.
    -   `400 Bad Request`: Błąd walidacji danych wejściowych (np. niepoprawny e-mail). Odpowiedź będzie zawierać szczegóły błędu.
    -   `401 Unauthorized`: Nieprawidłowe dane logowania.
    -   `403 Forbidden`: Użytkownik nie ma uprawnień do wykonania akcji.
    -   `409 Conflict`: Próba utworzenia zasobu, który już istnieje (np. rejestracja na zajęty e-mail).
    -   `500 Internal Server Error`: Niespodziewany błąd serwera. W środowisku produkcyjnym szczegóły błędu nie będą ujawniane klientowi, ale zostaną zarejestrowane (logged).
-   **Implementacja**: Logika każdego endpointu zostanie opakowana w blok `try...catch`, aby przechwytywać wyjątki z Supabase lub innych operacji i zwracać odpowiednio sformatowaną odpowiedź błędu.

## 3. System Autentykacji (Supabase Auth)

### 3.1. Konfiguracja Klienta Supabase

-   Zostanie utworzony serwerowy klient Supabase (`src/db/supabase.server.ts`), który będzie inicjowany w middleware z użyciem ciasteczek z każdego żądania. To pozwoli na bezpieczne operacje w kontekście zalogowanego użytkownika.
-   Istniejący klient (`src/db/supabase.client.ts`) będzie używany po stronie klienckiej, głównie do operacji niewymagających autentykacji lub po jej zakończeniu.

### 3.2. Autoryzacja i Row-Level Security (RLS)

-   Do tabel `vehicles` i `reservations` zostanie dodana kolumna `user_id` (typu `uuid`), która będzie kluczem obcym do tabeli `auth.users`.
-   W Supabase zostaną aktywowane i skonfigurowane polityki RLS:
    -   **Polityka dla Klientów**: Użytkownik będzie mógł odczytywać, tworzyć, aktualizować i usuwać tylko te wiersze, w których `user_id` jest równe jego własnemu `auth.uid()`.
    -   **Polityka dla Sekretariatu**: W przyszłości można dodać tabelę `profiles` z rolami. Polityki RLS będą mogły sprawdzać rolę użytkownika i zezwalać na dostęp do wszystkich rezerwacji, jeśli rola to `secretary`.

### 3.3. Aktualizacja Renderowania Stron

-   W `astro.config.mjs` zostanie utrzymany `output: 'server'`, co jest niezbędne do dynamicznego renderowania stron w zależności od stanu uwierzytelnienia użytkownika i działania middleware.
