# Zadania dla Agenta Implementującego - Vehicles API

## 🎯 Cel
Implementacja kompletnego API dla zarządzania pojazdami zgodnie z planem w `.ai/vehicles-implementation-plan.md` z zachowaniem spójności paginacji i reużywalnością komponentów.

## 📋 Niezbędne Zadania

### 1. PRIORYTET WYSOKI: Unifikacja Walidacji Paginacji

**Problem**: Niespójne wymagania paginacji między endpointami
- GET /reservations: limit max 100, default 20 ✅
- GET /reservations/available: limit max 200, default 32 ❌
- Nowe wymagania: page min 1 default 1, limit min 1 max 100 default 20

**Zadanie**: Utworzyć wspólne schematy walidacji
```typescript
// Utworzyć: src/lib/validation/commonSchemas.ts
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const licensePlateParamSchema = z.string()
  .min(2).max(20)
  .regex(/^[A-Za-z0-9\s]+$/)
  .transform(val => decodeURIComponent(val).trim());

export const uuidParamSchema = z.string().uuid();
```

**Aktualizować pliki**:
- `src/lib/validation/reservationSchema.ts` - zastąpić getReservationsQuerySchema
- `src/lib/validation/reservationAvailabilitySchema.ts` - zmienić limit z 200 na 100, default z 32 na 20
- `src/lib/validation/vehicleSchemas.ts` - dodać brakujące schematy

### 2. PRIORYTET WYSOKI: Przeniesienie PaginationControls

**Problem**: Komponent jest w folderze reservations, ale będzie używany przez vehicles

**Zadanie**: Przenieść komponent dla reużywalności
```bash
# Przenieś z:
src/components/reservations/PaginationControls.tsx
src/components/reservations/PaginationControls.test.tsx

# Do:
src/components/shared/PaginationControls.tsx
src/components/shared/PaginationControls.test.tsx
```

**Aktualizować importy w**:
- `src/components/reservations/ReservationsView.tsx`
- Przyszłe komponenty vehicles

### 3. PRIORYTET ŚREDNI: Rozszerzenie VehicleService

**Obecny stan**: VehicleService ma tylko `createVehicle()` i `vehicleExists()`

**Dodać metody**:
```typescript
// W src/lib/services/vehicleService.ts
class VehicleService {
  async getVehicles(userId: string, params: VehiclesQueryParams): Promise<VehiclesListResponseDto>
  async getVehicleByLicensePlate(licensePlate: string, userId: string): Promise<VehicleDto | null>
  async updateVehicle(licensePlate: string, userId: string, updateData: VehicleUpdateDto): Promise<VehicleDto>
  async deleteVehicle(licensePlate: string, userId: string): Promise<void>
  async hasActiveReservations(licensePlate: string): Promise<boolean>
}
```

### 4. PRIORYTET ŚREDNI: Rozszerzenie API Endpoints

**Obecny stan**: `src/pages/api/vehicles.ts` ma tylko GET (mock) i POST

**Zadania**:
1. **Poprawić GET /vehicles**:
   - Zastąpić mock danymi z bazy
   - Dodać walidację query params (paginationQuerySchema)
   - Implementować paginację

2. **Utworzyć src/pages/api/vehicles/[license_plate].ts**:
   ```typescript
   export const GET: APIRoute = // szczegóły pojazdu
   export const PATCH: APIRoute = // aktualizacja pojazdu
   export const DELETE: APIRoute = // usunięcie pojazdu
   export const prerender = false;
   ```


### 6. PRIORYTET NISKI: Frontend Components

**Zadanie**: Utworzyć komponenty React dla zarządzania pojazdami
```
src/components/vehicles/
├── VehiclesView.tsx          // Główny widok listy
├── VehiclesList.tsx          // Lista pojazdów
├── VehicleListItem.tsx       // Element listy
├── VehicleForm.tsx           // Formularz dodawania/edycji
├── VehicleFilterPanel.tsx    // Panel filtrów
└── hooks/
    └── useVehicles.ts        // Hook do zarządzania stanem
```

## 🔧 Szczegóły Techniczne

### Walidacja Schematów
```typescript
// vehicleSchemas.ts - dodać:
export const vehicleUpdateSchema = z.object({
  vin: z.string().length(17).optional(),
  brand: z.string().max(50).optional(),
  model: z.string().max(50).optional(),
  production_year: z.number().int().min(1900).max(2030).optional(),
  car_type: z.string().max(200).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

export const vehiclesQuerySchema = paginationQuerySchema;
export const vehiclePathParamsSchema = z.object({
  license_plate: licensePlateParamSchema
});
```

### Obsługa Błędów
```typescript
// Standardowe kody odpowiedzi:
// 200 - OK (GET, PATCH)
// 201 - Created (POST)
// 204 - No Content (DELETE)
// 400 - Bad Request (walidacja)
// 401 - Unauthorized (brak JWT)
// 403 - Forbidden (nie własny pojazd)
// 404 - Not Found (pojazd nie istnieje)
// 409 - Conflict (duplikat, aktywne rezerwacje)
// 500 - Internal Server Error
```

### Bezpieczeństwo
- **RLS**: Supabase automatycznie filtruje po user_id
- **Walidacja**: Wszystkie inputy przez Zod schemas
- **Authorization**: Sprawdzenie własności pojazdu w każdym endpoincie
- **SQL Injection**: Query builder Supabase (bezpieczny)

## 📝 Kolejność Implementacji

1. **Krok 1**: Unifikacja walidacji (commonSchemas.ts)
2. **Krok 2**: Przeniesienie PaginationControls
3. **Krok 3**: Rozszerzenie VehicleService
4. **Krok 4**: Implementacja API endpoints
5. **Krok 5**: Middleware auth (opcjonalnie)
6. **Krok 6**: Frontend components (opcjonalnie)

## ✅ Kryteria Akceptacji

- [ ] Wszystkie endpointy mają spójną paginację (max 100, default 20)
- [ ] PaginationControls jest reużywalny między vehicles i reservations
- [ ] VehicleService obsługuje wszystkie operacje CRUD
- [ ] API endpoints zwracają poprawne kody statusu
- [ ] Walidacja działa zgodnie ze specyfikacją
- [ ] Testy jednostkowe przechodzą
- [ ] Brak duplikacji kodu walidacji

## 🚨 Uwagi dla Agenta

1. **Zachowaj istniejącą funkcjonalność** - nie psuj działających endpointów reservations
2. **Testuj każdą zmianę** - uruchom testy po każdym kroku
3. **Używaj TypeScript** - wszystkie nowe pliki muszą być w TS
4. **Następuj konwencje** - zachowaj istniejący styl kodu
5. **Dokumentuj zmiany** - aktualizuj komentarze i typy
