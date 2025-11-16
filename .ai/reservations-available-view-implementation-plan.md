# Plan implementacji widoku Wyszukiwanie dostępnych terminów i bookowanie rezerwacji

## 1. Przegląd
Widok umożliwia klientom indywidualnym szybkie przeglądanie dostępnych terminów rezerwacji dla wybranej usługi oraz rozpoczęcie procesu rezerwacji. Proces składa się z dwóch etapów:
1. Na starcie, użytkownik widzi formularz, w którym może wybrać usługę. Formularz wyświetla: Nazwę usługi (name), Szczegóły (description) oraz czas trwania usługi w minutach (duration_minutes).
2. Po wyborze usługi wyświetlany jest kalendarz, prezentujący bieżący tydzień ze wskazaniem dni, w których dostępne są sloty. Użytkownik może zmieniać tydzień (poprzedni/następny), wybierać miesiąc i rok (domyślnie aktualny miesiąc, ale wyświetlany tylko jeden tydzień naraz) oraz powrócić do zmiany usługi.
3. Pod każdym dniem wyświetlana jest lista przycisków – każdy reprezentuje proponowaną, dostępną godzinę rozpoczęcia usługi. Kliknięcie przycisku przekierowuje do formularza rezerwacji, wypełnionego danymi wybranej usługi, dnia oraz godziny.

## 2. Routing widoku
- **Ścieżka:** `/reservations/available`
- **Plik strony:** `src/pages/reservations/available.astro`

## 3. Struktura komponentów
- **ReservationsAvailableView** – główny komponent widoku, który zarządza prezentacją obu etapów:
  - **ServiceSelectionForm** – formularz umożliwiający wybór usługi z wyświetlaniem jej nazwy, opisu i czasu trwania.
  - **CalendarView** – komponent kalendarza, który:
    - Na starcie wyświetla bieżący tydzień dla wybranej usługi.
    - Umożliwia wybór miesiąca i roku (domyślnie aktualny miesiąc).
    - Wyświetla jeden tydzień (siatkę dni) z wyróżnieniem dni, gdzie dostępne są rezerwacje.
    - Udostępnia przyciski: "poprzedni tydzień", "następny tydzień" oraz "powrót do zmiany usługi".
    - Pod każdym dniem prezentuje listę przycisków reprezentujących dostępne godziny.
  - **ReservationSlotList** – ewentualnie element odpowiedzialny za renderowanie przycisków godzin dla danego dnia, jeśli logika nie zostanie w pełni zawarta w `CalendarView`.
  - **SkeletonLoader** – wskaźnik ładowania podczas pobierania danych.
  - **ErrorNotification** – komponent do wyświetlania komunikatów o błędach.
  - (Opcjonalnie) **EmptyStateMessage** – komunikat wyswietlany, gdy dla wybranego dnia brak jest dostępnych terminów.

## 4. Szczegóły komponentów

### ReservationsAvailableView
- **Opis:**  
  Główny kontener widoku, który obsługuje dwa etapy:
  1. Formularz wyboru usługi.
  2. Po zatwierdzeniu usługi – interfejs kalendarza z wyborem dnia i godziny.
- **Elementy:**  
  - Wrapper strony (layout responsywny).
  - Dynamiczne przełączanie między widokiem formularza i widokiem kalendarza.
  - Komponenty: `ServiceSelectionForm`, `CalendarView`, `SkeletonLoader`, `ErrorNotification` oraz opcjonalnie `EmptyStateMessage`.
- **Obsługiwane zdarzenia:**  
  - Submisja formularza wyboru usługi – przełączenie do widoku kalendarza.
  - Kliknięcie przycisku w kalendarzu (przycisk godziny) – przejście do formularza rezerwacji z predefiniowanymi danymi.
  - Nawigacja między tygodniami oraz wybór miesiąca/roku.
  - Akcja powrotu do zmiany usługi.
- **Warunki walidacji:**  
  - W formularzu: `service_id` (identyfikator usługi) musi być wybrany.
  - Wybrana data w kalendarzu musi być w przyszłości i zgodna z ISO8601.
