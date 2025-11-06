# API Endpoint Implementation Plan: GET/PATCH /reservations/{id}

## 1. Przegląd punktu końcowego

`GET /reservations/{id}` umożliwia pobranie szczegółów pojedynczej rezerwacji z rozszerzonymi informacjami o pojeździe, usłudze i mechaniku. 

`PATCH /reservations/{id}` pozwala na aktualizację rezerwacji - anulowanie (zmiana statusu), edycję terminu, zmiany usługi lub pojazdu.

Oba endpointy implementują autoryzację na poziomie użytkownika - zwykli użytkownicy mają dostęp tylko do swoich rezerwacji, sekretariat do wszystkich.

## 2. Szczegóły żądania

### GET /reservations/{id}
- Metoda HTTP: GET  
- URL: `/api/reservations/{id}`  
- Parametry ścieżki:
  - `id`: UUID rezerwacji (wymagany)
- Nagłówki:  
  - `Content-Type: application/json`  
- Brak ciała żądania
- Brak parametrów zapytania

### PATCH /reservations/{id}
- Metoda HTTP: PATCH  
- URL: `/api/reservations/{id}`  
- Parametry ścieżki:
  - `id`: UUID rezerwacji (wymagany)
- Nagłówki:  
  - `Content-Type: application/json`  
- Ciało żądania (opcjonalne pola):
  ```json
  {
    "service_id": number,
    "vehicle_license_plate": "string", 
    "start_ts": "2024-10-16T10:00:00Z",
    "end_ts": "2024-10-16T11:00:00Z",
    "status": "New" | "Completed" | "Cancelled"
  }
  ```

## 3. Wykorzystywane typy i modele

- `ReservationDetailDto` (src/types.ts) – DTO szczegółowej rezerwacji dla GET
- `ReservationUpdateDto` (src/types.ts) – DTO dla aktualizacji w PATCH
- Zod schemas w `src/lib/validation/reservationSchema.ts`:
  - `getReservationByIdParamsSchema` - walidacja UUID w path parameter
  - `ReservationUpdateSchema` - walidacja danych w PATCH request body

## 4. Szczegóły odpowiedzi

