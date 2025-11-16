# Plan implementacji widoku Pojazdy

> **Uwaga:** Ten plan uwzględnia unifikację paginacji w całym projekcie zgodnie z wymaganiami z `vehicles-implementation-tasks.md`. Implementacja musi zachować spójność z istniejącymi komponentami reservations i wprowadzić wspólne schematy walidacji.

## 1. Przegląd

Widok `/vehicles` ma na celu umożliwienie użytkownikom zarządzania swoimi pojazdami poprzez pełną funkcjonalność CRUD (Create, Read, Update, Delete). Wyświetla listę pojazdów użytkownika w responsywnym interfejsie (tabela na desktopie, karty na mobile) wraz z możliwością dodawania, edytowania i usuwania pojazdów. Pojazdy dodane przez użytkownika są automatycznie dostępne do wyboru podczas tworzenia rezerwacji w systemie.

## 2. Routing widoku

- **Ścieżka główna:** `/vehicles` - lista pojazdów
- **Ścieżka dodawania:** `/vehicles/new` - formularz nowego pojazdu  
- **Ścieżka edycji:** `/vehicles/[license_plate]/edit` - formularz edycji pojazdu
- **Pliki stron:** 
  - `src/pages/vehicles.astro`
  - `src/pages/vehicles/new.astro`
  - `src/pages/vehicles/[license_plate]/edit.astro`

## 3. Struktura komponentów

- **VehiclesView** – główny komponent widoku listy, zarządzający stanem i kompozycją podkomponentów.
  - **VehiclesActionPanel** – panel zawierający przyciski głównych akcji (dodaj pojazd).
  - **VehiclesList** – komponent wyświetlający listę pojazdów, dostosowujący się do rozmiaru ekranu.
    - **VehicleListItem** – pojedynczy element listy reprezentujący jeden pojazd z opcjami edycji i usuwania.
  - **PaginationControls** – kontrolki nawigacji między stronami listy pojazdów (komponent współdzielony z `src/components/shared/`).
  - **LoadingIndicator** – wskaźnik ładowania (skeleton), wyświetlany podczas oczekiwania na odpowiedź z API.
  - **EmptyStateMessage** – komponent wyświetlany, gdy lista pojazdów jest pusta.
  - **ErrorNotification** – komponent do wyświetlania komunikatów o błędach.
  - **DeleteConfirmationDialog** – dialog potwierdzenia usunięcia pojazdu.
- **VehicleForm** – komponent formularza do dodawania i edycji pojazdów (używany na osobnych stronach).

## 4. Szczegóły komponentów

### **VehiclesView**
- **Opis:** Główny kontener widoku, odpowiedzialny za orkiestrację pobierania danych, zarządzanie stanem (paginacja, status ładowania) oraz przekazywanie danych do komponentów podrzędnych.
- **Główne elementy:** Renderuje panel akcji, listę pojazdów, kontrolki paginacji oraz modale i komunikaty błędów.
- **Obsługiwane zdarzenia:**
  - Obsługa zmiany strony w paginacji
  - Inicjowanie usuwania pojazdu (otwieranie dialogu potwierdzenia)
  - Potwierdzanie usunięcia pojazdu
- **Warunki walidacji:** Brak; komponent deleguje walidację do komponentów podrzędnych.
- **Typy:** `VehicleDto`, `VehiclesListResponseDto`, `PaginationDto`, `VehicleViewModel`.
- **Propsy:** Brak (komponent główny).

### **VehiclesActionPanel**
- **Opis:** Panel zawierający przyciski głównych akcji dostępnych dla użytkownika.
- **Główne elementy:**
  - Przycisk "Dodaj pojazd" nawigujący do `/vehicles/new`
  - Opcjonalnie: przycisk odświeżania listy
- **Obsługiwane zdarzenia:** Nawigacja do formularza dodawania pojazdu.
- **Warunki walidacji:** Brak.
- **Typy:** Brak specjalnych typów.
- **Propsy:** Brak.

### **VehiclesList**
- **Opis:** Komponent prezentacyjny, który renderuje listę pojazdów w sposób responsywny.
- **Główne elementy:**
  - Widok tabelaryczny z kolumnami (numer rejestracyjny, marka, model, rok, VIN, akcje)
  - Widok kart na urządzeniach mobilnych, gdzie każda karta reprezentuje jeden pojazd
  - Każdy element listy zawiera akcje edycji i usuwania
- **Obsługiwane zdarzenia:** Przekazywanie zdarzeń edycji i usuwania do komponentu nadrzędnego.
- **Warunki walidacji:** Brak.
- **Typy:** `VehicleViewModel`.
- **Propsy:** Lista pojazdów do wyświetlenia (`VehicleViewModel[]`), funkcje zwrotne dla akcji edycji i usuwania.