- **Typy:**  
  - Użycie typu `AvailableReservationDto` pobranego z API.
  - Rozszerzenie do `AvailableReservationViewModel` zawierające dodatkowe pola (np. sformatowana data, zakres godzin).
- **Propsy:**  
  - Brak – komponent zarządza własnym stanem.

### ServiceSelectionForm
- **Opis:**  
  Formularz umożliwiający użytkownikowi wybór usługi rezerwacji. Prezentuje kluczowe informacje o usłudze:
  - Nazwa (name),
  - Szczegóły (description),
  - Czas trwania (duration_minutes).
- **Elementy:**  
  - Lista dostępnych usług (zakładamy, że dane te są pobierane lub statycznie zdefiniowane).
  - Radio button lub select box do wyboru usługi.
  - Przycisk zatwierdzający wybór.
- **Obsługiwane zdarzenia:**  
  - Zmiana wyboru usługi – aktualizacja stanu formularza.
  - Submisja formularza – przekazanie wybranej usługi do `ReservationsAvailableView`.
- **Warunki walidacji:**  
  - Wybór usługi jest obowiązkowy.
- **Typy:**  
  - `ServiceDto` (np. z polami: id, name, description, duration_minutes).
- **Propsy:**  
  - `onServiceSelect(service: ServiceDto)` – callback informujący o wyborze usługi.

### CalendarView
- **Opis:**  
  Komponent kalendarza do wyboru dnia i godziny rezerwacji dla wybranej usługi.
- **Elementy:**  
  - Widok siatki – wyświetla jeden tydzień (dzień, miesiąc, rok). Domyślnie bieżący tydzień oraz bieżący miesiąc.
  - Przycisk do przełączenia na poprzedni i następny tydzień.
  - Element pozwalający na wybór miesiąca i roku (np. dropdown lub picker) – domyślnie aktualny miesiąc.
  - Lista przycisków pod każdym dniem wyświetlająca dostępne godziny rezerwacji.
  - Przycisk powrotu do zmiany usługi.
- **Obsługiwane zdarzenia:**  
  - Kliknięcie aktywnego dnia – ustawia wybrany dzień oraz:
    - Wyświetla przyciski startowych godzin dla tego dnia.
  - Kliknięcie przycisków "poprzedni tydzień" i "następny tydzień" – zmienia zakres wyświetlanego tygodnia.
  - Wybór miesiąca i roku.
  - Kliknięcie przycisku z godziną – wywołuje callback `onTimeSelect` z danymi wybranego slotu.
  - Kliknięcie przycisku powrotu – umożliwia powrót do formularza wyboru usługi.
- **Warunki walidacji:**  
  - Dni bez dostępnych slotów muszą być oznaczone (np. inny kolor) i nie reagować na kliknięcie.
- **Typy:**  
  - Lista `AvailableReservationViewModel` pogrupowana wg daty.
- **Propsy:**  
  - `availableSlots: AvailableReservationViewModel[]` – dostępne sloty dla wybranej usługi.
  - `onDaySelect(day: string)` – callback zwracający wybraną datę.
  - `onTimeSelect(slot: AvailableReservationViewModel)` – callback zwracający wybraną godzinę.
  - `onBack(): void` – callback powrotu do etapu wyboru usługi.

### ReservationSlotList (opcjonalnie)
- **Opis:**  
  Jeśli logika prezentacji slotów nie zostanie w pełni zawarta w `CalendarView`, można wyodrębnić komponent listy dostępnych slotów dla wybranego dnia.
- **Elementy:**  
  - Lista przycisków reprezentujących dostępne godziny.
- **Obsługiwane zdarzenia:**  
  - Kliknięcie przycisku slotu – wywołanie callbacku `onSelect`.
- **Warunki walidacji:**  
  - Jeśli lista jest pusta, wyświetlenie komunikatu "Brak dostępnych terminów".
- **Typy:**  
  - Tablica `AvailableReservationViewModel`.
