# API Endpoint Implementation Plan: POST /reservations

## 1. Przegląd punktu końcowego
`POST /reservations` umożliwia utworzenie nowej rezerwacji usługi. Operacja sprawdza uprawnienia, dostępność terminu oraz zgodność czasu z długością usługi, zapisuje rekord w bazie i generuje tekst rekomendacji przy użyciu zewnętrznego serwisu LLM.

## 2. Szczegóły żądania
- Metoda HTTP: POST  
- URL: `/api/reservations`  
- Nagłówki:  
  - `Authorization: Bearer <JWT>` (wymagane)  
  - `Content-Type: application/json`  
- Request Body (JSON):  
  ```json
  {
    "service_id": number,                   // required, musi istnieć
    "vehicle_license_plate": string,        // required, własność użytkownika
    "employee_id": string (UUID),           // required, musi istnieć
    "start_ts": string (ISO8601),           // required, >= teraz
    "end_ts": string (ISO8601)              // required, > start_ts, dokładnie duration
  }
  ```
- Parametry wymagane: `service_id`, `vehicle_license_plate`, `employee_id`, `start_ts`, `end_ts`
- Parametry opcjonalne: brak

## 3. Wykorzystywane typy i modele
- ReservationCreateDto (src/types.ts)  
- ReservationDto (src/types.ts)  
- AvailableReservationsResponseDto – analogiczna struktura dla listy (opcjonalnie przy walidacji slotów)  
- Zod schema: ReservationCreateSchema (src/lib/validation/reservationSchema.ts)

## 4. Szczegóły odpowiedzi
- 201 Created (JSON):  
  ```json
  {
    "id": string (UUID),
    "user_id": string (UUID),
    "service_id": number,
    "service_name": string,
    "service_duration_minutes": number,
    "vehicle_license_plate": string,
    "employee_id": string,
    "employee_name": string,
    "start_ts": string,
    "end_ts": string,
    "status": "New",
    "recommendation_text": string,
    "created_at": string,
    "updated_at": string
  }
  ```
- Błędy:  
  - 400 Bad Request – brak/pusty parametr, niepoprawny format, czas w przeszłości, odstęp czasu ≠ duration  
  - 401 Unauthorized – brak/nieprawidłowy JWT  
  - 403 Forbidden – próba rezerwacji pojazdu nie należącego do użytkownika  
  - 404 Not Found – nie istnieje Service/Vehicle/Employee  
  - 409 Conflict – termin niedostępny (kolizja rezerwacji lub poza grafikiem)  
  - 500 Internal Server Error – nieoczekiwany błąd serwera

## 5. Przepływ danych
1. **Middleware**  – weryfikacja JWT, `context.locals.user`  
2. **Walidacja**  – użycie Zod do sprawdzenia typów i reguł  
3. **Autoryzacja**  – sprawdzenie własności `vehicle_license_plate`  
4. **Dostępność**  – w service: zapytanie do `reservations` i `employee_schedules` w jednej transakcji dla wykluczenia kolizji  
5. **Tworzenie rezerwacji**  – `INSERT` do `reservations` (status = New, created_by = user_id)  
6. **Generowanie rekomendacji**  – wywołanie serwisu LLM z danymi pojazdu, aktualna data, wstawienie `recommendation_text` w tabeli  
7. **Odpowiedź**  – odczyt wstawionego rekordu z joinami do `services` i `employees`

## 6. Względy bezpieczeństwa
- **Authentication**: JWT, `supabase.auth` w middleware  
- **Authorization**: sprawdzenie własności pojazdu, RLS w Supabase (polityki na tabeli `reservations`)  
- **Walidacja**: Zod, guard clauses (early return)  
- **SQL Injection**: użycie query buildera Supabase lub parametrów wiązanych  
- **Eksfiltracja**: nie ujawniać wrażliwych danych w odpowiedziach

## 7. Obsługa błędów
| Kod  | Warunek                                     | Komunikat                                   |
|------|---------------------------------------------|----------------------------------------------|
| 400  | Walidacja danych                            | "service_id is required", "start_ts ..." |
| 401  | Brak/nieprawidłowy JWT                      | "Unauthorized"                             |
| 403  | Użytkownik nie jest właścicielem pojazdu    | "Vehicle not owned by user"                |
| 404  | Service/Vehicle/Employee nie istnieje       | "Service not found"                        |
| 409  | Kolizja terminu lub poza grafikiem          | "Time slot not available"                  |
| 500  | Błąd wewnętrzny                            | "Internal server error"                    |

## 8. Rozważania dotyczące wydajności
- **Indeksy**: indeks na `(employee_id, start_ts, end_ts)`  
- **Transakcje**: atomiczna weryfikacja dostępności + wstawienie  
- **Rate limiting**: aby uniknąć DoS przy generowaniu rekomendacji  
- **Cache**: statyczne listy usług/pojazdów (opcjonalnie)

## 9. Kroki implementacji
1. Dodać `ReservationCreateSchema` (Zod) w `src/lib/validation/reservationSchema.ts`  
2. Rozszerzyć `src/lib/services/reservationAvailabilityService.ts` o metodę `findAvailableSlot`  
3. Utworzyć nowy serwis `src/lib/services/reservationService.ts`:  
   - `createReservation(dto: ReservationCreateDto, userId: string)`  
4. W serwisie implementować: walidacja, autoryzacja, dostępność, wstawienie i generowanie rekomendacji  
5. Dodać route handler w `src/pages/api/reservations/index.ts`:  
   - `export const POST` z `prerender = false`, `await supabase.from(context).…`  
6. Napisać testy integracyjne `__tests__/reservations-post.test.ts` (ścieżki, kody, scenariusze błędów)  
7. Aktualizacja dokumentacji w README-reservations.md  
8. Code review, merge i deployment
