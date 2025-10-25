# Architektura UI dla Garage Pro

## 1. Przegląd struktury UI

Aplikacja opiera się na pojedynczym layoutcie z publicznym ekranem logowania oraz chronionymi trasami dostępnymi po uwierzytelnieniu. Główne widoki to lista rezerwacji, wyszukiwanie dostępnych terminów oraz panel zarządzania autami. Całość korzysta z responsywnego designu opartego na Tailwind, gotowych komponentów z Shadcn/ui oraz React.

## 2. Lista widoków

- **Ekran uwierzytelniania**
  - **Ścieżka:** `/login`, `/register`
  - **Główny cel:** umożliwić użytkownikowi zalogowanie się lub rejestrację w systemie.
  - **Kluczowe informacje:** pola e-mail i hasło; komunikaty walidacji inline (puste pola, nieprawidłowe dane); przechwycenie błędów uwierzytelniania (401/403).
  - **Kluczowe komponenty:** formularz wejściowy, przycisk potwierdzenia, komunikaty błędów.
  - **UX, dostępność i względy bezpieczeństwa:** czytelne etykiety; wsparcie obsługi klawiatury; walidacja inline; przekierowanie w przypadku braku dostępu.

- **Lista rezerwacji**
  - **Ścieżka:** `/reservations`
  - **Główny cel:** umożliwić przeglądanie i zarządzanie rezerwacjami użytkownika.
  - **Kluczowe informacje:** lista rezerwacji (data, godzina, usługa, pojazd, status); paginacja; filtr po pojeździe, usłudze, statusie
  - **Kluczowe komponenty:** filtr pojazdów; lista w formie tabeli (desktop) lub kart (mobile); Dodatkow przyciski akcji (wyszukaj dostępne, dodaj auto).
  - **UX, dostępność i względy bezpieczeństwa:** czytelne nagłówki; wskazanie statusu; responsywność, potwierdzenie anulowania.

- **Wyszukiwanie dostępnych terminów i bookowanie rezerwacji**
  - **Ścieżka:** `/reservations/available`
  - **Główny cel:** prezentacja dostępnych slotów dla wybranej usługi i pojazdu.
  - **Kluczowe informacje:** wybór usługi; wybór daty; lista slotów (start_ts, end_ts); informacja o braku wyników. employee_id ukryty, mechanik wybierany automatycznie. Komunikaty walidacji inline (np. brak pojazdu, kolizje terminów). Po zabookowaniu rezerwacji, wyświetlenie szczegółów rezerwacji wraz z rekomendacją konserwacyjną
  - **Kluczowe komponenty:** filtry (usługa, data); lista slotów; przycisk rezerwacji.
  - **UX, dostępność i względy bezpieczeństwa:** intuicyjny formularz, ograniczenia dat do przyszłości; informowanie o braku wyników; blokada przycisków, potwierdzenie akcji.

- **Szczegóły rezerwacji**
  - **Ścieżka:** `/reservations/:id`
  - **Główny cel:** wyświetlić pełne dane rezerwacji oraz umożliwić edycję lub anulowanie. Brak możliwości edycji dla dat wstecznych.
  - **Kluczowe informacje:** terminy; usługa; pojazd; rekomendacja konserwacyjna AI; status rezerwacji.
  - **Kluczowe komponenty:** wyświetlacz szczegółów; przyciski edycji i anulowania; dialog potwierdzenia. rekomendacja konserwacyjna to długi tekst do 50000 znaków
  - **UX, dostępność i względy bezpieczeństwa:** potwierdzenie destrukcyjnych operacji; czytelna struktura informacji.  Tytuły stron dla orientacji użytkownika.

- **Pojazdy**
  - **Ścieżka:** `/vehicles`
  - **Główny cel:** umożliwić zarządzanie listą pojazdów użytkownika.
  - **Kluczowe informacje:** lista pojazdów (nr rejestracyjny, marka, model, rok); informacja o braku pojazdów. 
  - **Kluczowe komponenty:** tabela lub karty pojazdów; przyciski dodawania, edycji, usuwania; dialog potwierdzenia usunięcia.
  - **UX, dostępność i względy bezpieczeństwa:** strona responsywna; potwierdzenie przy usuwaniu; inline komunikaty błędów.

