# API Endpoint Implementation Plan: GET /reservations/available

## 1. Przegląd punktu końcowego
Cel: Udostępnienie użytkownikom listy najbliższych dostępnych slotów rezerwacji dla wybranej usługi.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- URL: `/reservations/available`
- Parametry zapytania:
  - Wymagane:
    - `service_id` (integer) – identyfikator usługi, musi istnieć w tabeli `services`.
  - Opcjonalne:
    - `start_ts` (string, ISO8601) – czas początkowy wyszukiwania, domyślnie `now()`; nie może być w przeszłości.
    - `end_ts` (string, ISO8601) – czas końcowy wyszukiwania, domyślnie `start_ts + 30 dni`; musi być po `start_ts`, max 90 dni od `start_ts`.
    - `limit` (integer) – maksymalna liczba slotów w odpowiedzi, domyślnie 32, max 200.
- Body: brak (brak treści żądania)

## 3. Wykorzystywane typy DTO i modele
- AvailableReservationsQueryParams (`service_id`, `start_ts?`, `end_ts?`, `limit?`)
- AvailableReservationDto (`start_ts`, `end_ts`, `employee_id`, `employee_name`)
- AvailableReservationsResponseDto (`data`: AvailableReservationDto[])

## 4. Szczegóły odpowiedzi
- 200 OK:
  ```json
  {
    "data": [
      { "start_ts": "2024-10-16T09:00:00Z", "end_ts": "2024-10-16T09:30:00Z", "employee_id": "uuid", "employee_name": "Mechanik1" },
      ...
    ]
  }
  ```
- 400 Bad Request:
  - Brak `service_id`
  - Nieprawidłowy format daty
  - `start_ts` w przeszłości
  - `end_ts` ≤ `start_ts` lub ponad 90 dni
- 401 Unauthorized: nieautoryzowany dostęp
- 404 Not Found: usługa o podanym `service_id` nie istnieje
- 500 Internal Server Error: nieoczekiwany błąd serwera

## 5. Przepływ danych
1. **Autoryzacja** – middleware sprawdza obecność i ważność tokena.
2. **Walidacja** – Zod weryfikuje query params według `AvailableReservationsQueryParams`.
3. **Sprawdzenie istnienia usługi** – zapytanie do `services` po `service_id` i pobranie `duration_minutes`.
4. **Pobranie harmonogramów** – z `employee_schedules` wszystkie zakresy w `BETWEEN start_ts AND end_ts`.
5. **Generowanie slotów** – dla każdego harmonogramu dzielenie przedziału na okna o długości `duration_minutes`.
6. **Filtracja istniejących rezerwacji** – wykluczenie slotów pokrywających się z `reservations` (EXCLUDE lub manualne porównanie).
7. **Mapowanie i sortowanie** – utworzenie listy `AvailableReservationDto`, posortowanie chronologicznie.
8. **Ograniczenie** – zwrócenie pierwszych `limit` slotów.

## 6. Względy bezpieczeństwa
- Uwierzytelnianie przez Astro middleware (`context.locals.supabase.auth`).
- Brak ryzyka ujawnienia wrażliwych danych – endpoint nie zwraca danych użytkownika.
- Walidacja wejścia zapobiega SQL injection (Zod + Supabase client).
- Ograniczenie liczby wyników (`limit`), by zapobiec DoS.

## 7. Obsługa błędów
- **400** – Zod rzuca `BadRequestError` z komunikatem.
- **401** – middleware rzuca `UnauthorizedError`.
- **404** – ręczne rzucenie `NotFoundError` jeśli usługa nie istnieje.
- **500** – nieprzewidziane wyjątki łapane i logowane, zwracają generyczne `InternalServerError`.
- **Logowanie błędów** – użycie `database.error.ts` i/lub dedykowanego loggera w `src/lib/errors`.

## 8. Wydajność
- Ograniczony zakres danych przy zapytaniach do `employee_schedules` i `reservations`.
- Możliwość wykorzystania indeksów na `start_ts` i `end_ts` w bazie.
- Ewentualne buforowanie popularnych wyników (cache layer).

## 9. Kroki implementacji
1. Utworzyć/zaakceptować w `src/types.ts`:
   - `AvailableReservationsQueryParams`, `AvailableReservationDto`, `AvailableReservationsResponseDto`.
2. Dodać nową usługę w `src/lib/services/reservationAvailabilityService.ts`:
   - funkcja `getAvailableReservations(params, supabase)` implementująca algorytm.
3. W `src/pages/api/reservations/available.ts`:
   - zaimportować middleware auth, Zod schema oraz `getAvailableReservations`.
   - obsłużyć request zgodnie z flow danych.
5. Zaktualizować dokumentację (README, Swagger/OpenAPI) endpointu.
