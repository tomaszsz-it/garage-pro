# API Endpoint Implementation Plan: GET /reservations/available

## 1. Przegląd punktu końcowego
Endpoint zwraca listę dostępnych terminów dla usługi serwisowej. Bazuje na harmonogramach pracowników, istniejących rezerwacjach oraz czasie trwania usługi. Wyniki są filtrowane według określonego zakresu dat oraz limitowane do ustalonej liczby slotów.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET
- **Struktura URL:** `/reservations/available`
- **Parametry Query:**
  - **Wymagane:**
    - `service_id` (int) – identyfikator usługi (musi być dodatnią liczbą i istnieć w tabeli services)
  - **Opcjonalne:**
    - `start_ts` (ISO8601 datetime) – początek zakresu wyszukiwania (domyślnie: aktualny czas)
    - `end_ts` (ISO8601 datetime) – koniec zakresu wyszukiwania (domyślnie: +30 dni), musi być większy od `start_ts`, maksymalnie 90 dni dalej
    - `limit` (int) – maksymalna liczba zwracanych slotów (domyślnie: 10, maksymalnie: 50)

## 3. Wykorzystywane typy
```typescript
// Przykładowe definicje (w src/types.ts)
interface AvailableSlotsQueryParams {
  service_id: number;
  start_ts?: string;
  end_ts?: string;
  limit?: number;
}

interface AvailableSlotDto {
  start_ts: string;
  end_ts: string;
  employee_id: string;
  employee_name: string;
}

interface AvailableSlotsResponseDto {
  data: AvailableSlotDto[];
}
```

## 4. Przepływ danych
1. **Walidacja parametrów wejściowych:**
   - Sprawdzenie, że `service_id` jest liczbą dodatnią i usługa istnieje
   - Weryfikacja formatu dat `from` i `to` oraz ich relacji (np. `to` > `from` i zakres nie przekracza 90 dni)
   - Walidacja `limit` (musi być w przedziale 1-50)

2. **Pobranie danych z bazy:**
   - Pobranie informacji o usłudze (np. `duration_minutes`)
   - Query do tabeli `employee_schedules` w celu pobrania dostępnych harmonogramów w zadanym przedziale czasu
   - Query do tabeli `reservations` w celu odfiltrowania kolidujących rezerwacji

3. **Generowanie slotów:**
   - Dla każdego harmonogramu:
     - Podzielenie czasu pracy na sloty o długości odpowiadającej `duration_minutes` usługi
     - Odfiltrowanie slotów kolidujących z już istniejącymi rezerwacjami
     - Zastosowanie reguł biznesowych: sloty muszą być w przyszłości, w ramach godzin pracy i odpowiadać dokładnemu czasowi trwania usługi

4. **Formowanie odpowiedzi:**
   - Przekształcenie wyników do typu `AvailableSlotsResponseDto`
   - Sortowanie slotów chronologicznie i zastosowanie limitu

## 5. Względy bezpieczeństwa
- **Uwierzytelnianie:** Endpoint wymaga autoryzacji przez Supabase Auth (weryfikacja tokenu JWT)
- **Walidacja danych:** Użycie bibliotek typu zod do walidacji parametrów wejściowych
- **Ochrona danych:** Nieodpowiadanie szczegółami wewnętrznych błędów bazy
- **Rate limiting:** Wdrożenie limitów zapytań, np. 100 zapytań/minuta na użytkownika

## 6. Obsługa błędów
- **400 Bad Request:**
  - Błędy walidacyjne, np. "service_id is required", "Invalid datetime format", "from cannot be in the past", "to must be after from", "limit must be between 1 and 50"
- **404 Not Found:**
  - Usługa o danym `service_id` nie istnieje
- **401 Unauthorized:**
  - Brak lub nieprawidłowy token autoryzacyjny
- **500 Internal Server Error:**
  - Błędy po stronie serwera lub bazy danych

## 7. Rozważania dotyczące wydajności
- **Optymalizacja zapytań:**
  - Użycie indeksów na kolumnach dat w tabelach `employee_schedules` i `reservations`
  - Ograniczenie zakresu czasowego do maksymalnie 90 dni
- **Cachowanie wyników:**
  - Opcjonalnie, caching wyników zapytań o harmonogramy, TTL: 1 minuta dla dynamicznych danych
- **Paginacja:**
  - Domyślny limit slotów zapewnia szybki czas odpowiedzi

## 8. Etapy wdrożenia
1. **Przygotowanie środowiska:**
   - Utworzenie plików m.in. `src/lib/services/availabilityService.ts` i `src/lib/validation/availabilitySchemas.ts`

2. **Implementacja walidacji:**
   - Utworzenie schematów walidacji (np. przy użyciu biblioteki zod)
   - Testy jednostkowe walidacji parametrów wejściowych

3. **Implementacja logiki biznesowej:**
   - Implementacja usługi `availabilityService` do generowania slotów
   - Integracja z bazą danych oraz implementacja algorytmu generowania slotów
   - Testy jednostkowe logiki biznesowej

4. **Implementacja endpointu:**
   - Utworzenie pliku `src/pages/api/reservations/available.ts`
   - Integracja walidacji, logiki biznesowej i obsługi błędów
   - Przykładowa implementacja:
   ```typescript
   import { z } from 'zod';
   import { availabilityService } from '~/lib/services/availabilityService';
   import { availabilitySchemas } from '~/lib/validation/availabilitySchemas';

   export const prerender = false;

   export async function GET({ request, locals }) {
     try {
       const params = availabilitySchemas.queryParams.parse(Object.fromEntries(new URL(request.url).searchParams));
       const slots = await availabilityService.getAvailableSlots(params);
       return new Response(JSON.stringify({ data: slots }), { status: 200, headers: { 'Content-Type': 'application/json' } });
     } catch (error) {
       if (error instanceof z.ZodError) {
         return new Response(JSON.stringify({ error: 'Invalid parameters' }), { status: 400 });
       }
       // ...additional error handling...
       return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
     }
   }
   ```

5. **Testowanie:**
   - Testy jednostkowe i integracyjne endpointu
   - Testy wydajnościowe i obciążeniowe

6. **Dokumentacja:**
   - Aktualizacja dokumentacji API (OpenAPI/Swagger)
   - Przykłady użycia endpointu

7. **Deployment:**
   - Code review, wdrożenie na środowisku staging, monitorowanie