### GET /reservations/{id}
- 200 OK (JSON):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "service_id": 1,
  "service_name": "Oil Change",
  "service_duration_minutes": 30,
  "vehicle_license_plate": "WAW1234",
  "vehicle_brand": "VW",
  "vehicle_model": "Passat",
  "employee_id": "550e8400-e29b-41d4-a716-446655440000",
  "employee_name": "Mechanik1",
  "start_ts": "2024-10-16T09:00:00Z",
  "end_ts": "2024-10-16T09:30:00Z",
  "status": "New",
  "recommendation_text": "Based on your 2010 VW Passat...",
  "created_at": "2024-10-15T14:30:00Z",
  "updated_at": "2024-10-15T14:30:00Z"
}
```

### PATCH /reservations/{id}
- 200 OK (JSON): zaktualizowane dane rezerwacji (format jak GET)

### Błędy (oba endpointy)
- 400 Bad Request – nieprawidłowe dane/walidacja  
- 401 Unauthorized – brak lub błędny token JWT  
- 403 Forbidden – brak dostępu do tej rezerwacji
- 404 Not Found – rezerwacja nie istnieje
- 409 Conflict (PATCH) – konflikt harmonogramu przy zmianie terminu
- 500 Internal Server Error – nieoczekiwany błąd serwera

## 5. Przepływ danych

### GET /reservations/{id}
1. **Middleware** – weryfikacja JWT, `context.locals.user` 
2. **Path parameter validation** – sprawdzenie poprawności UUID
3. **Endpoint handler** w `src/pages/api/reservations/[id].ts`:  
   1. `export const prerender = false`  
   2. Walidacja UUID za pomocą Zod
   3. Wywołanie `reservationService.getReservationById(id, user)`  
4. **Serwis** `reservationService.getReservationById`:  
   1. Zapytanie z joinami: reservations + services + employees + vehicles
   2. Sprawdzenie autoryzacji (user_id lub rola sekretariat)
   3. Mapowanie na `ReservationDetailDto`
5. **Zwrot odpowiedzi** – konstrukcja odpowiedzi lub error

### PATCH /reservations/{id}
1. **Middleware** – weryfikacja JWT
2. **Path parameter validation** – sprawdzenie UUID
3. **Request body validation** – walidacja Zod dla danych do aktualizacji
4. **Endpoint handler**:
   1. Wywołanie `reservationService.updateReservation(id, updateData, user)`
5. **Serwis** `reservationService.updateReservation`:
   1. Sprawdzenie istnienia rezerwacji i autoryzacji
   2. Walidacja business logic (przeszłe daty, dostępność terminów)
   3. Weryfikacja istnienia powiązanych obiektów (service, vehicle)
   4. Aktualizacja w bazie z automatycznym updated_at
   5. Pobranie zaktualizowanej rezerwacji z joinami
   6. Mapowanie na `ReservationDetailDto`
6. **Zwrot odpowiedzi** – zaktualizowane dane lub błąd

## 6. Względy bezpieczeństwa

- **Autoryzacja**: RLS w Supabase + dodatkowa kontrola w kodzie  
- **Path parameter validation**: UUID format validation  
- **Własność danych**: użytkownicy mogą modyfikować tylko swoje rezerwacje
- **Role-based access**: sekretariat może modyfikować wszystkie rezerwacje
- **Status transitions**: tylko dozwolone przejścia statusu
- **Time validation**: nie można edytować przeszłych rezerwacji (poza statusem)

## 7. Obsługa błędów

| Kod  | Warunek                                          | Komunikat                   |
|------|--------------------------------------------------|-----------------------------|
| 400  | Nieprawidłowy UUID w path                       | "Invalid reservation ID"    |
| 400  | Walidacja request body (PATCH)                  | "Validation failed"         |
| 400  | Próba edycji przeszłej rezerwacji               | "Cannot modify past reservation" |
| 400  | Nieprawidłowa zmiana statusu                    | "Invalid status transition" |
| 401  | Brak/Błędny JWT                                  | "Unauthorized"             |
| 403  | Brak dostępu do rezerwacji                      | "Access denied to this reservation" |
| 403  | Tylko sekretariat może ustawić status "Completed" | "Only secretariat can mark as completed" |
| 404  | Rezerwacja nie istnieje                         | "Reservation not found"    |
| 409  | Nowy termin niedostępny (PATCH)                 | "New time slot not available" |
| 500  | Błąd bazy danych lub serwera                    | "Internal server error"    |

## 8. Rozważania dotyczące wydajności

- **Indeksy**: kolumny `id`, `user_id`, `employee_id` w tabeli reservations  
- **Joiny**: optymalizowane zapytanie z inner join dla wymaganych relacji
- **Single query**: pobieranie wszystkich danych w jednym zapytaniu zamiast N+1
- **Caching potencjał**: możliwość cache'owania na poziomie aplikacji dla często odczytywanych rezerwacji

## 9. Kroki implementacji

1. **Utworzyć validation schemas** w `src/lib/validation/reservationSchema.ts`:
   - `getReservationByIdParamsSchema` (UUID validation)
   - `ReservationUpdateSchema` (PATCH body validation)

2. **Rozszerzyć ReservationService** w `src/lib/services/reservationService.ts`:
   - `getReservationById(id: string, user: User): Promise<ReservationDetailDto>`
   - `updateReservation(id: string, data: ReservationUpdateDto, user: User): Promise<ReservationDetailDto>`

3. **Utworzyć endpoint** `src/pages/api/reservations/[id].ts`:
   - GET handler z walidacją i wywołaniem serwisu
   - PATCH handler z walidacją body i business logic
   - Error handling dla wszystkich scenariuszy

4. **Dodać interfejs dla ReservationWithDetailedRelations**:
   - Rozszerzenie istniejącego ReservationWithRelations o dane vehicles

5. **Testowanie**:
   - Unit testy dla validation schemas
   - Integracyjne testy endpointów
   - Testy autoryzacji i business logic

6. **Dokumentacja**:
   - Uzupełnienie `README-reservations.md`
   - Dodanie endpointów do `garage-pro.postman_collection.json`

7. **Business Logic Validation Rules**:
   - Przeszłe rezerwacje: tylko zmiana statusu dozwolona
   - Status transitions: New → Cancelled/Completed, Cancelled → New (tylko sekretariat)
   - Time slots: sprawdzenie dostępności przy zmianie terminu
   - Service duration: nowy termin musi odpowiadać długości nowej usługi
   - Vehicle ownership: nowy pojazd musi należeć do użytkownika
