# Plan implementacji widoku pojedynczej rezerwacji

## 1. Przegląd

Widok pojedynczej rezerwacji umożliwia użytkownikowi przeglądanie szczegółowych informacji o rezerwacji oraz wykonywanie podstawowych operacji zarządzania: edycji danych rezerwacji (pojazd, usługa/termin) oraz anulowania. Widok jest dostępny pod ścieżką `/reservations/{id}` i stanowi centralny punkt zarządzania pojedynczymi rezerwacjami w systemie.

## 2. Routing widoku

Widok pojedynczej rezerwacji będzie dostępny pod dynamiczną ścieżką `/reservations/[id]`, gdzie `id` to UUID rezerwacji. Strona zostanie utworzona jako `src/pages/reservations/[id].astro` z odpowiednim komponentem React obsługującym logikę biznesową.

## 3. Struktura komponentów

```
ReservationDetailPage (Astro)
├── Layout (Astro)
└── ReservationDetailView (React)
    ├── ReservationInfoCard
    ├── ReservationActionsPanel
    │   ├── EditReservationDialog
    │   │   ├── VehicleSelector
    │   │   ├── ServiceSelector
    │   │   └── DateTimeSelector
    │   └── CancelReservationDialog
    └── RecommendationDisplay
```

## 4. Szczegóły komponentów

### ReservationDetailView

- **Opis komponentu:** Główny komponent widoku szczegółów rezerwacji, zarządza stanem danych rezerwacji i obsługuje wszystkie interakcje użytkownika.

- **Główne elementy:**
  - Karta informacyjna z danymi rezerwacji
  - Panel akcji (edycja, anulowanie)
  - Sekcja rekomendacji konserwacyjnych
  - Obsługa stanów ładowania i błędów

- **Obsługiwane interakcje:**
  - Pobieranie danych rezerwacji przy montowaniu komponentu
  - Otwieranie dialogów edycji i anulowania
  - Aktualizacja danych po pomyślnej edycji/anulowaniu
  - Przekierowanie po anulowaniu lub błędach

- **Warunki walidacji:**
  - ID rezerwacji musi być prawidłowym UUID
  - Rezerwacja musi istnieć i należeć do użytkownika
  - Edycja możliwa tylko dla przyszłych rezerwacji
  - Anulowanie wymaga potwierdzenia

- **Typy:**
  - `ReservationDetailDto` - dane rezerwacji z API
  - `ReservationUpdateDto` - dane do aktualizacji
  - `ReservationDetailViewModel` - rozszerzony model z polami UI

- **Propsy:**
  - `reservationId: string` - ID rezerwacji z URL

### ReservationInfoCard

- **Opis komponentu:** Wyświetla podstawowe informacje o rezerwacji w czytelnej formie.

- **Główne elementy:**
  - Termin rezerwacji (data i godzina)
  - Informacje o usłudze i mechaniku
  - Dane pojazdu
  - Status rezerwacji z odpowiednim kolorem

- **Obsługiwane interakcje:** Brak bezpośrednich interakcji

- **Warunki walidacji:** Wszystkie wymagane pola muszą być obecne

- **Typy:** `ReservationDetailViewModel`

- **Propsy:** `reservation: ReservationDetailViewModel`

### ReservationActionsPanel

- **Opis komponentu:** Panel przycisków akcji dla zarządzania rezerwacją.

- **Główne elementy:**
  - Przycisk "Edytuj rezerwację"
  - Przycisk "Anuluj rezerwację"
  - Przycisk "Powrót do listy"

- **Obsługiwane interakcje:**
  - Otwieranie dialogów edycji/anulowania
  - Obsługa odpowiedzi użytkownika

- **Warunki walidacji:**
  - Przyciski edycji niedostępne dla przeszłych rezerwacji
  - Przyciski anulowania niedostępne dla zakończonych rezerwacji

- **Typy:** `ReservationDetailViewModel`

- **Propsy:**
  - `reservation: ReservationDetailViewModel`
  - `onEdit: (data: ReservationUpdateDto) => void`
  - `onCancel: () => void`

### EditReservationDialog

- **Opis komponentu:** Modal umożliwiający edycję danych rezerwacji.

- **Główne elementy:**
  - Selektor pojazdu
  - Selektor usługi
  - Selektor terminu
  - Przyciski akcji (Zapisz/Anuluj)

- **Obsługiwane interakcje:**
  - Zmiana pojazdu z walidacją dostępności
  - Zmiana usługi z automatycznym dopasowaniem czasu
  - Zmiana terminu z sprawdzeniem dostępności
  - Zapisywanie zmian z potwierdzeniem

