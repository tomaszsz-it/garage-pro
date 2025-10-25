# Architektura UI dla Garage Pro

## 1. Przegląd struktury UI

Aplikacja opiera się na pojedynczym layoutcie z publicznym ekranem logowania oraz chronionymi trasami dostępnymi po uwierzytelnieniu. Główne widoki to lista rezerwacji, wyszukiwanie dostępnych terminów oraz panel zarządzania autami. Globalnie dostępne komponenty to header z nawigacją, toast’y, inline alerty oraz ogólny ErrorBoundary z bannerem sieciowym.

## 2. Lista widoków

- **Ekran logowania**
  - Ścieżka: `/login` i register
  - Cel: umożliwić bezpieczne uwierzytelnienie użytkownika oraz rejestrację.
  - Informacje kluczowe: Formularze z polami emaili i hasło, komunikaty o blędach uwierzytelniania
  - Komponenty: Formularz logowania/rejestracji, komponent walidacji, przyciski, komunikaty blędów
  - UX/Accessibility/Security: Prosty formularz, czytelne komunikaty blędów, obsluga klawiatury, zabezpieczenia JWT

- **Lista rezerwacji**
  - Ścieżka: `/reservations`
  - Cel: przegląd i zarządzanie własnymi rezerwacjami.
  - Informacje kluczowe: id, data/godzina, auto, usługa, status.
  - Komponenty: `Table` (desktop), `Card` (mobile), `FilterBar` (dropdown auta), `Pagination`, `Button` („Anuluj”, „Szukaj dostępnych”, „Dodaj auto”), `Toast`, `InlineAlert`, `SkeletonLoader`.
  - UX/Accessibility/Security: responsywność (`md:hidden`), aria-sortable, potwierdzenie anulowania.

- **Wyszukiwanie dostępnych terminów**
  - Ścieżka: `/reservations/available`
  - Cel: wyświetlić dostępne sloty dla wybranej usługi i pojazdu.
  - Informacje kluczowe: panel filtrów (dropdown usług z hardkodowanymi opcjami: Wymiana oleju, Przegląd hamulców, Wymiana opon; wybór daty i godziny), lista slotów (start_ts, end_ts) – employee_id ukryty, mechanik wybierany automatycznie.
  - Komponenty: `FilterBar`, `DatePicker` (Shadcn/UI), `Table`/`Card`, `Button` („Rezerwuj”), `InlineAlert`, `SkeletonLoader`.
  - UX/Accessibility/Security: ograniczenia dat, aria-live dla ładowania, blokada przycisków.

- **Formularz tworzenia/edycji rezerwacji** *(modal lub strona)*
  - Ścieżka: `/reservations/new` lub `/reservations/:id/edit`
  - Cel: utworzenie lub modyfikacja rezerwacji.
  - Informacje kluczowe: wybór usługi, pojazdu, daty, godziny.
  - Komponenty: `Form`, `Select`, `DatePicker`, `TimePicker`, `Button` („Zapisz”), `InlineAlert`.
  - UX/Accessibility/Security: walidacja inline, aria-invalid, focus trap w dialogu.

- **Szczegóły rezerwacji**
  - Ścieżka: `/reservations/:id`
  - Cel: przegląd szczegółów i akcje „Edytuj”, „Anuluj”.
  - Informacje kluczowe: wszystkie dane rezerwacji, rekomendacja AI.
  - Komponenty: `Card`, `Button`, `Dialog` potwierdzenia, `Toast`.
  - UX/Accessibility/Security: aria-labelledby, zabezpieczenia akcji.

- **Panel aut**
  - Ścieżka: `/vehicles`
  - Cel: zarządzanie pojazdami użytkownika.
  - Informacje kluczowe: listy aut (license_plate, brand, model), przyciski „Dodaj”, „Edytuj”, „Usuń”.
  - Komponenty: `Table`/`Card`, `Dialog` formularza, `Button`, `InlineAlert`, `SkeletonLoader`.
  - UX/Accessibility/Security: potwierdzenie usunięcia, walidacja inline.

