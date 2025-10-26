# Plan implementacji widoku Rezerwacje

## 1. Przegląd
Widok `/reservations` ma na celu umożliwienie użytkownikom przeglądania, filtrowania i zarządzania swoimi rezerwacjami. Wyświetla listę nadchodzących i historycznych rezerwacji w responsywnym interfejsie (tabela na desktopie, karty na mobile). Umożliwia również szybkie przejście do tworzenia nowej rezerwacji lub dodawania pojazdu.

## 2. Routing widoku
Widok będzie dostępny pod następującą ścieżką:
- **Ścieżka:** `/reservations`
- **Plik:** `src/pages/reservations.astro`

## 3. Struktura komponentów
Hierarchia komponentów zostanie zorganizowana w następujący sposób, aby oddzielić logikę od prezentacji i zapewnić reużywalność.

```
- ReservationsPage.astro         // Główny plik strony Astro
  - ReservationsView.tsx         // Kontener React, zarządza stanem i logiką
    - ReservationsFilter.tsx     // Komponent z filtrami i przyciskami akcji
    - ReservationsList.tsx       // Wyświetla listę rezerwacji (tabela/karty)
    - ReservationsPagination.tsx // Komponent do obsługi paginacji
```

## 4. Szczegóły komponentów
### `ReservationsView.tsx`
- **Opis komponentu:** Główny komponent React renderowany po stronie klienta (`client:load`). Odpowiedzialny za pobieranie danych (rezerwacje, pojazdy, usługi), zarządzanie stanem filtrów i paginacji oraz przekazywanie przefiltrowanych danych do komponentów podrzędnych.
- **Główne elementy:** Renderuje komponenty `ReservationsFilter`, `ReservationsList`, `ReservationsPagination`.
- **Obsługiwane interakcje:**
  - `handleFilterChange`: Aktualizuje stan filtrów po interakcji w `ReservationsFilter`.
  - `handlePageChange`: Aktualizuje stan bieżącej strony po interakcji w `ReservationsPagination`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `ReservationDto`, `VehicleDto`, `Service`, `ReservationFiltersViewModel`, `PaginationDto`.
- **Propsy:** Brak.

### `ReservationsFilter.tsx`
- **Opis komponentu:** Formularz zawierający kontrolki do filtrowania listy rezerwacji oraz przyciski głównych akcji.
- **Główne elementy:**
  - `Select` (Shadcn/ui) do filtrowania po pojeździe.
  - `Select` (Shadcn/ui) do filtrowania po usłudze.
  - `Select` (Shadcn/ui) do filtrowania po statusie.
  - `Button` (Shadcn/ui) "Znajdź termin" nawigujący do widoku rezerwacji.
  - `Button` (Shadcn/ui) "Dodaj pojazd" nawigujący do formularza dodawania pojazdu.
- **Obsługiwane interakcje:** Wywołuje `onFilterChange` przy każdej zmianie wartości w polach `Select`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `VehicleDto`, `Service`, `ReservationStatus`, `ReservationFiltersViewModel`.
- **Propsy:**
  ```typescript
  interface ReservationsFilterProps {
    vehicles: VehicleDto[];
    services: Service[];
    filters: ReservationFiltersViewModel;
    onFilterChange: (filters: ReservationFiltersViewModel) => void;
  }
  ```

### `ReservationsList.tsx`
- **Opis komponentu:** Komponent prezentacyjny, który renderuje listę rezerwacji. Jest responsywny - wyświetla dane w formie tabeli na większych ekranach i w formie kart na urządzeniach mobilnych.
- **Główne elementy:**
  - **Desktop:** `Table`, `TableHeader`, `TableRow`, `TableCell` (komponenty Shadcn/ui).
  - **Mobile:** `Card`, `CardHeader`, `CardContent` (komponenty Shadcn/ui) renderowane w pętli.
  - Każdy wiersz/karta jest linkiem do strony szczegółów rezerwacji (`/reservations/[id]`).
- **Obsługiwane interakcje:** Nawigacja do szczegółów rezerwacji po kliknięciu elementu.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `ReservationViewModel`.
- **Propsy:**
  ```typescript
  interface ReservationsListProps {
    reservations: ReservationViewModel[];
    isLoading: boolean;
  }
  ```