- **Warunki walidacji:**
  - Wybrany pojazd musi należeć do użytkownika
  - Nowy termin musi być dostępny
  - Czas trwania nowej usługi musi pasować do wybranego slotu

- **Typy:**
  - `ReservationUpdateDto`
  - `AvailableReservationDto[]`

- **Propsy:**
  - `reservation: ReservationDetailViewModel`
  - `isOpen: boolean`
  - `onSave: (data: ReservationUpdateDto) => void`
  - `onCancel: () => void`

### CancelReservationDialog

- **Opis komponentu:** Potwierdzenie anulowania rezerwacji.

- **Główne elementy:**
  - Komunikat ostrzegawczy
  - Szczegóły rezerwacji
  - Przyciski potwierdzenia

- **Obsługiwane interakcje:** Potwierdzenie lub anulowanie operacji

- **Warunki walidacji:** Rezerwacja nie może być już anulowana lub zakończona

- **Typy:** `ReservationDetailViewModel`

- **Propsy:**
  - `reservation: ReservationDetailViewModel`
  - `isOpen: boolean`
  - `onConfirm: () => void`
  - `onCancel: () => void`

### RecommendationDisplay

- **Opis komponentu:** Wyświetla rekomendacje konserwacyjne AI.

- **Główne elementy:** Formatowany tekst rekomendacji

- **Obsługiwane interakcje:** Brak

- **Warunki walidacji:** Rekomendacja musi być dostępna

- **Typy:** `string`

- **Propsy:** `recommendation: string`

## 5. Typy

### ReservationDetailViewModel
```typescript
interface ReservationDetailViewModel extends ReservationDetailDto {
  displayDate: string;        // "DD.MM.YYYY"
  displayTime: string;        // "HH:MM - HH:MM"
  displayStatus: string;      // "Nowa", "Anulowana", "Zakończona"
  canEdit: boolean;           // czy można edytować
  canCancel: boolean;         // czy można anulować
  isPast: boolean;            // czy termin minął
}
```

### EditReservationFormData
```typescript
interface EditReservationFormData {
  vehicle_license_plate: string;
  service_id: number;
  employee_id: string;
  start_ts: string;
  end_ts: string;
}
```

### ReservationActions
```typescript
type ReservationAction = 
  | { type: 'EDIT_START' }
  | { type: 'EDIT_SUCCESS'; payload: ReservationDetailDto }
  | { type: 'EDIT_ERROR'; payload: string }
  | { type: 'CANCEL_START' }
  | { type: 'CANCEL_SUCCESS' }
  | { type: 'CANCEL_ERROR'; payload: string }
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: ReservationDetailDto }
  | { type: 'LOAD_ERROR'; payload: string }
```

## 6. Zarządzanie stanem

Główny stan komponentu będzie zarządzany przez custom hook `useReservationDetail`:

```typescript
function useReservationDetail(reservationId: string) {
  const [state, dispatch] = useReducer(reservationDetailReducer, {
    reservation: null,
    isLoading: true,
    error: null,
    isEditing: false,
    isCancelling: false,
  });

  // Efekty i funkcje do ładowania danych
  // Funkcje do edycji i anulowania
  // Funkcje pomocnicze do obliczania stanów UI

  return {
    reservation: state.reservation,
    isLoading: state.isLoading,
    error: state.error,
    isEditing: state.isEditing,
    isCancelling: state.isCancelling,
    loadReservation,
    editReservation,
    cancelReservation,
  };
}
```

Hook będzie obsługiwał:
- Pobieranie danych rezerwacji przy montowaniu
- Aktualizację danych po operacjach edycji/anulowania
- Zarządzanie stanami ładowania i błędów
- Obliczanie właściwości UI (canEdit, canCancel, isPast)

## 7. Integracja API

### GET /api/reservations/{id}
- **Metoda:** GET
- **Parametry:** `id` (UUID w ścieżce)
- **Odpowiedź sukces:** `ReservationDetailDto`
- **Błędy:** 400, 401, 403, 404, 500
- **Użycie:** Pobieranie danych rezerwacji przy ładowaniu widoku

### PATCH /api/reservations/{id}
- **Metoda:** PATCH
- **Parametry:** `id` (UUID w ścieżce)
- **Body:** `ReservationUpdateDto` (partial)
- **Odpowiedź sukces:** Zaktualizowany `ReservationDetailDto`
- **Błędy:** 400, 401, 403, 404, 409, 500
- **Użycie:** Edycja i anulowanie rezerwacji

