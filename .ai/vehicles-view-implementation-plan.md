# Plan implementacji widoku Pojazdy

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
  - **PaginationControls** – kontrolki nawigacji między stronami listy pojazdów.
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
  - Pole numeryczne dla roku produkcji (opcjonalne, 1900-2030)
  - Pole tekstowe dla typu pojazdu (opcjonalne)
  - Przyciski: Zapisz, Anuluj
- **Obsługiwane zdarzenia:** Walidacja pól w czasie rzeczywistym, submit formularza, nawigacja po anulowaniu.
- **Warunki walidacji:** 
  - Numer rejestracyjny: wymagane, 2-20 znaków, alfanumeryczne + spacje
  - VIN: opcjonalne, dokładnie 17 znaków jeśli podane
  - Marka: opcjonalne, max 50 znaków
  - Model: opcjonalne, max 50 znaków  
  - Rok produkcji: opcjonalne, liczba całkowita 1900-2030
  - Typ pojazdu: opcjonalne, max 200 znaków
- **Typy:** `VehicleCreateDto`, `VehicleUpdateDto`, `VehicleFormViewModel`.
- **Propsy:** Tryb formularza (`mode: 'create' | 'edit'`), dane pojazdu do edycji (`vehicle?: VehicleDto`).

### **PaginationControls**
- **Opis:** Wyświetla kontrolki paginacji, umożliwiając nawigację między stronami.
- **Główne elementy:** Przyciski "poprzednia" i "następna" oraz wskaźniki numerów stron.
- **Obsługiwane zdarzenia:** Przekazuje zdarzenie zmiany numeru strony do komponentu nadrzędnego.
- **Warunki walidacji:** Przyciski nawigacyjne są wyłączane, gdy osiągnięta zostanie pierwsza lub ostatnia strona.
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

Do implementacji widoku wykorzystywane będą istniejące typy DTO z `src/types.ts` oraz następujące dodatkowe typy ViewModel:

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

Komponenty widoku komunikują się z następującymi endpointami:

1. **Pobieranie listy pojazdów:**
   - **Endpoint:** `GET /api/vehicles`
   - **Parametry query:** `page`, `limit` (z typu `VehiclesQueryParams`)
   - **Typ odpowiedzi:** `VehiclesListResponseDto`
   - **Cel:** Pobranie paginowanej listy pojazdów dla zalogowanego użytkownika

2. **Tworzenie pojazdu:**
   - **Endpoint:** `POST /api/vehicles`
   - **Typ żądania:** `VehicleCreateDto`
   - **Typ odpowiedzi:** `VehicleDto`
   - **Cel:** Utworzenie nowego pojazdu

3. **Aktualizacja pojazdu** (endpoint do implementacji):
   - **Endpoint:** `PATCH /api/vehicles/[license_plate]`
   - **Typ żądania:** `VehicleUpdateDto`
   - **Typ odpowiedzi:** `VehicleDto`
   - **Cel:** Aktualizacja danych istniejącego pojazdu

4. **Usuwanie pojazdu** (endpoint do implementacji):
   - **Endpoint:** `DELETE /api/vehicles/[license_plate]`
   - **Typ odpowiedzi:** `204 No Content`
   - **Cel:** Usunięcie pojazdu z systemu

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
- **Rok produkcji:** Opcjonalne, liczba całkowita z zakresu 1900-2030
- **Typ pojazdu:** Opcjonalne, maksymalnie 200 znaków

### **Warunki paginacji:**
- Minimalna strona: 1
- Maksymalna liczba elementów na stronę: 100
- Domyślna liczba elementów na stronę: 20

## 10. Obsługa błędów

- **Błędy sieci/API:** Wyświetlenie komunikatu o błędzie z opcją ponowienia próby.
- **Błędy walidacji:** Wyświetlenie komunikatów błędów pod odpowiednimi polami formularza.
- **Konflikty (duplikaty):** Wyświetlenie specyficznego komunikatu o duplikacie numeru rejestracyjnego lub VIN.
- **Błędy autoryzacji:** Przekierowanie na stronę logowania.
- **Błędy podczas usuwania:** Wyświetlenie komunikatu błędu i zachowanie pojazdu na liście.
- **Brak danych:** Wyświetlenie przyjaznego komunikatu o braku pojazdów z zachętą do dodania pierwszego.

## 11. Kroki implementacji

1. **Utworzenie struktury stron** - pliki `.astro` dla `/vehicles`, `/vehicles/new`, `/vehicles/[license_plate]/edit`
2. **Implementacja custom hooków** - `useVehicles`, `useVehicleForm`, `useVehicleDelete` do obsługi logiki API
3. **Stworzenie komponentów bazowych** - `LoadingIndicator`, `ErrorNotification`, `EmptyStateMessage`
4. **Implementacja głównego komponentu** - `VehiclesView` z zarządzaniem stanem i orkiestracją
5. **Stworzenie komponentu akcji** - `VehiclesActionPanel` z przyciskami głównych akcji
6. **Implementacja listy pojazdów** - `VehiclesList` i `VehicleListItem` z responsywnym wyświetlaniem
7. **Stworzenie kontrolek paginacji** - `PaginationControls` do nawigacji między stronami
8. **Implementacja dialogu usuwania** - `DeleteConfirmationDialog` z potwierdzeniem akcji
9. **Stworzenie formularza pojazdu** - `VehicleForm` z walidacją inline i obsługą błędów
10. **Implementacja brakujących endpointów** - PATCH i DELETE dla `/api/vehicles/[license_plate]`
11. **Integracja wszystkich komponentów** - złożenie w głównym widoku z przekazywaniem danych i callbacków
12. **Testowanie interakcji** - sprawdzenie wszystkich scenariuszy użytkownika i obsługi błędów
13. **Dostrojenie responsywności** - optymalizacja wyświetlania na różnych urządzeniach  
14. **Finalny przegląd** - refaktoryzacja kodu i poprawa dostępności przed wdrożeniem