### `ReservationsPagination.tsx`
- **Opis komponentu:** Wyświetla kontrolki paginacji, umożliwiając nawigację między stronami listy rezerwacji.
- **Główne elementy:** Komponent `Pagination` z biblioteki Shadcn/ui.
- **Obsługiwane interakcje:** Wywołuje `onPageChange` z numerem nowej strony po kliknięciu przycisku nawigacyjnego.
- **Obsługiwana walidacja:** Przyciski "poprzednia" i "następna" są wyłączane, gdy użytkownik jest odpowiednio na pierwszej lub ostatniej stronie.
- **Typy:** `PaginationDto`.
- **Propsy:**
  ```typescript
  interface ReservationsPaginationProps {
    pagination: PaginationDto;
    onPageChange: (page: number) => void;
  }
  ```

## 5. Typy
Do implementacji widoku, oprócz istniejących typów DTO, potrzebne będą następujące typy `ViewModel` do obsługi danych w warstwie prezentacji.

### `ReservationViewModel`
Reprezentuje pojedynczą rezerwację z danymi sformatowanymi do wyświetlenia w interfejsie użytkownika.
```typescript
interface ReservationViewModel {
  id: string;                      // ID rezerwacji
  date: string;                    // Sformatowana data, np. "16.10.2024"
  time: string;                    // Sformatowana godzina, np. "09:00"
  serviceName: string;             // Nazwa usługi
  vehicleLicensePlate: string;     // Numer rejestracyjny pojazdu
  status: ReservationStatus;       // Status rezerwacji ('New', 'Done', 'Cancelled')
  detailsUrl: string;              // URL do strony szczegółów, np. "/reservations/123"
}
```

### `ReservationFiltersViewModel`
Reprezentuje stan formularza filtrów. `null` oznacza opcję "Wszystkie".
```typescript
interface ReservationFiltersViewModel {
  vehicleLicensePlate: string | null;
  serviceId: number | null;
  status: ReservationStatus | null;
}
```

## 6. Zarządzanie stanem
Zarządzanie stanem będzie scentralizowane w komponencie `ReservationsView.tsx` przy użyciu standardowych hooków React (`useState`, `useEffect`, `useMemo`). Nie ma potrzeby wprowadzania zewnętrznej biblioteki do zarządzania stanem.

- **`useState`:**
  - `allReservations: ReservationDto[]`: Przechowuje pełną listę rezerwacji pobraną z API.
  - `vehicles: VehicleDto[]`: Lista pojazdów użytkownika do filtra.
  - `services: Service[]`: Lista dostępnych usług do filtra.
  - `filters: ReservationFiltersViewModel`: Aktualny stan filtrów.
  - `currentPage: number`: Numer bieżącej strony do paginacji.
  - `isLoading: boolean`: Status ładowania danych z API.
  - `error: Error | null`: Przechowuje ewentualne błędy z API.

- **`useMemo`:**
  - `filteredReservations`: Oblicza przefiltrowaną listę rezerwacji na podstawie `allReservations` i `filters`.
  - `paginatedReservations`: Oblicza podzbiór rezerwacji do wyświetlenia na bieżącej stronie (`currentPage`) na podstawie `filteredReservations`.
  - `paginationData`: Oblicza obiekt `PaginationDto` na podstawie `filteredReservations` i `itemsPerPage`.

## 7. Integracja API
Komponent `ReservationsView` będzie odpowiedzialny za komunikację z API. Zostaną wykonane następujące wywołania:

1.  **`GET /api/reservations`**:
    - **Cel:** Pobranie wszystkich rezerwacji dla zalogowanego użytkownika. Z uwagi na brak filtrowania w API, zostanie użyty wysoki limit, np. `?limit=1000`, aby pobrać wszystkie dane i umożliwić filtrowanie po stronie klienta.
    - **Typ odpowiedzi:** `ReservationsListResponseDto`.

2.  **`GET /api/vehicles`** (założenie, że istnieje):
    - **Cel:** Pobranie listy pojazdów użytkownika w celu wypełnienia filtra.
    - **Typ odpowiedzi:** `VehiclesListResponseDto`.

3.  **`GET /api/services`** (założenie, że istnieje):
    - **Cel:** Pobranie listy wszystkich dostępnych usług w celu wypełnienia filtra.
    - **Typ odpowiedzi:** ` { data: Service[] } `.