### GET /api/reservations/available
- **Metoda:** GET
- **Parametry query:** `service_id`, `start_ts`, `end_ts`, `limit`
- **Odpowiedź sukces:** `AvailableReservationsResponseDto`
- **Użycie:** Pobieranie dostępnych terminów przy edycji

## 8. Interakcje użytkownika

1. **Ładowanie strony:** Automatyczne pobranie danych rezerwacji
2. **Wyświetlenie danych:** Prezentacja informacji w czytelnej formie
3. **Edycja rezerwacji:**
   - Kliknięcie "Edytuj"
   - Wybór nowych wartości w formularzu
   - Zapisywanie zmian z walidacją
4. **Anulowanie rezerwacji:**
   - Kliknięcie "Anuluj"
   - Potwierdzenie w dialogu
   - Przekierowanie do listy po anulowaniu
5. **Obsługa błędów:** Wyświetlanie komunikatów i opcji retry

## 9. Warunki i walidacja

### Warunki biznesowe
- **Edycja przeszłych rezerwacji:** Niedozwolona (wyświetlanie komunikatu)
- **Anulowanie zakończonych rezerwacji:** Niedozwolona
- **Zmiana na niedostępny termin:** Blokowana przez API (409 Conflict)
- **Własność pojazdu:** Tylko pojazdy użytkownika (walidacja API)
- **Czas trwania usługi:** Musi pasować do wybranego slotu czasowego

### Warunki UI
- **Przyciski akcji:** Ukrywane/wyłączane gdy operacja niedozwolona
- **Stany ładowania:** Wyświetlanie spinnerów podczas operacji
- **Komunikaty błędów:** Wyświetlanie zrozumiałych wiadomości dla użytkownika

### Walidacja danych wejściowych
- **UUID rezerwacji:** Walidacja formatu w URL
- **Dane edycji:** Walidacja przez Zod schemas w API
- **Dostępność terminów:** Sprawdzana przez API przy każdej zmianie

## 10. Obsługa błędów

### Błędy API
- **400 Bad Request:** Wyświetlanie szczegółów walidacji z API
- **401 Unauthorized:** Przekierowanie do logowania
- **403 Forbidden:** Komunikat "Brak dostępu do tej rezerwacji"
- **404 Not Found:** Komunikat "Rezerwacja nie została znaleziona"
- **409 Conflict:** Komunikat o konflikcie harmonogramu
- **500 Internal Server Error:** Ogólny komunikat błędu z opcją retry

### Błędy UI
- **Błąd ładowania danych:** Komponent ErrorNotification z przyciskiem retry
- **Błąd operacji:** Toast notifications z odpowiednimi komunikatami
- **Błąd walidacji:** Wyświetlanie błędów pod polami formularza

### Scenariusze błędów
- **Utrata połączenia:** Obsługa offline z możliwością retry
- **Sesja wygasła:** Przekierowanie do logowania
- **Rywalizujące zmiany:** Komunikat o konieczności odświeżenia danych
- **Usługa niedostępna:** Fallback do stanu offline

## 11. Kroki implementacji

1. **Utworzenie struktury plików:**
   - `src/pages/reservations/[id].astro`
   - `src/components/reservations/ReservationDetailView.tsx`
   - `src/components/reservations/hooks/useReservationDetail.ts`

2. **Implementacja podstawowego komponentu:**
   - Strona Astro z podstawowym layoutem
   - ReservationDetailView z podstawową strukturą
   - Hook useReservationDetail z logiką ładowania danych

3. **Dodanie wyświetlania danych:**
   - ReservationInfoCard
   - RecommendationDisplay
   - Formatowanie dat i statusów

4. **Implementacja akcji:**
   - ReservationActionsPanel z przyciskami
   - EditReservationDialog z formularzami
   - CancelReservationDialog z potwierdzeniem

5. **Integracja z API:**
   - Wywołania GET/PATCH /api/reservations/{id}
   - Obsługa błędów API
   - Aktualizacja stanu po operacjach

6. **Dodanie walidacji i obsługi błędów:**
   - Warunki biznesowe dla edycji/anulowania
   - Komunikaty błędów dla użytkownika
   - Toast notifications dla feedbacku

7. **Testowanie i optymalizacja:**
   - Testy jednostkowe komponentów
   - Testy integracyjne z API
   - Optymalizacja wydajności
   - Responsywność i dostępność

8. **Dokumentacja i deployment:**
   - Aktualizacja README
   - Dodanie do kolekcji Postman
   - Testy E2E dla kluczowych ścieżek
