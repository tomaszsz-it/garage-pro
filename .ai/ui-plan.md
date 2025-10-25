# Architektura UI dla Garage Pro

## 1. Przegląd struktury UI

Aplikacja opiera się na pojedynczym layoutcie z publicznym ekranem logowania oraz chronionymi trasami dostępnymi po uwierzytelnieniu. Główne widoki to lista rezerwacji, wyszukiwanie dostępnych terminów oraz panel zarządzania autami. Globalnie dostępne komponenty to header z nawigacją, toast’y, inline alerty oraz ogólny ErrorBoundary z bannerem sieciowym.

## 2. Lista widoków

- **Ekran logowania**
  - Ścieżka: `/login`
  - Cel: umożliwić bezpieczne uwierzytelnienie użytkownika.
  - Informacje kluczowe: pola login, hasło, komunikaty błędów 401/403.
  - Komponenty: `Form`, `Input`, `Button`, `InlineAlert`, `SkeletonLoader`.
  - UX/Accessibility/Security: aria-labely, focus na pierwszym polu, zabezpieczenie tras.

- **Lista rezerwacji**
  - Ścieżka: `/reservations`
  - Cel: przegląd i zarządzanie własnymi rezerwacjami.
  - Informacje kluczowe: id, data/godzina, auto, usługa, status.
  - Komponenty: `Table` (desktop), `Card` (mobile), `FilterBar` (dropdown auta), `Pagination`, `Button` („Anuluj”, „Szukaj dostępnych”, „Dodaj auto”), `Toast`, `InlineAlert`, `SkeletonLoader`.
  - UX/Accessibility/Security: responsywność (`md:hidden`), aria-sortable, potwierdzenie anulowania.

- **Wyszukiwanie dostępnych terminów**
  - Ścieżka: `/reservations/available`
  - Cel: wyświetlić dostępne sloty dla wybranej usługi i pojazdu.
  - Informacje kluczowe: panel filtrów (usługa, zakres dat), lista slotów (start_ts, end_ts, employee_name).
  - Komponenty: `FilterBar`, `DatePicker`, `TimePicker`, `Table`/`Card`, `Button` („Rezerwuj”), `InlineAlert`, `SkeletonLoader`.
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

- **Header** (persistent): linki „Rezerwacje” (`/reservations`), „Moje auta” (`/vehicles`), przycisk „Wyloguj”.
- **Chronione trasy**: ochrona tras przy pomocy Context i przekierowanie do `/login` przy braku tokenu.
- **Breadcrumbs** lub tytuły stron dla orientacji użytkownika.

## 5. Kluczowe komponenty

- **Header**: nawigacja i wylogowanie.
- **Table / Card**: responsywne tabele i karty danych.
- **FilterBar**: menu filtrów (select, date).
- **Form**, **Input**, **Select**, **DatePicker**, **TimePicker**: formularze z walidacją.
- **Dialog**: potwierdzenia i formularze modalne.
- **Toast**, **InlineAlert**: feedback użytkownika.
- **SkeletonLoader**: stany ładowania.
- **ErrorBoundary / NetworkBanner**: obsługa błędów runtime i sieciowych.

---
