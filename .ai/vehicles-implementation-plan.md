# API Endpoint Implementation Plan: Vehicles API

## 1. Przegląd punktu końcowego
Zestaw endpointów REST API do zarządzania pojazdami użytkowników w systemie Garage Pro. Obejmuje pełny CRUD (Create, Read, Update, Delete) z paginacją, walidacją i kontrolą dostępu. Każdy użytkownik ma dostęp tylko do własnych pojazdów dzięki Row-Level Security (RLS) w Supabase.

## 2. Szczegóły żądania

### GET /vehicles
- **Metoda HTTP**: GET
- **URL**: `/api/vehicles`
- **Query Parameters**:
  - `page` (opcjonalny): number, default 1, min 1
  - `limit` (opcjonalny): number, default 20, max 100
- **Request Body**: brak

### POST /vehicles
- **Metoda HTTP**: POST
- **URL**: `/api/vehicles`
- **Nagłówki**: `Content-Type: application/json`
- **Request Body** (JSON):
  ```json
  {
    "license_plate": string,        // required, 2-20 chars, alphanumeric + spaces
    "vin": string,                  // optional, exactly 17 chars
    "brand": string,                // optional, max 50 chars
    "model": string,                // optional, max 50 chars
    "production_year": number,      // optional, integer 1900-2030
    "car_type": string              // optional, max 200 chars
  }
  ```

### GET /vehicles/{license_plate}
- **Metoda HTTP**: GET
- **URL**: `/api/vehicles/{license_plate}`
- **Path Parameters**:
  - `license_plate`: string (URL-encoded)
- **Request Body**: brak

### PATCH /vehicles/{license_plate}
- **Metoda HTTP**: PATCH
- **URL**: `/api/vehicles/{license_plate}`
- **Nagłówki**: `Content-Type: application/json`
- **Path Parameters**:
  - `license_plate`: string (URL-encoded)
- **Request Body** (JSON, dowolna kombinacja pól):
  ```json
  {
    "vin": string,                  // optional, exactly 17 chars
    "brand": string,                // optional, max 50 chars
    "model": string,                // optional, max 50 chars
    "production_year": number,      // optional, integer 1900-2030
    "car_type": string              // optional, max 200 chars
  }
  ```

### DELETE /vehicles/{license_plate}
- **Metoda HTTP**: DELETE
- **URL**: `/api/vehicles/{license_plate}`
- **Path Parameters**:
  - `license_plate`: string (URL-encoded)
- **Request Body**: brak

## 3. Wykorzystywane typy i modele
- **VehicleDto** (src/types.ts) - dla odpowiedzi API (bez user_id)
- **VehicleCreateDto** (src/types.ts) - dla POST /vehicles
- **VehicleUpdateDto** (src/types.ts) - dla PATCH /vehicles/{license_plate}
- **VehiclesListResponseDto** (src/types.ts) - dla GET /vehicles z paginacją
- **VehiclesQueryParams** (src/types.ts) - parametry query dla GET /vehicles
- **Zod schemas**:
  - `vehicleCreateSchema` (istniejący w src/lib/validation/vehicleSchemas.ts)
  - `vehicleUpdateSchema` (do utworzenia)
  - `vehiclesQuerySchema` (do utworzenia)
  - `vehiclePathParamsSchema` (do utworzenia)

## 4. Szczegóły odpowiedzi