- **Formularz pojazdu**
  - **Ścieżka:** `/vehicles/new`, `/vehicles/:id/edit`
  - **Główny cel:** umożliwić wprowadzanie lub edycję danych pojazdu.
  - **Kluczowe informacje:** pola: numer rejestracyjny, VIN, marka, model, rok; walidacja inline.
  - **Kluczowe komponenty:** pola wejściowe; przycisk zapisu; komunikaty walidacji.
  - **UX, dostępność i względy bezpieczeństwa:** czytelne etykiety; walidacja inline; blokada wysyłki niepełnych formularzy.

 **Panel użytkownika**
  - **Ścieżka:** `/profile`
  - **Główny cel:** Zarządzanie informacjami o koncie użytkownika i ustawieniami.
  - **Kluczowe informacje:** Dane użytkownika, opcje edycji profilu, przycisk wylogowania.
  - **Kluczowe komponenty:** Formularz edycji profilu, przyciski akcji.
  - **UX, dostępność i względy bezpieczeństwa:** Bezpieczne wylogowanie, łatwy dostęp do ustawień, prosty i czytelny interfejs.

# 3. Mapa podróży użytkownika

1. Użytkownik uzyskuje dostęp do aplikacji i trafia do ekranu logowania/rejestracji.
2. Po poprawnym uwierzytelnieniu użytkownik zostaje przekierowany do widoku `/reservations`.
2. Na liście rezerwacji może filtrować po pojeździe, anulować rezerwację lub przejść do wyszukiwania dostępnych terminów.
3. Przejście do `/reservations/available`, wybór dostępnego slotu → przycisk „Rezerwuj” → przejście do `/reservations/:id` z rekomendacją AI.
4. Opcja „Dodaj auto” otwiera dialog → po zapisaniu odświeżenie dostępności auta w liście rezerwacji.
5. Kliknięcie rezerwacji przenosi do `/reservations/:id` z możliwością edycji lub anulowania.

## 4. Układ i struktura nawigacji
- **Główna nawigacja:** Dostępna jako górne menu w layoucie strony po zalogowaniu.
- **Elementy nawigacyjne:** Linki do widoków: "Rezerwacje"(`/reservations`), "Pojazdy" (`/vehicles`), "Profil" oraz przycisk wylogowania.
- **Responsywność:** W widoku mobilnym nawigacja przekształca się w menu hamburger, umożliwiając łatwy dostęp do pozostałych widoków.
- **Przepływ:** Nawigacja umożliwia bezproblemowe przechodzenie między widokami, zachowując kontekst użytkownika i jego dane sesyjne.
- Widoki prezuntują aktualne tytuły stron dla orientacji użytkownika

## 5. Kluczowe komponenty
- **Formularze uwierzytelnienia:** komponenty logowania i rejestracji z obsługą walidacji.
- **Nawigacja**: menu z odnośnikami do głównych sekcji oraz przycisk wylogowania.
- **Komponent wyboru slotu** kalendarz dat (widok miesiąca) z zaznaczonymi dostepnymi dniami, po kliknięciu w dzień, wybór slotu godzinowego.
- **Modal/Dialog**: potwierdzenia oraz formularze w trybie modalnym.
- **Modal edycji pojazdu:** komponent umożliwiający edycję pojazdu z walidacją danych przed zatwierdzeniem.
- **Toast notifications:** komponent do wyświetlania komunikatów o sukcesach oraz błędach.
- **Menu Nawigacji:** elementy nawigacyjne ułatwiające przemieszczanie się między widokami.
- **Formularz**: pola wejściowe, przyciski, walidacja inline.
- **Filtry**: selektory i pola daty dla ograniczeń wyszukiwania.
- **Lista danych**: tabela lub karty w zależności od szerokości ekranu.
- **Loader**: wskaźniki ładowania dla operacji asynchronicznych.


## 6. Walidacja i obsługa błędów

- **Formularze**: walidacja pól przed wysłaniem, wyświetlanie komunikatów inline.
- **Brak wyników**: informowanie użytkownika o pustych zestawach danych.

---