### **VehicleListItem**
- **Opis:** Pojedynczy element listy pojazdów z informacjami o pojeździe i dostępnymi akcjami.
- **Główne elementy:**
  - Wyświetlanie danych pojazdu (numer rejestracyjny, marka, model, rok)
  - Przyciski akcji: edytuj, usuń
  - Sformatowane wyświetlanie nazwy pojazdu
- **Obsługiwane zdarzenia:** Przekazywanie zdarzeń edycji i usuwania do komponentu nadrzędnego.
- **Warunki walidacji:** Brak.
- **Typy:** `VehicleViewModel`.
- **Propsy:** Dane pojazdu (`VehicleViewModel`), funkcje zwrotne dla akcji (`onEdit`, `onDelete`).

### **VehicleForm**
- **Opis:** Formularz do dodawania i edycji pojazdów z walidacją inline i obsługą błędów.
- **Główne elementy:**
  - Pole tekstowe dla numeru rejestracyjnego (wymagane)
  - Pole tekstowe dla numeru VIN (opcjonalne, 17 znaków)  
  - Pole tekstowe dla marki (opcjonalne)
  - Pole tekstowe dla modelu (opcjonalne)
  - Pole numeryczne dla roku produkcji (opcjonalne, 1900-2050)
  - Pole tekstowe dla typu pojazdu (opcjonalne)
  - Przyciski: Zapisz, Anuluj
- **Obsługiwane zdarzenia:** Walidacja pól w czasie rzeczywistym, submit formularza, nawigacja po anulowaniu.
- **Warunki walidacji:** 
  - Numer rejestracyjny: wymagane, 2-20 znaków, alfanumeryczne + spacje
  - VIN: opcjonalne, dokładnie 17 znaków jeśli podane
  - Marka: opcjonalne, max 50 znaków
  - Model: opcjonalne, max 50 znaków  
  - Rok produkcji: opcjonalne, liczba całkowita 1900-2050
  - Typ pojazdu: opcjonalne, max 200 znaków
- **Typy:** `VehicleCreateDto`, `VehicleUpdateDto`, `VehicleFormViewModel`.
- **Propsy:** Tryb formularza (`mode: 'create' | 'edit'`), dane pojazdu do edycji (`vehicle?: VehicleDto`).

### **PaginationControls**
- **Opis:** Wyświetla kontrolki paginacji, umożliwiając nawigację między stronami. Komponent współdzielony między widokami vehicles i reservations (lokalizacja: `src/components/shared/PaginationControls.tsx`).
- **Główne elementy:** Przyciski "poprzednia" i "następna" oraz wskaźniki numerów stron.
- **Obsługiwane zdarzenia:** Przekazuje zdarzenie zmiany numeru strony do komponentu nadrzędnego.
- **Warunki walidacji:** Przyciski nawigacyjne są wyłączane, gdy osiągnięta zostanie pierwsza lub ostatnia strona. Współpracuje z ujednoliconym `paginationQuerySchema`.
- **Typy:** `PaginationDto`.
- **Propsy:** Obiekt z danymi o paginacji (`PaginationDto`), funkcja zwrotna informująca o zmianie strony.

### **DeleteConfirmationDialog**
- **Opis:** Modal potwierdzenia usunięcia pojazdu z informacjami o konsekwencjach.
- **Główne elementy:** Tytuł, komunikat ostrzegawczy, przyciski potwierdzenia i anulowania.
- **Obsługiwane zdarzenia:** Potwierdzenie lub anulowanie usunięcia.
- **Warunki walidacji:** Brak.
- **Typy:** `VehicleDto`.
- **Propsy:** Flaga otwartego stanu (`isOpen`), dane pojazdu do usunięcia (`vehicle`), funkcje zwrotne (`onConfirm`, `onCancel`).

## 5. Typy i modele danych

Do implementacji widoku wykorzystywane będą istniejące typy DTO z `src/types.ts`, wspólne schematy walidacji z `src/lib/validation/commonSchemas.ts` oraz następujące dodatkowe typy ViewModel:

### **Wspólne schematy walidacji** (wymagana unifikacja w projekcie):
```typescript
// src/lib/validation/commonSchemas.ts
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const licensePlateParamSchema = z.string()
  .min(2).max(20)
  .regex(/^[A-Za-z0-9\s]+$/)
  .transform(val => decodeURIComponent(val).trim());
```

