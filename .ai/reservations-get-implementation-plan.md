# API Endpoint Implementation Plan: GET /reservations

## 1. Przegląd punktu końcowego
`GET /reservations` umożliwia pobranie listy rezerwacji ze stronicowaniem. Zwykli użytkownicy widzą tylko swoje rezerwacje, sekretariat widzi wszystkie.

## 2. Szczegóły żądania
- Metoda HTTP: GET  
- URL: `/api/reservations`  
- Nagłówki:  
  - `Content-Type: application/json`  
- Parametry zapytania (query parameters):
  ```text
  page: number           // int, default=1, min=1
  limit: number          // int, default=20, max=100
  ```
- Wymagane: żadne jawnie – domyślne wartości `page` i `limit` stosowane gdy nie podano  
- Brak ciała żądania

## 3. Wykorzystywane typy i modele
- `ReservationsQueryParams` (src/types.ts) – interfejs DTO query params  
- `ReservationDto` (src/types.ts) – DTO pojedynczej rezerwacji  
- `ReservationsListResponseDto` (src/types.ts) – odpowiedź listy  
- Zod schema: `getReservationsQuerySchema` definiowany w `src/lib/validation/reservationSchema.ts`:

## 4. Szczegóły odpowiedzi
- 200 OK (JSON):
```json
{
  "data": [ ReservationDto ],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number
  }
}
```
- 401 Unauthorized – brak lub błędny token JWT  
- 500 Internal Server Error – nieoczekiwany błąd serwera

## 5. Przepływ danych
1. **Middleware**  – weryfikacja JWT, `context.locals.user` 
2. **Walidacja**  – użycie Zod do sprawdzenia typów i reguł    
2. **Endpoint handler** w `src/pages/api/reservations.ts`:  
   1. `export const prerender = false`  
   2. Parsowanie i walidacja parametrów zapytania za pomocą Zod
   3. Sprawdzenie roli użytkownika (`context.locals.user.role === 'secretariat'`)  
   4. Wywołanie `reservationService.getReservations(params, context.locals.user)`  
3. **Serwis** `reservationService.getReservations`:  
   1. Inicjalizacja query buildera Supabase:  
   2. Jeżeli użytkownik nie ma roli sekretariatu: `.eq('user_id', user.id)`  
   4. Sortowanie: `.order('start_ts', { ascending: true })`  
   5. Stronicowanie: `.range((page-1)*limit, page*limit-1)`  
   6. Wywołanie `.throwOnError()` lub obsługa błędów  
   7. Mapowanie każdej pozycji na `ReservationDto`  
4. **Zwrot odpowiedzi** – konstrukcja `ReservationsListResponseDto` z `data` i `pagination`

## 6. Względy bezpieczeństwa
- **Autoryzacja**: RLS w Supabase, dodatkowe `.eq('user_id')` w kodzie   
- **Ochrona danych**: wyświetlamy tylko dozwolone kolumny  
- **Limit DoS**: ograniczenie `limit <= 100`

## 7. Obsługa błędów
| Kod  | Warunek                                          | Komunikat                   |
|------|--------------------------------------------------|-----------------------------|
| 400  | Walidacja danych                            | "page doesn't exist", |
| 401  | Brak/Błędny JWT                                   | "Unauthorized"            |
| 500  | Wyjątek serwera podczas zapytań lub mapowania      | "Internal server error"   |

## 8. Rozważania dotyczące wydajności
- **Indeksy**: kolumny `user_id`  
- **Joiny**: unikać nadmiarowych joinów, pobierać tylko potrzebne pola  
- **Stronicowanie**: używanie `.range()` zamiast pobierania całej tabeli

## 9. Kroki implementacji
2. Utworzyć/zmodyfikować endpoint `src/pages/api/reservations.ts`:  auth, wywołanie serwisu  
3. W `src/lib/services/reservationService.ts` zaimplementować `getReservations(params, user)`  
6. Uzupełnić dokumentację w `README-reservations.md` oraz dodać endpoiont do kolekcji Postman  garage-pro.postman_collection.json
