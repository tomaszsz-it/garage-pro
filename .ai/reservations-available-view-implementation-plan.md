# Plan implementacji widoku Wyszukiwanie dostępnych terminów i bookowanie rezerwacji

## 1. Przegląd
Widok umożliwia użytkownikom (klientom indywidualnym) szybkie przeglądanie dostępnych terminów dla wybranej usługi oraz rozpoczęcie rezerwacji. Po wyborze terminu, użytkownik może kontynuować proces bookowania, a system potwierdza rezerwację, wyświetlając szczegóły wraz z rekomendacją konserwacyjną.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką `/reservations/available`.

## 3. Struktura komponentów
- **ReservationsAvailableView** (komponent kontenerowy całego widoku)
  - **ReservationFilters** – formularz umożliwiający wybór usługi oraz daty
  - **ReservationSlotList** – komponent wyświetlający listę dostępnych slotów
    - **ReservationSlotItem** – pojedynczy element listy reprezentujący termin
  - **LoadingIndicator** – wskaźnik ładowania (podczas pobierania danych)
  - **ErrorNotification** – komponent do wyświetlania komunikatów o błędach

## 4. Szczegóły komponentów

### ReservationsAvailableView
- **Opis**: Główny komponent widoku, który zarządza stanem, pobiera dane z API i dystrybuuje informacje do komponentów potomnych.
- **Elementy**:
  - Wrapper dla całego widoku
  - Inkluzja komponentów: `ReservationFilters`, `ReservationSlotList`, `LoadingIndicator`, `ErrorNotification`
- **Obsługiwane interakcje**:
  - Zmiana filtrów powoduje ponowne pobranie listy dostępnych terminów
  - Kliknięcie w slot inicjuje proces bookowania
- **Warunki walidacji**:
  - Data musi być w formacie ISO8601 i nie wcześniejsza niż bieżący moment
  - Wybór usługi jest polem obowiązkowym
- **Typy**:
  - Użycie typu `AvailableReservationDto` (zgodny z backendem)
  - Rozszerzenie do `AvailableReservationViewModel` (dodatkowe pola np. sformatowana data i czas)
- **Propsy**: Brak – komponent renderowany na poziomie strony

### ReservationFilters
- **Opis**: Formularz pozwalający użytkownikowi wybrać usługę oraz datę, które warunkują zapytanie o dostępne sloty.
- **Elementy**:
  - Pole wyboru usługi (select box, np. wykorzystujący Shadcn/ui)
  - Komponent wyboru daty (date picker)
  - Przycisk wyszukiwania
- **Obsługiwane interakcje**:
  - Aktualizacja wartości pól powoduje wywołanie callbacku `onChange` z nowymi parametrami filtru
- **Warunki walidacji**:
  - `service_id` – wartość obowiązkowa i musi być prawidłowym identyfikatorem
  - `start_ts` – data musi być w przyszłości oraz zgodna z formatem ISO8601
- **Typy**:
  - `ReservationFilterParams` (np.: { service_id: number, start_ts: string })
- **Propsy**:
  - `onChange(filters: ReservationFilterParams)` – przekazuje aktualne filtry do komponentu nadrzędnego

### ReservationSlotList
- **Opis**: Wyświetla listę slotów pobranych z API na podstawie wybranych filtrów.
- **Elementy**:
  - Lista elementów reprezentowanych przez `ReservationSlotItem`
  - Komunikat o braku danych, jeśli lista jest pusta
- **Obsługiwane interakcje**:
  - Kliknięcie na slot wywołuje callback `onSelect` przekazujący wybrany slot
- **Warunki walidacji**:
  - Jeśli lista slotów jest pusta, wyświetlić komunikat "Brak dostępnych terminów"
- **Typy**:
  - Tablica `AvailableReservationViewModel`
- **Propsy**:
  - `slots: AvailableReservationViewModel[]`
  - `onSelect(slot: AvailableReservationViewModel)` – callback po wyborze slotu

### ReservationSlotItem
- **Opis**: Pojedyncza karta lub przycisk reprezentujący jeden dostępny slot.
- **Elementy**:
  - Wyświetlanie sformatowanej daty i czasu slotu
  - Nazwa mechanika
- **Obsługiwane interakcje**:
  - Kliknięcie inicjuje akcję bookowania
- **Warunki walidacji**:
  - Brak dodatkowej walidacji – dane wyświetlane bez modyfikacji
