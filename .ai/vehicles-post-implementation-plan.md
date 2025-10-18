# API Endpoint Implementation Plan: POST /vehicles

## 1. Przegląd punktu końcowego
Endpoint `POST /vehicles` umożliwia tworzenie nowego pojazdu powiązanego z uwierzytelnionym użytkownikiem. Dane wejściowe są walidowane zgodnie z zasadami biznesowymi, a rekord jest zapisywany w tabeli `vehicles`. Odpowiedź zawiera utworzony zasób wraz z datą utworzenia.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Ścieżka: `/vehicles` (w Astro: plik `src/pages/api/vehicles.ts`)
- Nagłówki:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Request Body (JSON):
  - Wymagane:
    - `license_plate` (string): długość 2–20 znaków, alfanumeryczne i spacje
  - Opcjonalne:
    - `vin` (string): dokładnie 17 znaków
    - `brand` (string): maks. 50 znaków
    - `model` (string): maks. 50 znaków
    - `production_year` (number): wartość od 1980 do 2080
    - `car_type` (string): maks. 200 znaków

### Przykład żądania
```json
{
  "license_plate": "WAW1234",
  "vin": "1FUJA6CK14LM94383",
  "brand": "VW",
  "model": "Passat",
  "production_year": 2010,
  "car_type": "B5 2.0 TDI"
}
```

## 3. Wykorzystywane typy
- `VehicleCreateDto` – typ DTO na podstawie `Omit<VehicleInsert, 'user_id' | 'created_at'>`
- `VehicleDto` – typ odpowiedzi na podstawie `Omit<Vehicle, 'user_id'>`
- (opcjonalnie) `CreateVehicleCommand` – model poleceń dla logiki domain/service layer

## 4. Szczegóły odpowiedzi
- Kod statusu: **201 Created**
- Body (JSON): instancja `VehicleDto` zawierająca pola:
  - `license_plate`, `vin`, `brand`, `model`, `production_year`, `car_type`, `created_at`

### Przykład odpowiedzi
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

## 5. Przepływ danych
1. Użytkownik wysyła żądanie do `POST /vehicles` z tokenem JWT.
2. Middleware Astro dekoduje token, ustawia `context.locals.user` (Supabase Auth).
3. Handler wywołuje Zod do walidacji `req.json()`.
4. Service layer (`vehicleService.createVehicle`) otrzymuje `dto` i `userId` z kontekstu.
5. Service używa klienta Supabase (`context.locals.supabase`) do wstawienia rekordu do tabeli `vehicles`.
6. Supabase zwraca nowy wiersz, mapowany na `VehicleDto`.
7. Handler zwraca odpowiedź 201 z JSON.

## 6. Względy bezpieczeństwa
- Uwierzytelnianie: wymagany ważny JWT; 401 przy braku/nieprawidłowym tokenie.
- Autoryzacja: nadpisanie `user_id` wyłącznie z `auth.uid()`, nie z payload.
- RLS: polityka Supabase w tabeli `vehicles` pozwala na `INSERT` gdy `auth.uid() = user_id`.
- Walidacja danych: Zod chroni przed wstrzyknięciami i nieprawidłowymi danymi.

## 7. Obsługa błędów
- **400 Bad Request** – nieprzechodzące walidacji Zod (np. puste `license_plate`, zły format VIN).
- **401 Unauthorized** – brak lub niepoprawny JWT.
- **409 Conflict** – duplikat klucza głównego (`license_plate`) lub unikalnego (`vin`).
- **500 Internal Server Error** – nieprzewidziane błędy, np. problemy z połączeniem do DB.

## 8. Rozważania dotyczące wydajności
- Indeksy na `license_plate` (PK) i na unikalne `vin` zapewniają szybkie wyszukiwanie konfliktów.
- Operacja wstawienia jest pojedyncza, minimalny narzut.

## 9. Kroki implementacji
1. Utworzyć Zod schema `src/lib/validation/vehicleSchemas.ts` z regułami walidacji.
2. Zadeklarować i wyeksportować `VehicleCreateDto` i `VehicleDto` w `src/types.ts` (już istnieją).
3. Utworzyć service layer: `src/lib/services/vehicleService.ts` z funkcją `createVehicle(dto, userId)`.
4. Dodać endpoint w `src/pages/api/vehicles.ts` z `export const POST`:
   - Odczyt `req.json()`
   - Walidacja Zod
   - Wywołanie `vehicleService.createVehicle`
   - Obsługa wyjątków (409, 500)
5. Skonfigurować middleware w Astro (`src/middleware/index.ts`) do weryfikacji JWT i przekazywania `supabase` i `userId`.
6. Zaimplementować testy jednostkowe i integracyjne:
   - Walidacja Zod
   - Scenariusze sukcesu i błędów (409, 400, 401)
7. Dodać dokumentację do README.md 