- **Propsy:**  
  - `slots: AvailableReservationViewModel[]`
  - `onSelect(slot: AvailableReservationViewModel)`

### SkeletonLoader, ErrorNotification i EmptyStateMessage
- **Opis:**  
  Komponenty pomocnicze wykorzystywane do:
  - Wyświetlania wskaźnika ładowania (`SkeletonLoader`).
  - Prezentowania komunikatów o błędach (`ErrorNotification`).
  - Informowania o braku dostępnych terminów (`EmptyStateMessage`).
- **Propsy:**  
  - `ErrorNotification` przyjmuje np. `message: string`.

## 5. Typy i modele danych
- **ServiceDto:**
  - `id`: number
  - `name`: string
  - `description`: string
  - `duration_minutes`: number
- **AvailableReservationDto (backend):**
  - `start_ts`: string
  - `end_ts`: string
  - `employee_id`: string
  - `employee_name`: string
- **AvailableReservationViewModel (widok):**
  Rozszerzenie `AvailableReservationDto` o dodatkowe pola:
  - `displayDate`: string – sformatowana data (DD.MM.YYYY)
  - `displayTime`: string – zakres godzin (HH:MM - HH:MM)
- **ReservationFilterParams:**
  - `service_id`: number
  - `start_ts`: string (ISO8601)
  - Opcjonalnie: `end_ts`: string, `limit`: number

## 6. Zarządzanie stanem
- **Główne stany w `ReservationsAvailableView`:**
  - `selectedService`: obiekt typu `ServiceDto` – wybrana usługa.
  - `filters`: obiekt typu `ReservationFilterParams` – aktualne filtry.
  - `selectedDay`: string – wybrana data z kalendarza.
  - `slots`: lista dostępnych slotów (`AvailableReservationViewModel`) dla wybranego dnia.
  - `isLoading`: boolean – stan ładowania danych.
  - `error`: string | null – komunikaty o błędach.
- **Customowy hook:**  
  Propozycja wykorzystania hooka `useAvailableReservations`, który:
  - Pobiera dane z endpointu `GET /reservations/available` na podstawie aktualnych filtrów.
  - Grupuje sloty według daty (dla kalendarza).
  - Aktualizuje stany `slots`, `isLoading` oraz `error`.

## 7. Integracja z API
- **Endpoint:** `GET /reservations/available`
- **Parametry żądania:**  
  - `service_id`: number (wymagany)
  - `start_ts`: string (ISO8601, nie wcześniejszy niż teraz)
  - Opcjonalnie: `end_ts`: string (np. do +30 dni) oraz `limit`: number
- **Odpowiedź:**  
  - Lista obiektów typu `AvailableReservationDto`, mapowanych następnie do `AvailableReservationViewModel` z dodatkowym formatowaniem daty i czasu.
- **Obsługa błędów:**  
  - W przypadku błędów (HTTP 400, 404, 500) stan `error` zostanie ustawiony i widok wyświetli `ErrorNotification`.

## 8. Interakcje użytkownika
- **Wybór usługi:**  
  - Na starcie użytkownik widzi formularz `ServiceSelectionForm` i wybiera usługę (z polami: name, description, duration_minutes). Po zatwierdzeniu następuje przejście do widoku kalendarza.
- **Wyświetlenie kalendarza:**  
  - Po wybraniu usługi, `CalendarView` wyświetla bieżący tydzień (tylko jeden tydzień widoczny) wraz z oznaczeniem, które dni mają dostępne sloty.
  - Użytkownik może zmieniać tydzień za pomocą przycisków "poprzedni tydzień" i "następny tydzień".
  - Istnieje możliwość zmiany miesiąca i roku (domyślnie aktualny miesiąc).
- **Wybór dnia i godziny:**  
  - Po kliknięciu w aktywny dzień (oznaczony, bo posiada dostępne sloty), pod tym dniem wyświetlona zostaje lista przycisków reprezentujących dostępne godziny.
  - Kliknięcie danego przycisku inicjuje przejście do formularza rezerwacji, w którym dane (wybrana usługa, data i godzina) są predefiniowane.