### **Schematy specyficzne dla pojazdów**:
```typescript
// src/lib/validation/vehicleSchemas.ts (aktualizacja)
export const vehiclesQuerySchema = paginationQuerySchema;

export const vehiclePathParamsSchema = z.object({
  license_plate: licensePlateParamSchema
});

export const vehicleUpdateSchema = z.object({
  vin: z.string().length(17).optional(),
  brand: z.string().max(50).optional(),
  model: z.string().max(50).optional(),
  production_year: z.number().int().min(1900).max(2050).optional(),
  car_type: z.string().max(200).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});
```

- **`VehicleViewModel`**: Reprezentuje pojedynczy pojazd z danymi przygotowanymi do wyświetlenia w UI. Będzie mapowany z `VehicleDto`.
  ```typescript
  interface VehicleViewModel {
    license_plate: string;
    brand: string | null;
    model: string | null;
    production_year: number | null;
    vin: string | null;
    car_type: string | null;
    displayName: string; // "Marka Model (Rok)" lub license_plate jeśli brak danych
    editUrl: string; // `/vehicles/${license_plate}/edit`
    created_at: string; // sformatowana data dodania
  }
  ```

- **`VehicleFormViewModel`**: Reprezentuje stan formularza pojazdu z walidacją.
  ```typescript
  interface VehicleFormViewModel {
    license_plate: string;
    brand: string;
    model: string;
    production_year: string;
    vin: string;
    car_type: string;
    errors: Record<string, string>; // klucz: nazwa pola, wartość: komunikat błędu
    isSubmitting: boolean;
    isDirty: boolean; // czy formularz został zmodyfikowany
  }
  ```

## 6. Zarządzanie stanem

Stan widoku będzie zarządzany za pomocą hooków React (`useState`, `useEffect`) oraz dedykowanych custom hooków. Kluczowe stany:

- Lista pojazdów (`VehicleDto[]`)
- Aktualna strona paginacji (`number`)  
- Stan ładowania (`isLoading`) dla wywołań API
- Stan błędów (`errorMessage`) dla komunikatów o błędach
- Stan modalu usuwania (`deleteDialogOpen`, `vehicleToDelete`)

**Custom hooki:**
- **`useVehicles()`** - obsługa logiki pobierania listy pojazdów, paginacji i zarządzania stanami ładowania/błędów
- **`useVehicleForm(initialData?: VehicleDto)`** - obsługa logiki formularza, walidacji i submit
- **`useVehicleDelete()`** - obsługa logiki usuwania pojazdu z optimistic updates

## 7. Integracja z API

**Uwaga:** API dla zarządzania pojazdami jest już w pełni zaimplementowane i dostępne. Komponenty widoku komunikują się z następującymi endpointami (z unifikowaną walidacją paginacji):

1. **Pobieranie listy pojazdów:**
   - **Endpoint:** `GET /api/vehicles`
   - **Parametry query:** Walidowane przez `paginationQuerySchema` (page: min 1 default 1, limit: min 1 max 100 default 20)
   - **Typ odpowiedzi:** `VehiclesListResponseDto`
   - **Cel:** Pobranie paginowanej listy pojazdów dla zalogowanego użytkownika

2. **Tworzenie pojazdu:**
   - **Endpoint:** `POST /api/vehicles`
   - **Typ żądania:** `VehicleCreateDto` (walidowany przez `vehicleCreateSchema`)
   - **Typ odpowiedzi:** `VehicleDto`
   - **Kody statusu:** 201 Created, 400 Bad Request, 401 Unauthorized, 409 Conflict
   - **Cel:** Utworzenie nowego pojazdu

3. **Pobieranie szczegółów pojazdu** (nowy endpoint):
   - **Endpoint:** `GET /api/vehicles/[license_plate]`
   - **Parametry ścieżki:** Walidowane przez `licensePlateParamSchema`
   - **Typ odpowiedzi:** `VehicleDto`
   - **Kody statusu:** 200 OK, 401 Unauthorized, 403 Forbidden, 404 Not Found
   - **Cel:** Pobranie szczegółów pojazdu do edycji

4. **Aktualizacja pojazdu** (nowy endpoint):
   - **Endpoint:** `PATCH /api/vehicles/[license_plate]`
   - **Parametry ścieżki:** Walidowane przez `licensePlateParamSchema`
   - **Typ żądania:** `VehicleUpdateDto` (walidowany przez `vehicleUpdateSchema`)
   - **Typ odpowiedzi:** `VehicleDto`
   - **Kody statusu:** 200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict
   - **Cel:** Aktualizacja danych istniejącego pojazdu

