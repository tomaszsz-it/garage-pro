# API Endpoint Implementation Plan: GET /reservations

## 1. Przegląd punktu końcowego
Endpoint GET `/reservations` umożliwia pobranie listy rezerwacji z opcjonalnymi filtrami oraz stronicowaniem. Użytkownicy zwykli widzą tylko swoje rezerwacje, a użytkownicy z rolą sekretariatu wszystkie.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: `/reservations`
- Parametry zapytania:
  - Wymagane:
    - `page` (int, domyślnie 1, min 1)
    - `limit` (int, domyślnie 20, max 100)
- Brak ciała żądania

## 3. Wykorzystywane typy
- `ReservationsQueryParams` (PaginationDto)
- `ReservationDto` (DTO pojedynczej rezerwacji z nazwami serwisu i pracownika)
- `ReservationsListResponseDto` (lista `data: ReservationDto[]` + `pagination`)

## 4. Szczegóły odpowiedzi
- Kod 200: strona z danymi
```json
{
  "data": ReservationDto[],
  "pagination": { "page": number, "limit": number, "total": number }
}
```
- Błędy:
  - 400 Bad Request – nieprawidłowe parametry (np. zły format daty, niepoprawny `status`)
  - 401 Unauthorized – brak autoryzacji
  - 500 Internal Server Error – błąd serwera

## 5. Przepływ danych
1. Endpoint w `src/pages/api/reservations.ts`:
   - Pobranie `supabase` i `auth` z `context.locals`.
   - Parsowanie i walidacja query params za pomocą Zod.
   - Rozróżnienie roli użytkownika (zwykły vs. sekretariat).
   - Wywołanie metody `reservationService.getReservations(params, auth)`.
2. `reservationService.getReservations` (w `src/lib/services/reservationService.ts`):
   - Budowa zapytania do Supabase:
     - `select` z joinami na `services` i `employees` (ewentualnie `vehicles`).
     - Filtracja po `user_id` jeśli użytkownik nie ma roli sekretariatu.
     - `range` dla stronicowania (offset/limit).
   - Mapowanie wyników na `ReservationDto`.
3. Zwrot structury odpowiedzi.

## 6. Względy bezpieczeństwa
- Autoryzacja: tylko uwierzytelnieni użytkownicy.
- RLS w Supabase: weryfikacja `user_id = auth.sub` dla zwykłych.
- Walidacja danych wejściowych (Zod) – uniemożliwia złośliwe query.


## 7. Obsługa błędów
- 400: Zod `parse()` rzuca, łapać i zwracać JSON z komunikatem.
- 401: jeśli brak `auth.user`, zwrócić 401.
- 500: nieprzewidziane wyjątki, logować i zwracać generyczny błąd.
- Logowanie błędów do `src/lib/errors/database.error.ts` lub centralnego loggera.

## 8. Rozważania dotyczące wydajności
- Indeksy w bazie na kolumnach `user_id`
- Ograniczenie `limit <= 100`.
- Stronicowanie zamiast pełnych skanów.
- Użycie pojedynczego zapytania z joinami.

## 9. Kroki implementacji
1. Utworzyć Zod schema dla `ReservationsQueryParams` w `src/lib/validation/reservationSchema.ts`.
2. Dodać lub zaktualizować plik endpointu `src/pages/api/reservations.ts`:
   - Parsowanie, walidacja, uwierzytelnianie.
3. W `src/lib/services/reservationService.ts` zaimplementować `getReservations`.
4. Zaktualizować typy w `src/types.ts`, jeśli potrzeba.
6. Dodać logging błędów i obsługę wyjątków.
7. Zaktualizować dokumentację w `README-vehicles.md` i `README.md`.
