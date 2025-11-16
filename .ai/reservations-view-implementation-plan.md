# Plan implementacji widoku Rezerwacje

## 1. Przegląd
Widok `/reservations` ma na celu umożliwienie użytkownikom przeglądania, filtrowania i zarządzania swoimi rezerwacjami. Wyświetla listę nadchodzących i historycznych rezerwacji w responsywnym interfejsie (tabela na desktopie, karty na mobile). Umożliwia również szybkie przejście do tworzenia nowej rezerwacji lub dodawania pojazdu.

## 2. Routing widoku
- **Ścieżka:** `/reservations`
- **Plik strony:** `src/pages/reservations`

## 3. Struktura komponentów
- **ReservationsView** – główny komponent widoku, który zarządza stanem, logiką i kompozycją podkomponentów.
  - **ReservationsFilterPanel** – panel zawierający filtry (pojazd, usługa, status) oraz przyciski głównych akcji (np. "Znajdź termin", "Dodaj pojazd").
  - **ReservationsList** – komponent wyświetlający listę rezerwacji, dostosowujący się do rozmiaru ekranu (tabela lub karty).
    - **ReservationListItem** – pojedynczy element listy (wiersz tabeli lub karta), reprezentujący jedną rezerwację i umożliwiający nawigację do jej szczegółów.
  - **PaginationControls** – zestaw kontrolek do nawigacji między stronami listy rezerwacji.
  - **SkeletonLoader** – komponent wskaźnika ładowani (skeleton), wyświetlany podczas oczekiwania na odpowiedź z API.
  - **EmptyStateMessage** – komponent wyświetlany, gdy lista rezerwacji jest pusta lub filtry nie zwracają wyników.
  - **ErrorNotification** – komponent do wyświetlania komunikatów o błędach (np. problem z pobraniem danych).

## 4. Szczegóły komponentów
### **ReservationsView**
- **Opis:** Główny kontener widoku, odpowiedzialny za orkiestrację pobierania danych, zarządzanie stanem (filtry, paginacja, status ładowania) oraz przekazywanie danych do komponentów podrzędnych.
- **Elementy:** Renderuje panel filtrów, listę rezerwacji oraz kontrolki paginacji.
- **Obsługiwane zdarzenia:**
  - Obsługa zmian w filtrach.
  - Obsługa zmiany strony w paginacji.
- **Warunki walidacji:** Brak; komponent deleguje walidację do komponentów podrzędnych.
- **Typy:** `ReservationDto`, `VehicleDto`, `Service`, `ReservationFiltersViewModel`, `PaginationDto`.
- **Propsy:** Brak.

### **ReservationsFilterPanel**
- **Opis:** Formularz zawierający kontrolki do filtrowania listy rezerwacji oraz przyciski głównych akcji.
- **Elementy:**
  - Pole wyboru do filtrowania po pojeździe.
  - Pole wyboru do filtrowania po usłudze.
  - Pole wyboru do filtrowania po statusie.
  - Przycisk nawigujący do widoku wyszukiwania terminów.
  - Przycisk nawigujący do widoku dodawania pojazdu.
- **Obsługiwane zdarzenia:** Przekazuje zdarzenie zmiany wartości w polach filtrów do komponentu nadrzędnego.
- **Warunki walidacji:** Brak.
- **Typy:** `VehicleDto`, `Service`, `ReservationStatus`, `ReservationFiltersViewModel`.
- **Propsy:** Lista pojazdów (`VehicleDto[]`), Lista usług (`Service[]`), Aktualny stan filtrów (`ReservationFiltersViewModel`), Funkcja zwrotna informująca o zmianie filtrów.

### **ReservationsList**
- **Opis:** Komponent prezentacyjny, który renderuje listę rezerwacji w sposób responsywny.
- **Elementy:**
  - Widok tabelaryczny z kolumnami (data, godzina, usługa, pojazd, status).
  - Widok kart, gdzie każda karta reprezentuje jedną rezerwację.
  - Każdy element listy jest klikalny i przenosi do szczegółów rezerwacji.
- **Obsługiwane zdarzenia:** Nawigacja do szczegółów rezerwacji po kliknięciu elementu.
- **Warunki walidacji:** Brak.
- **Typy:** `ReservationViewModel`.
- **Propsy:** Lista rezerwacji do wyświetlenia (`ReservationViewModel[]`), Flaga informująca o stanie ładowania.

### **PaginationControls**
- **Opis:** Wyświetla kontrolki paginacji, umożliwiając nawigację między stronami.
- **Elementy:** Przyciski "poprzednia" i "następna" oraz wskaźniki numerów stron.
- **Obsługiwane zdarzenia:** Przekazuje zdarzenie zmiany numeru strony do komponentu nadrzędnego.
- **Warunki walidacji:** Przyciski nawigacyjne są wyłączane, gdy osiągnięta zostanie pierwsza lub ostatnia strona.
- **Typy:** `PaginationDto`.
- **Propsy:** Obiekt z danymi o paginacji (`PaginationDto`), Funkcja zwrotna informująca o zmianie strony.

## 5. Typy i modele danych
Do implementacji widoku, oprócz typów DTO z `src/types.ts` (`ReservationDto`, `VehicleDto`, `Service`, `ReservationStatus`, `PaginationDto`), potrzebne będą następujące typy `ViewModel`:

- **`ReservationViewModel`**: Reprezentuje pojedynczą rezerwację z danymi przygotowanymi do wyświetlenia w UI. Będzie mapowany z `ReservationDto`.
  ```typescript
  interface ReservationViewModel {
    id: string;
    date: string; // sformatowana data
    time: string; // sformatowana godzina
    serviceName: string;
    vehicleLicensePlate: string;
    status: ReservationStatus;
    detailsUrl: string;
  }
  ```
- **`ReservationFiltersViewModel`**: Reprezentuje obiekt przechowujący aktualne wartości filtrów wybrane przez użytkownika.
  ```typescript
  interface ReservationFiltersViewModel {
    vehicleLicensePlate: string | null;
    serviceId: number | null;
    status: ReservationStatus | null;
  }
  ```

## 6. Zarządzanie stanem
Stan widoku będzie zarządzany za pomocą hooków React (`useState`, `useEffect`). Kluczowe stany:
- Lista wszystkich rezerwacji (`ReservationDto[]`).
- Lista pojazdów użytkownika (`VehicleDto[]`).
- Aktualny stan filtrów (`ReservationFiltersViewModel`).
- Aktualna strona paginacji (`number`).
- Stan ładowania (`isLoading`) dla wywołania API.
- Stan błędów (`errorMessage`) dla komunikatów o błędach.

Konieczne jest wydzielenie logiki API do customowego hooka (np. `useReservations`) w celu obsługi logiki pobierania danych (`/api/reservations`, `/api/vehicles`), filtrowania i paginacji po stronie klienta oraz zarządzania stanami ładowania i błędów.

## 7. Integracja z API
Główny komponent widoku jest odpowiedzialny za komunikację z API:

1.  **Pobieranie rezerwacji**:
    - **Endpoint:** `GET /api/reservations`
    - **Typ odpowiedzi:** `ReservationsListResponseDto`
    - **Cel:** Pobranie wszystkich rezerwacji dla zalogowanego użytkownika. Filtrowanie odbywa się po stronie klienta.
2.  **Pobieranie pojazdów**:
    - **Endpoint:** `GET /api/vehicles`
    - **Typ odpowiedzi:** `VehiclesListResponseDto`
    - **Cel:** Pobranie listy pojazdów użytkownika w celu wypełnienia filtra.

Dla MVP dane dotyczące usług oferowanych przez warsztat pochodzą ze statycznej, zdefiniowanej w kodzie listy.

## 8. Interakcje użytkownika
- **Ładowanie widoku:** Użytkownik widzi wskaźnik ładowania podczas pobierania danych.
- **Zmiana filtra:** Wybranie opcji w filtrze powoduje natychmiastowe przefiltrowanie listy i zresetowanie paginacji.
- **Zmiana strony:** Kliknięcie na numer strony w paginacji powoduje wyświetlenie odpowiedniego podzbioru danych.
- **Nawigacja:** Kliknięcie elementu listy przenosi do strony szczegółów danej rezerwacji.
- **Stan pusty (brak rezerwacji):** Jeśli użytkownik nie ma rezerwacji, widoczny jest komunikat oraz przycisk "Znajdź termin". Przycisk jest nieaktywny, jeśli użytkownik nie posiada żadnego pojazdu. W takim przypadku widoczny jest również przycisk "Dodaj pojazd".

## 9. Warunki brzegowe
- **Paginacja:** Przyciski nawigacyjne są nieaktywne na krańcowych stronach.
- **Filtry:** Jeśli po zastosowaniu filtrów lista jest pusta, tabela bedzie pusta.
- **Stan pusty:** Jeśli użytkownik nie ma żadnych rezerwacji, zostanie wyświetlony komunikat zachęcający do umówienia wizyty.

## 10. Obsługa błędów
- **Błąd pobierania danych:** W przypadku błędu API, zostanie wyświetlony komunikat o błędzie z opcją ponowienia próby.
- **Brak danych:** Gdy API zwróci pustą listę, interfejs wyświetli informację o braku rezerwacji i wskaże przycisk do wyszukiwania terminów.

## 11. Kroki implementacji
1.  Utworzenie nowej strony widoku `/reservations` w strukturze projektu.
2.  Implementacja głównego komponentu `ReservationsView`, który będzie zarządzał stanem i logiką pobierania danych.
3.  Implementacja dedykowanego hooka (np. `useReservations`) do obsługi logiki API (pobieranie rezerwacji i pojazdów) oraz zarządzania stanem (ładowanie, błędy, filtrowanie, paginacja).
4.  Stworzenie komponentu `ReservationsFilterPanel` z polami wyboru i przyciskami akcji.
5.  Stworzenie komponentów `ReservationsList` i `ReservationListItem` do responsywnego wyświetlania listy rezerwacji.
6.  Stworzenie komponentu `PaginationControls` do nawigacji między stronami.
7.  Implementacja komponentu `LoadingIndicator` (np. w formie szkieletu interfejsu) do wizualizacji ładowania danych.
8.  Integracja wyświetlania komunikatów o błędach przez `ErrorNotification` oraz komunikatów o braku danych przez `EmptyStateMessage`.
9.  Złożenie wszystkich komponentów w `ReservationsView` i przekazanie im odpowiednich danych i funkcji zwrotnych.
10. Testowanie interakcji użytkownika (filtrowanie, paginacja, nawigacja) oraz obsługi stanów brzegowych (ładowanie, błąd, stan pusty).
11. Dostrojenie responsywności i poprawienie aspektów dostępności.
12. Finalny przegląd kodu i refaktoryzacja przed wdrożeniem.