5. **Usuwanie pojazdu** (nowy endpoint):
   - **Endpoint:** `DELETE /api/vehicles/[license_plate]`
   - **Parametry ścieżki:** Walidowane przez `licensePlateParamSchema`
   - **Typ odpowiedzi:** `204 No Content`
   - **Kody statusu:** 204 No Content, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict (aktywne rezerwacje)
   - **Cel:** Usunięcie pojazdu z systemu (tylko jeśli brak aktywnych rezerwacji)

## 8. Interakcje użytkownika

- **Ładowanie widoku:** Użytkownik widzi wskaźnik ładowania podczas pobierania danych z API.
- **Przeglądanie listy:** Lista pojazdów wyświetlana responsywnie (tabela na desktop, karty na mobile).
- **Dodawanie pojazdu:** Kliknięcie "Dodaj pojazd" przenosi do formularza na `/vehicles/new`.
- **Edycja pojazdu:** Kliknięcie "Edytuj" przenosi do formularza na `/vehicles/[license_plate]/edit`.
- **Usuwanie pojazdu:** Kliknięcie "Usuń" otwiera dialog potwierdzenia, po potwierdzeniu pojazd jest usuwany.
- **Zmiana strony:** Kliknięcie na numer strony w paginacji wyświetla odpowiedni podzbiór danych.
- **Stan pusty:** Jeśli użytkownik nie ma pojazdów, widoczny jest komunikat oraz przycisk "Dodaj pierwszy pojazd".

## 9. Warunki i walidacja

### **Warunki dostępu:**
- Użytkownik musi być zalogowany (sprawdzane przez middleware Astro)
- Brak autoryzacji skutkuje przekierowaniem na stronę logowania

### **Walidacja formularza pojazdu:**
- **Numer rejestracyjny:** 
  - Wymagane pole
  - Długość 2-20 znaków
  - Dozwolone znaki alfanumeryczne i spacje
  - Musi być unikalne w systemie
- **VIN:**
  - Pole opcjonalne
  - Jeśli podane, musi mieć dokładnie 17 znaków
  - Musi być unikalne w systemie jeśli podane
- **Marka:** Opcjonalne, maksymalnie 50 znaków
- **Model:** Opcjonalne, maksymalnie 50 znaków  
- **Rok produkcji:** Opcjonalne, liczba całkowita z zakresu 1900-2050
- **Typ pojazdu:** Opcjonalne, maksymalnie 200 znaków

### **Warunki paginacji:** (ujednolicone w całym projekcie)
- Strona (page): minimalna 1, domyślna 1
- Limit elementów (limit): minimalny 1, maksymalny 100, domyślny 20
- Walidowane przez wspólny `paginationQuerySchema` z `commonSchemas.ts`

## 10. Obsługa błędów

Standardowe kody odpowiedzi i ich obsługa w interfejsie:

- **200 OK** (GET, PATCH) - Pomyślne operacje, wyświetlenie danych
- **201 Created** (POST) - Pomyślne utworzenie, przekierowanie i komunikat sukcesu
- **204 No Content** (DELETE) - Pomyślne usunięcie, aktualizacja listy i komunikat sukcesu
- **400 Bad Request** - Błędy walidacji, wyświetlenie komunikatów pod polami formularza
- **401 Unauthorized** - Brak lub nieprawidłowa autoryzacja, przekierowanie na stronę logowania
- **403 Forbidden** - Próba dostępu do cudzego pojazdu, komunikat o braku uprawnień
- **404 Not Found** - Pojazd nie istnieje, komunikat błędu i powrót do listy
- **409 Conflict** - Duplikat numeru rejestracyjnego/VIN lub aktywne rezerwacje przy usuwaniu
- **500 Internal Server Error** - Nieoczekiwane błędy serwera, ogólny komunikat błędu z opcją ponowienia

### **Specjalne przypadki:**
- **Błędy sieci:** Komunikat o problemach połączenia z opcją ponowienia próby
- **Brak danych:** Przyjazny komunikat o braku pojazdów z zachętą do dodania pierwszego
- **Aktywne rezerwacje:** Informacja o niemożności usunięcia pojazdu z aktywnymi rezerwacjami

## 11. Kroki implementacji

### **Faza 1: Unifikacja i refaktoryzacja (PRIORYTET WYSOKI)**
1. **Utworzenie wspólnych schematów walidacji** - `src/lib/validation/commonSchemas.ts` z `paginationQuerySchema` i `licensePlateParamSchema`
2. **Aktualizacja istniejących schematów** - zastąpienie duplikowanych walidacji w `reservationSchema.ts` i `reservationAvailabilitySchema.ts`
3. **Przeniesienie PaginationControls** - z `src/components/reservations/` do `src/components/shared/` dla reużywalności
4. **Aktualizacja importów** - poprawienie ścieżek w `ReservationsView.tsx` i innych komponentach