- **Zmiana usługi:**  
  - W widoku kalendarza dostępny jest przycisk powrotu do formularza wyboru usługi, umożliwiający zmianę usługi.

## 9. Warunki brzegowe
- **Data:**  
  - Wybrana data musi być w przyszłości i zgodna z formatem ISO8601.
- **Filtry:**  
  - `service_id` musi być poprawnie ustawiony – w przeciwnym razie API zwróci błąd.
- **Dostępność:**  
  - Dni bez dostępnych slotów są oznaczone wizualnie (np. przyciemniony kolor) i nie reagują na kliknięcie.
- **Responsywność:**  
  - Widok kalendarza oraz lista dostępnych slotów muszą być odpowiednio dostosowane do ekranów mobilnych i desktopowych.

## 10. Obsługa błędów
- **Błędy API:**  
  - W przypadku błędów (HTTP 400, 404, 500) stan `error` zostaje ustawiony, a `ErrorNotification` wyświetla odpowiedni komunikat.
- **Inline walidacja:**  
  - Formularz wyboru usługi w `ServiceSelectionForm` sprawdza obowiązkowość wyboru usługi.
  - Komponent `CalendarView` nie umożliwia wyboru dni bez dostępnych slotów.
- **Fallback:**  
  - W sytuacji braku danych, zamiast listy slotów wyświetlany jest `EmptyStateMessage`.

## 11. Kroki implementacji
1. Utworzyć routing widoku pod adresem `/reservations/available` w pliku `src/pages/reservations/available.astro`.
2. Zaimplementować główny komponent `ReservationsAvailableView`, który zarządza stanem widoku (etap wyboru usługi i etap kalendarza) oraz logiką pobierania danych.
3. Utworzyć komponent `ServiceSelectionForm` umożliwiający wybór usługi na podstawie pól: name, description, duration_minutes. Po zatwierdzeniu wyboru, przełączyć widok do kalendarza.
4. Utworzyć komponent `CalendarView`, który:
   - Wyświetla bieżący tydzień (jeden tydzień) z opcjami nawigacji do poprzedniego i następnego tygodnia.
   - Pozwala na wybór miesiąca i roku (domyślnie aktualny miesiąc).
   - Dla każdego dnia wyświetla listę przycisków reprezentujących dostępne godziny, a dni bez dostępnych slotów są oznaczone inaczej i nieaktywne.
   - Udostępnia przycisk powrotu do zmiany usługi.
5. (Opcjonalnie) Utworzyć komponent `ReservationSlotList` do wyświetlania listy slotów dla wybranego dnia, jeśli nie zostanie to obsłużone bezpośrednio w `CalendarView`.
6. Zaimplementować komponent `ReservationSlotItem` do reprezentacji pojedynczego dostępnego slotu (godziny) z callbackiem `onClick` przechodzącym do formularza rezerwacji.
7. Dodać komponenty pomocnicze: `SkeletonLoader`, `ErrorNotification` oraz `EmptyStateMessage`.
8. Utworzyć i wykorzystać customowy hook `useAvailableReservations` do pobierania danych z endpointu `GET /reservations/available` na podstawie aktualnych filtrów i wybranej usługi, oraz grupowania slotów według dat.
9. Zmapować dane otrzymane z API (`AvailableReservationDto`) na model widoku (`AvailableReservationViewModel`) z dodatkowymi polami formatowanymi (displayDate, displayTime).
10. Przetestować interakcje użytkownika: wybór usługi, przegląd kalendarza, nawigację między tygodniami, wybór dnia oraz godziny, obsługę błędów, powrót do zmiany usługi.
11. Zapewnić responsywność widoku przy użyciu Tailwind CSS i komponentów Shadcn/ui, dbając o spójność estetyczną i dostępność.
12. Finalny przegląd kodu, refaktoryzacja oraz integracja widoku z resztą aplikacji przed wdrożeniem.