- **Formularz dodawania/edycji auta** *(dialog)*
  - Ścieżka: `/vehicles/new` lub `/vehicles/:license_plate/edit`
  - Cel: wprowadzenie danych pojazdu.
  - Informacje kluczowe: license_plate, vin, marka, model, rok.
  - Komponenty: `Form`, `Input`, `Button`, `InlineAlert`.
  - UX/Accessibility/Security: aria-required, unikanie bloczków nested.

## 3. Mapa podróży użytkownika

1. Użytkownik wchodzi na `/login` → uwierzytelnienie → przekierowanie na `/reservations`.
2. Na liście rezerwacji może filtrować po pojeździe, anulować rezerwację lub przejść do wyszukiwania dostępnych terminów.
3. Przejście do `/reservations/available`, wybór filtrów, slotu → przycisk „Rezerwuj” → powrót do `/reservations` z odświeżoną listą.
4. Opcja „Dodaj auto” otwiera dialog → po zapisaniu odświeżenie `/vehicles` oraz dostępności w liście rezerwacji.
5. Kliknięcie rezerwacji przenosi do `/reservations/:id` z możliwością edycji lub anulowania.

## 4. Układ i struktura nawigacji

- **Glówna naiwgacja** Dostepna jako górne menu w layoucie strony po zalogowaniu
- **Elementy nawigacyjne** Linki do widoków: „Rezerwacje” (`/reservations`), „Moje auta” (`/vehicles`), przycisk „Wyloguj”.
- **Chronione trasy**: ochrona tras przy pomocy Context i przekierowanie do `/login` przy braku tokenu.
- **Breadcrumbs** lub tytuły stron dla orientacji użytkownika.

## 5. Kluczowe komponenty

- **Header**: nawigacja i wylogowanie.
- **Table / Card**: responsywne tabele i karty danych.
- **FilterBar**: menu filtrów (select, DatePicker).
- **Form**, **Input**, **Select**, **DatePicker**: formularze z walidacją (komponenty Shadcn/UI).
- **Dialog**: potwierdzenia i formularze modalne.
- **Toast**, **InlineAlert**: feedback użytkownika.
- **SkeletonLoader**: stany ładowania.
- **ErrorBoundary / NetworkBanner**: obsługa błędów runtime i sieciowych.

## 6. Zarządzanie stanem i integracja z danymi

- **React Query**: globalne hooki `useQuery` do pobierania danych (GET `/reservations`, GET `/reservations/available`, GET `/vehicles`) oraz `useMutation` do operacji mutacji (POST `/reservations`, PATCH `/reservations/{id}`, POST/PATCH/DELETE `/vehicles`).
- **Cache invalidation**: automatyczne odświeżanie list po zakończonych mutacjach (np. refetchQueries dla kluczy `['reservations']`, `['vehicles']`).
- **Retry i error handling**: domyślne retry 1 raz przy błędach sieciowych, obsługa błędów przez InlineAlert i globalny ErrorBoundary.

---
## 7. Walidacja i obsługa błędów

- **Login**: inline validation pustych pól; na błędy 401/403 wyświetlać `InlineAlert` z odpowiednim komunikatem i blokować submit;
- **Formularz rezerwacji**: service wybór zawsze dostępny; pojazd wymagany; `DatePicker` ograniczony do przyszłości; `TimePicker` z krokami równymi minutom usługi; błędy walidacji (brak pojazdu, nieprawidłowa data/godzina) jako inline alerts przy polach;
- **Wyszukiwanie slotów**: brak slotów → `InlineAlert` „Brak dostępnych terminów”; błędy 400/404 → `Toast` error;
- **Formularz pojazdu**: `license_plate` 2–20 alfanum., `vin` 17 znaków, `production_year` 1980–2080; błędy jako inline alerts;
- **Globalne błędy sieciowe**: `NetworkBanner` w headerze (offline), `ErrorBoundary` dla nieoczekiwanych błędów;
- **Toasty**: sukcesy operacji mutacji (dodano auto, stworzono rezerwację, edycja, anulowanie) – zielone, 5s; błędy niekrytyczne (409, 500) – czerwone, 5s.
