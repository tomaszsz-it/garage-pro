# API Endpoint: POST /vehicles

## Opis
Endpoint umożliwia tworzenie nowego pojazdu w systemie Garage Pro. Pojazd jest automatycznie przypisywany do domyślnego użytkownika (na potrzeby developmentu).

## Szczegóły endpointa

- **URL**: `/api/vehicles`
- **Metoda**: `POST`
- **Content-Type**: `application/json`
- **Uwierzytelnianie**: Brak (na tym etapie developmentu)

## Struktura żądania

### Wymagane pola
- `license_plate` (string) - Numer rejestracyjny pojazdu

### Opcjonalne pola
- `vin` (string) - Numer VIN pojazdu (dokładnie 17 znaków)
- `brand` (string) - Marka pojazdu (max 50 znaków)
- `model` (string) - Model pojazdu (max 50 znaków)
- `production_year` (number) - Rok produkcji (1980-2080)
- `car_type` (string) - Typ/kategoria pojazdu (max 200 znaków)

### Reguły walidacji
- `license_plate`: 2-20 znaków, tylko litery, cyfry i spacje
- `vin`: dokładnie 17 znaków, format VIN
- `brand`, `model`: maksymalnie 50 znaków
- `production_year`: liczba całkowita między 1980 a 2080
- `car_type`: maksymalnie 200 znaków

## Przykłady użycia

### 1. Sukces - Utworzenie pojazdu (201 Created)

**Żądanie:**
```bash
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -d '{
    "license_plate": "WAW1234",
    "vin": "1FUJA6CK14LM94383",
    "brand": "Volkswagen",
    "model": "Passat",
    "production_year": 2020,
    "car_type": "Sedan B8"
  }'
```

**Odpowiedź:**
```json
{
  "license_plate": "WAW1234",
  "vin": "1FUJA6CK14LM94383",
  "brand": "Volkswagen",
  "model": "Passat",
  "production_year": 2020,
  "car_type": "Sedan B8"
}
```

### 2. Minimalne żądanie - Tylko wymagane pole

**Żądanie:**
```bash
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -d '{
    "license_plate": "KR5678"
  }'
```

**Odpowiedź:**
```json
{
  "license_plate": "KR5678",
  "vin": null,
  "brand": null,
  "model": null,
  "production_year": null,
  "car_type": null,
  "created_at": "2025-10-18T15:30:12.123456+00:00"
}
```

## Kody odpowiedzi i błędy

### 201 Created
Pojazd został pomyślnie utworzony. Zwraca dane utworzonego pojazdu.

### 400 Bad Request - Błędy walidacji

**Żądanie z błędami:**
```bash
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -d '{
    "license_plate": "X",
    "vin": "SHORT",
    "production_year": 1800
  }'
```

**Odpowiedź:**
```json
{
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    {
      "field": "license_plate",
      "message": "License plate must be at least 2 characters long"
    },
    {
      "field": "vin",
      "message": "VIN must be exactly 17 characters long"
    },
    {
      "field": "vin",
      "message": "VIN contains invalid characters"
    },
    {
      "field": "production_year",
      "message": "Production year cannot be earlier than 1980"
    }
  ]
}
```

### 400 Bad Request - Nieprawidłowy JSON

**Żądanie:**
```bash
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -d '{"license_plate": "TEST", invalid json}'
```

**Odpowiedź:**
```json
{
  "error": "Bad Request",
  "message": "Invalid JSON in request body"
}
```

### 409 Conflict - Duplikat

**Żądanie z istniejącym numerem rejestracyjnym:**
```bash
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -d '{
    "license_plate": "WAW1234"
  }'
```

**Odpowiedź:**
```json
{
  "error": "Conflict",
  "message": "Vehicle with these details already exists"
}
```

### 500 Internal Server Error
Nieoczekiwany błąd serwera.

**Odpowiedź:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Uruchomienie serwera

Aby uruchomić serwer deweloperski z wymaganymi zmiennymi środowiskowymi:

```bash
npm run dev
```

Serwer będzie dostępny pod adresem: `http://localhost:3000`

## Uwagi techniczne

- Endpoint używa `DEFAULT_USER_ID` do przypisania pojazdu do użytkownika
- RLS (Row Level Security) jest tymczasowo wyłączony dla tabeli `vehicles`
- Walidacja odbywa się za pomocą biblioteki Zod
- Wszystkie pola tekstowe są automatycznie przycinane (trim)
- Endpoint obsługuje duplikaty zarówno dla `license_plate` jak i `vin`

## Status implementacji

✅ **Gotowy do użycia** - Endpoint jest w pełni funkcjonalny i przetestowany.

Następne kroki:
- Implementacja pełnej autentykacji użytkowników
- Ponowne włączenie RLS po wdrożeniu autentykacji
- Dodanie endpointów GET, PUT, DELETE dla pojazdów