### GET /vehicles - 200 OK
```json
{
  "data": [
    {
      "license_plate": "WAW1234",
      "vin": "1FUJA6CK14LM94383",
      "brand": "VW",
      "model": "Passat",
      "production_year": 2010,
      "car_type": "B5 2.0 TDI",
      "created_at": "2024-10-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

### POST /vehicles - 201 Created
```json
{
  "license_plate": "WAW1234",
  "vin": "1FUJA6CK14LM94383",
  "brand": "VW",
  "model": "Passat",
  "production_year": 2010,
  "car_type": "B5 2.0 TDI",
  "created_at": "2024-10-15T10:30:00Z"
}
```

### GET /vehicles/{license_plate} - 200 OK
```json
{
  "license_plate": "WAW1234",
  "vin": "1FUJA6CK14LM94383",
  "brand": "VW",
  "model": "Passat",
  "production_year": 2010,
  "car_type": "B5 2.0 TDI",
  "created_at": "2024-10-15T10:30:00Z"
}
```

### PATCH /vehicles/{license_plate} - 200 OK
Zwraca zaktualizowany obiekt pojazdu w tym samym formacie co GET.

### DELETE /vehicles/{license_plate} - 204 No Content
Brak treści odpowiedzi.

### Błędy
- **400 Bad Request**: Błędy walidacji danych wejściowych
- **401 Unauthorized**: Brak/nieprawidłowy JWT token
- **403 Forbidden**: Próba dostępu do pojazdu innego użytkownika
- **404 Not Found**: Pojazd nie istnieje
- **409 Conflict**: Duplikat license_plate/VIN lub pojazd z aktywnymi rezerwacjami (DELETE)
- **500 Internal Server Error**: Nieoczekiwany błąd serwera

## 5. Przepływ danych

### GET /vehicles
1. **Middleware** - weryfikacja JWT, `context.locals.user`
2. **Walidacja** - parametry query (page, limit) przez Zod schema
3. **Service** - `vehicleService.getVehicles(userId, paginationParams)`
4. **Database** - SELECT z tabeli vehicles WHERE user_id = auth.uid() z LIMIT/OFFSET
5. **Odpowiedź** - VehiclesListResponseDto z danymi i metadanymi paginacji

### POST /vehicles
1. **Middleware** - weryfikacja JWT, `context.locals.user`
2. **Walidacja** - request body przez `vehicleCreateSchema`
3. **Service** - `vehicleService.createVehicle(dto, userId)`
4. **Database** - INSERT do tabeli vehicles z user_id z kontekstu auth
5. **Odpowiedź** - VehicleDto (bez user_id)

### GET /vehicles/{license_plate}
1. **Middleware** - weryfikacja JWT, `context.locals.user`
2. **Walidacja** - path parameter (license_plate) przez Zod schema
3. **Service** - `vehicleService.getVehicleByLicensePlate(licensePlate, userId)`
4. **Database** - SELECT WHERE license_plate = ? AND user_id = auth.uid()
5. **Odpowiedź** - VehicleDto lub 404 jeśli nie znaleziono

### PATCH /vehicles/{license_plate}
1. **Middleware** - weryfikacja JWT, `context.locals.user`
2. **Walidacja** - path parameter i request body przez Zod schemas
3. **Service** - `vehicleService.updateVehicle(licensePlate, userId, updateData)`
4. **Database** - UPDATE WHERE license_plate = ? AND user_id = auth.uid()
5. **Odpowiedź** - zaktualizowany VehicleDto lub 404 jeśli nie znaleziono

### DELETE /vehicles/{license_plate}
1. **Middleware** - weryfikacja JWT, `context.locals.user`
2. **Walidacja** - path parameter przez Zod schema
3. **Service** - `vehicleService.deleteVehicle(licensePlate, userId)`
4. **Sprawdzenie aktywnych rezerwacji** - COUNT z tabeli reservations
5. **Database** - DELETE WHERE license_plate = ? AND user_id = auth.uid()
6. **Odpowiedź** - 204 No Content lub błąd 409 jeśli aktywne rezerwacje

## 6. Względy bezpieczeństwa
- **Authentication**: JWT token weryfikowany przez middleware Astro
- **Authorization**: Row-Level Security (RLS) w Supabase - użytkownicy widzą tylko własne pojazdy
- **Walidacja danych**: Zod schemas dla wszystkich inputów
- **SQL Injection**: Query builder Supabase z parametrami wiązanymi
- **Mass Assignment**: DTO ograniczają pola do bezpiecznych wartości
- **Path Traversal**: URL encoding i walidacja formatu license_plate
- **Data Exposure**: VehicleDto wyklucza user_id z odpowiedzi API

## 7. Obsługa błędów

| Kod | Warunek | Komunikat |
|-----|---------|-----------|
| 400 | Nieprawidłowe dane wejściowe | "license_plate is required", "VIN must be exactly 17 characters" |
| 401 | Brak/nieprawidłowy JWT | "Unauthorized" |
| 403 | Dostęp do cudzego pojazdu | "Access denied to this vehicle" |
| 404 | Pojazd nie istnieje | "Vehicle not found" |
| 409 | Duplikat license_plate/VIN | "Vehicle with this license plate already exists" |
| 409 | Aktywne rezerwacje (DELETE) | "Cannot delete vehicle with active reservations" |
| 500 | Błąd wewnętrzny | "Internal server error" |

## 8. Rozważania dotyczące wydajności
- **Indeksy**: 
  - PRIMARY KEY na license_plate
  - INDEX na user_id dla szybkich filtrów
  - UNIQUE INDEX na vin WHERE vin IS NOT NULL
- **Paginacja**: LIMIT/OFFSET dla dużych zbiorów danych
- **RLS**: Automatyczne filtrowanie na poziomie bazy danych
- **Caching**: Brak cache'owania ze względu na dane użytkownika (prywatne)
- **Rate Limiting**: Rozważyć ograniczenia dla operacji POST/PATCH/DELETE

## 9. Kroki implementacji

### 1. Rozszerzenie schematów walidacji
- Dodać `vehicleUpdateSchema` w `src/lib/validation/vehicleSchemas.ts`
- Dodać `vehiclesQuerySchema` dla parametrów GET /vehicles
- Dodać `vehiclePathParamsSchema` dla walidacji license_plate w URL

### 2. Rozszerzenie VehicleService
W `src/lib/services/vehicleService.ts` dodać metody:
- `getVehicles(userId: string, params: VehiclesQueryParams): Promise<VehiclesListResponseDto>`
- `getVehicleByLicensePlate(licensePlate: string, userId: string): Promise<VehicleDto | null>`
- `updateVehicle(licensePlate: string, userId: string, updateData: VehicleUpdateDto): Promise<VehicleDto>`
- `deleteVehicle(licensePlate: string, userId: string): Promise<void>`
- `hasActiveReservations(licensePlate: string): Promise<boolean>`

### 3. Implementacja route handlers
Rozszerzyć `src/pages/api/vehicles.ts`:
- Dodać implementację GET z paginacją
- Poprawić obsługę błędów w POST

### 4. Utworzenie route handlers dla pojedynczego pojazdu
Utworzyć `src/pages/api/vehicles/[license_plate].ts`:
- `export const GET` - szczegóły pojazdu
- `export const PATCH` - aktualizacja pojazdu  
- `export const DELETE` - usunięcie pojazdu
- `export const prerender = false`

### 5. Implementacja middleware auth
Rozszerzyć `src/middleware/index.ts`:
- Dodać weryfikację JWT token
- Ustawić `context.locals.user` z danymi użytkownika
- Obsługa błędów 401 Unauthorized

### 7. Aktualizacja dokumentacji
- Aktualizacja README-vehicles.md z przykładami użycia
- Aktualizacja kolekcji Postman w `garage-pro.postman_collection.json`
- Dokumentacja błędów i kodów odpowiedzi

### 8. Bezpieczeństwo i RLS
- Weryfikacja polityk RLS w tabeli vehicles
- Testy bezpieczeństwa - próby dostępu do cudzych pojazdów
- Walidacja wszystkich ścieżek autoryzacji