### **Faza 2: Unifikacja schematów walidacji**
5. **Aktualizacja schematów vehicles** - dodanie brakujących schematów `vehicleUpdateSchema`, `vehiclesQuerySchema`, `vehiclePathParamsSchema` jeśli jeszcze nie istnieją
6. **Sprawdzenie VehicleService** - weryfikacja kompletności metod API (getVehicles, getVehicleByLicensePlate, updateVehicle, deleteVehicle, hasActiveReservations)

### **Faza 3: Komponenty frontendowe**
7. **Utworzenie struktury stron** - pliki `.astro` dla `/vehicles`, `/vehicles/new`, `/vehicles/[license_plate]/edit`
8. **Implementacja custom hooków** - `useVehicles`, `useVehicleForm`, `useVehicleDelete` z ujednoliconą walidacją
9. **Stworzenie komponentów bazowych** - `LoadingIndicator`, `ErrorNotification`, `EmptyStateMessage` (jeśli nie istnieją)
10. **Implementacja głównego komponentu** - `VehiclesView` z zarządzaniem stanem i orkiestracją

### **Faza 4: Komponenty szczegółowe**
11. **Stworzenie komponentu akcji** - `VehiclesActionPanel` z przyciskami głównych akcji
12. **Implementacja listy pojazdów** - `VehiclesList` i `VehicleListItem` z responsywnym wyświetlaniem
13. **Implementacja dialogu usuwania** - `DeleteConfirmationDialog` z potwierdzeniem akcji i obsługą aktywnych rezerwacji
14. **Stworzenie formularza pojazdu** - `VehicleForm` z walidacją inline i obsługą wszystkich kodów błędów

### **Faza 5: Integracja i testy**
15. **Integracja wszystkich komponentów** - złożenie w głównym widoku z przekazywaniem danych i callbacków
16. **Testowanie API** - sprawdzenie wszystkich endpointów z różnymi scenariuszami błędów (401, 403, 404, 409, 500)
17. **Testowanie interakcji** - sprawdzenie wszystkich scenariuszy użytkownika i obsługi stanów brzegowych
18. **Dostrojenie responsywności** - optymalizacja wyświetlania na różnych urządzeniach

### **Faza 6: Finalizacja**
19. **Testowanie unifikacji paginacji** - upewnienie się, że wszystkie endpointy używają tych samych standardów
20. **Finalny przegląd** - refaktoryzacja kodu, poprawa dostępności i dokumentacji przed wdrożeniem

### **Kryteria akceptacji dla unifikacji:**
- [ ] Wszystkie endpointy mają spójną paginację (max 100, default 20)
- [ ] PaginationControls jest reużywalny między vehicles i reservations  
- [ ] Brak duplikacji kodu walidacji paginacji
- [ ] VehicleService obsługuje wszystkie operacje CRUD
- [ ] API endpoints zwracają standardowe kody statusu

## 12. Dodatkowe wymagania unifikacji paginacji

### **Zmiany w pozostałych widokach aplikacji:**

#### **Aktualizacje w widoku Reservations:**
- **Plik:** `src/lib/validation/reservationSchema.ts`
  - Zastąpić `getReservationsQuerySchema` importem z `commonSchemas.paginationQuerySchema`
  - Usunąć duplikowaną definicję walidacji paginacji

#### **Aktualizacje w widoku Available Reservations:**
- **Plik:** `src/lib/validation/reservationAvailabilitySchema.ts`
  - Zmienić maksymalny limit z 200 na 100
  - Zmienić domyślny limit z 32 na 20
  - Zastąpić lokalną walidację importem z `commonSchemas.paginationQuerySchema`

#### **Aktualizacje komponentu PaginationControls:**
- **Lokalizacja:** Przenieść z `src/components/reservations/PaginationControls.tsx` do `src/components/shared/PaginationControls.tsx`
- **Testy:** Przenieść `PaginationControls.test.tsx` do odpowiedniej lokalizacji
- **Importy:** Zaktualizować ścieżki importu w:
  - `src/components/reservations/ReservationsView.tsx`
  - `src/components/reservations/available/ReservationsAvailableView.tsx` (jeśli używa)
  - Przyszłych komponentach vehicles

### **Nowe wspólne schematy walidacji:**
```typescript
// src/lib/validation/commonSchemas.ts
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

Taka unifikacja zapewni spójność paginacji w całej aplikacji i wyeliminuje duplikację kodu walidacji.