Wszystkie wywołania zostaną zainicjowane wewnątrz hooka `useEffect` przy pierwszym renderowaniu komponentu.

## 8. Interakcje użytkownika
- **Ładowanie widoku:** Użytkownik widzi wskaźnik ładowania, podczas gdy dane są pobierane z API. Po załadowaniu wyświetlana jest pierwsza strona rezerwacji.
- **Zmiana filtra:** Wybranie opcji w jednym z `Select`ów powoduje natychmiastowe przefiltrowanie listy rezerwacji i zresetowanie paginacji do pierwszej strony.
- **Zmiana strony:** Kliknięcie na numer strony lub przyciski nawigacyjne w komponencie paginacji powoduje wyświetlenie odpowiedniego podzbioru przefiltrowanych rezerwacji.
- **Nawigacja:** Kliknięcie wiersza tabeli, karty rezerwacji lub przycisków akcji przenosi użytkownika do odpowiedniej podstrony.

## 9. Warunki i walidacja
Walidacja odbywa się głównie na poziomie interfejsu użytkownika w celu poprawy UX:
- **Paginacja:** Przycisk "Wstecz" jest nieaktywny na pierwszej stronie. Przycisk "Dalej" jest nieaktywny na ostatniej stronie.
- **Filtry:** Jeśli po zastosowaniu filtrów lista wyników jest pusta, `ReservationsList` wyświetli stosowny komunikat (np. "Brak rezerwacji spełniających kryteria").
- **Stan pusty:** Jeśli użytkownik nie ma żadnych rezerwacji, `ReservationsList` wyświetli komunikat zachęcający do umówienia pierwszej wizyty.

## 10. Obsługa błędów
- **Błąd pobierania danych:** W przypadku błędu API (np. status 500), komponent `ReservationsView` przechowa błąd w stanie. Zamiast listy rezerwacji zostanie wyświetlony komunikat o błędzie (np. "Nie udało się wczytać rezerwacji. Spróbuj ponownie później.") wraz z przyciskiem "Spróbuj ponownie", który ponowi próbę pobrania danych.
- **Brak danych:** Gdy API zwróci pustą listę rezerwacji (nowy użytkownik), interfejs wyświetli informację o braku rezerwacji i wskaże przycisk "Znajdź termin" jako główną akcję do wykonania.

## 11. Kroki implementacji
1.  **Utworzenie pliku strony:** Stworzyć plik `src/pages/reservations.astro` i podstawowy layout strony z tytułem.
2.  **Stworzenie komponentu `ReservationsView.tsx`:** Zaimplementować w nim logikę pobierania danych z API (`/api/reservations`, `/api/vehicles`, `/api/services`) wewnątrz `useEffect`, wraz z obsługą stanu ładowania i błędów.
3.  **Implementacja stanu i logiki filtrowania:** Dodać stany dla filtrów, paginacji oraz logikę `useMemo` do przetwarzania danych (filtrowanie i paginacja po stronie klienta).
4.  **Stworzenie komponentu `ReservationsFilter.tsx`:** Zbudować formularz z trzema komponentami `Select` i dwoma `Button` z Shadcn/ui. Podpiąć propsy i event `onFilterChange`.
5.  **Stworzenie komponentu `ReservationsList.tsx`:** Zaimplementować responsywny widok listy rezerwacji, używając `Table` dla desktopa i `Card` dla mobile, korzystając z klas responsywnych Tailwind CSS (np. `hidden md:table`).
6.  **Stworzenie komponentu `ReservationsPagination.tsx`:** Zaimplementować komponent z użyciem `Pagination` z Shadcn/ui, podpinając propsy i event `onPageChange`.
7.  **Złożenie widoku:** W `ReservationsView.tsx` złożyć wszystkie komponenty (`Filter`, `List`, `Pagination`), przekazując im odpowiednie propsy i obsługując eventy.
8.  **Integracja z Astro:** Zaimportować i wyrenderować komponent `ReservationsView.tsx` w `reservations.astro` z dyrektywą `client:load`.
9.  **Stylowanie i dopracowanie:** Dodać ostateczne style za pomocą Tailwind CSS, zadbać o odstępy, typografię i ogólny wygląd widoku.
10. **Testowanie manualne:** Przetestować wszystkie interakcje użytkownika: filtrowanie, paginację, nawigację oraz obsługę stanów (ładowanie, błąd, brak danych).