- **Typy**:
  - `AvailableReservationViewModel`
- **Propsy**:
  - `slot: AvailableReservationViewModel`
  - `onClick(slot: AvailableReservationViewModel)`

## 5. Typy
- **AvailableReservationDto** (backend):
  - `start_ts`: string
  - `end_ts`: string
  - `employee_id`: string
  - `employee_name`: string

- **AvailableReservationViewModel** (view): Rozszerzenie:
  - `displayDate`: sformatowana data (DD.MM.YYYY)
  - `displayTime`: zakres godzin (HH:MM - HH:MM)

- **ReservationFilterParams**:
  - `service_id`: number
  - `start_ts`: string (ISO8601)
  - (Opcjonalnie) `end_ts`: string, `limit`: number

## 6. Zarządzanie stanem
- Główny komponent `ReservationsAvailableView` będzie zarządzał stanem, zawierając:
  - `filters`: aktualne parametry filtru
  - `slots`: lista slotów typu `AvailableReservationViewModel`
  - `isLoading`: boolean określający stan ładowania
  - `error`: string lub null, przekazujący komunikaty o błędach
- Możliwe użycie customowego hooka, np. `useAvailableReservations`, który:
  - Wykonuje zapytanie do API na podstawie `filters`
  - Aktualizuje stany `slots`, `isLoading` oraz `error`

## 7. Integracja API
- Endpoint: GET `/reservations/available`
- Parametry: `service_id`, `start_ts`, (opcjonalnie) `end_ts` oraz `limit` na podstawie stanu filtru
- Odpowiedź: Lista obiektów typu `AvailableReservationDto`, które będą mapowane do `AvailableReservationViewModel`
- W przypadku błędów (400,404,500) widok aktualizuje stan `error` i wyświetla `ErrorNotification`

## 8. Interakcje użytkownika
- Użytkownik wybiera usługę i datę w komponencie `ReservationFilters`, co powoduje aktualizację stanu filtrów
- Po akcji wyszukiwania, widok pokazuje wskaźnik ładowania i pobiera dane z API
- Jeżeli dane zostaną poprawnie pobrane, `ReservationSlotList` wyświetla listę slotów
- W przypadku pustej odpowiedzi, użytkownik zobaczy komunikat o braku dostępnych terminów
- Kliknięcie slotu w `ReservationSlotItem` uruchamia proces bookowania (np. przejście do szczegółów rezerwacji lub wyświetlenie modala potwierdzenia)

## 9. Warunki i walidacja
- Formularz w `ReservationFilters` wymaga wybrania usługi i podania daty zgodnej z formatem ISO8601
- Walidacja daty: data nie może być z przeszłości
- API dodatkowo weryfikuje, czy `service_id` jest prawidłowy, a daty mieszczą się w dopuszczalnych przedziałach

## 10. Obsługa błędów
- Błędy zwracane przez API (np. 400, 404, 500) są przechwytywane, a stan `error` jest ustawiany w `ReservationsAvailableView`
- Komponent `ErrorNotification` wyświetla odpowiednie komunikaty
- Inline walidacja w `ReservationFilters` przekazuje błędy dotyczące niepoprawnych danych wejściowych

## 11. Kroki implementacji
1. Utworzyć routing widoku pod adresem `/reservations/available`.
2. Zaimplementować główny komponent `ReservationsAvailableView` z logiką pobierania danych z API.
3. Stworzyć i zaimplementować komponent `ReservationFilters` z obsługą pola wyboru usługi i daty oraz walidacją wejścia.
4. Utworzyć komponent `ReservationSlotList` do renderowania listy slotów oraz komponent `ReservationSlotItem` do reprezentacji pojedynczego slotu.
5. Zaimplementować customowy hook (np. `useAvailableReservations`) do zarządzania stanem ładowania, pobierania danych oraz obsługi błędów.
6. Dodać komponenty `LoadingIndicator` oraz `ErrorNotification` do obsługi stanów wizualnych.
7. Mapowanie odpowiedzi API (`AvailableReservationDto`) na model widoku (`AvailableReservationViewModel`) z odpowiednim formatowaniem daty i czasu.
8. Testować interakcje: zmiana filtrów, pobieranie danych, obsługa pustej listy oraz błędów.
9. Zapewnić responsywność widoku oraz zgodność z wytycznymi Tailwind i komponentami Shadcn/ui.
