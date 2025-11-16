# Plan implementacji widoku podsumowania rezerwacji

## 1. Przegląd
Widok podsumowania rezerwacji ma na celu wyświetlenie użytkownikowi potwierdzenia pomyślnej rezerwacji terminu na usługę warsztatową. Prezentuje szczegóły rezerwacji (data, godzina, usługa, mechanik, pojazd), rekomendację konserwacyjną wygenerowaną przez AI na podstawie danych pojazdu i usługi, oraz umożliwia skopiowanie linku do szczegółów rezerwacji. Widok jest końcowym krokiem w procesie rezerwacji dostępnym pod ścieżką `/reservations/available` po pomyślnym utworzeniu rezerwacji.

## 2. Routing widoku
- **Ścieżka:** `/reservations/available` (jako część wieloetapowego formularza w ReservationsAvailableView)
- **Plik strony:** `src/pages/reservations/available.astro` (widok osadzony w istniejącym komponencie ReservationsAvailableView)

## 3. Struktura komponentów
- **ReservationsAvailableView** – główny kontener wieloetapowego formularza rezerwacji, zarządzający krokami procesu.
  - **ReservationConfirmationView** – komponent podsumowania, wyświetlający szczegóły rezerwacji i rekomendację AI.
    - **ReservationDetailsCard** – karta z podstawowymi informacjami o rezerwacji.
    - **RecommendationSection** – sekcja wyświetlająca rekomendację serwisową AI.
    - **ActionButtons** – przyciski do kopiowania linku i nawigacji do listy rezerwacji.

## 4. Szczegóły komponentów
### **ReservationsAvailableView**
- **Opis:** Główny komponent wieloetapowego formularza rezerwacji, rozszerzony o krok podsumowania. Zarządza stanem kroków procesu i danymi rezerwacji.
- **Elementy:** Renderuje odpowiednie komponenty w zależności od currentStep (service-selection, calendar, booking-confirmation, reservation-summary).
- **Obsługiwane zdarzenia:** Przejście między krokami po rezerwacji, ustawienie reservationSummary po pomyślnym POST.
- **Warunki walidacji:** Brak bezpośrednich walidacji; deleguje do podkomponentów.
- **Typy:** `ReservationDto`, `ReservationCreateDto`.
- **Propsy:** Brak (komponent strony).

### **ReservationConfirmationView**
- **Opis:** Komponent podsumowania rezerwacji, wyświetlający potwierdzenie, szczegóły i rekomendację AI. Umożliwia kopiowanie linku i nawigację.
- **Elementy:** Nagłówek potwierdzenia, karta szczegółów rezerwacji, sekcja rekomendacji, przyciski akcji.
- **Obsługiwane zdarzenia:** Kopiowanie linku do schowka, nawigacja do listy rezerwacji.
- **Warunki walidacji:** Sprawdzenie obecności danych rezerwacji (reservation nie null).
- **Typy:** `ReservationDto`.
- **Propsy:** reservation (`ReservationDto`), onBackToReservations (`() => void`).

### **ReservationDetailsCard**
- **Opis:** Karta prezentacyjna wyświetlająca kluczowe szczegóły rezerwacji w czytelnym formacie.
- **Elementy:** Lista pól: data, godzina, usługa, mechanik, pojazd, status.
- **Obsługiwane zdarzenia:** Brak interaktywności.
- **Warunki walidacji:** Brak.
- **Typy:** `ReservationDto`.
- **Propsy:** reservation (`ReservationDto`).

### **RecommendationSection**
- **Opis:** Sekcja wyświetlająca rekomendację serwisową AI, obsługująca długi tekst z możliwością przewijania.
- **Elementy:** Nagłówek, obszar tekstowy z rekomendacją.
- **Obsługiwane zdarzenia:** Brak.
- **Warunki walidacji:** Wyświetlanie fallback tekstu jeśli recommendation_text jest pusty.
- **Typy:** `ReservationDto`.
- **Propsy:** recommendationText (`string`).

### **ActionButtons**
- **Opis:** Zestaw przycisków akcji: kopiowanie linku i nawigacja.
- **Elementy:** Przycisk "Kopiuj link do rezerwacji", przycisk "Przejdź do listy rezerwacji".
- **Obsługiwane zdarzenia:** Kopiowanie URL do schowka z toastem potwierdzenia, nawigacja do `/reservations`.
- **Warunki walidacji:** Przycisk kopiowania aktywny tylko jeśli reservation.id istnieje.
- **Typy:** Brak nowych.
- **Propsy:** reservationId (`string`), onBackToReservations (`() => void`).

## 5. Typy i modele danych
Do implementacji widoku wykorzystywane są istniejące typy z `src/types.ts`:
- `ReservationDto`: Główny typ dla danych rezerwacji, zawierający wszystkie pola potrzebne do wyświetlenia (id, service_name, employee_name, start_ts, end_ts, vehicle_license_plate, status, recommendation_text).

Nie są wymagane nowe typy ViewModel, ponieważ `ReservationDto` zawiera wszystkie potrzebne dane. Dla formatowania daty i godziny można użyć utility functions.

## 6. Zarządzanie stanem
Stan zarządzany w `ReservationsAvailableView` przy użyciu `useState`:
- `currentStep`: Określa aktualny krok procesu ("reservation-summary").
- `reservationSummary`: Przechowuje dane utworzonej rezerwacji (`ReservationDto | null`).
- Po pomyślnym POST /api/reservations, stan aktualizowany na "reservation-summary" z danymi rezerwacji.

Customowy hook `useReservations` nie jest potrzebny, ponieważ dane rezerwacji pochodzą bezpośrednio z odpowiedzi API w procesie tworzenia.

Integracja z OpenRouter: Logika generowania rekomendacji odbywa się po stronie backendu w `reservations.ts`. Frontend tylko odbiera gotową rekomendację w `recommendation_text` i wyświetla ją. W przypadku błędu OpenRouter (np. timeout), endpoint zwraca pusty string lub fallback tekst, który jest obsługiwany w UI.

## 7. Integracja z API
Widok integruje się z istniejącym endpointem POST /api/reservations:
- **Endpoint:** `POST /api/reservations`
- **Typ żądania:** `ReservationCreateDto`
- **Typ odpowiedzi:** `ReservationDto` (zawiera `recommendation_text`)
- **Cel:** Utworzenie rezerwacji z automatycznym wygenerowaniem rekomendacji AI przez OpenRouter.
- **Logika integracji z OpenRouter:** W `reservations.ts`, po walidacji danych, wywoływana jest funkcja `generateRecommendation()` z serwisu `reservationService.ts`, która używa `OpenRouterService` do wysłania zapytania do LLM. Zapytanie zawiera dane pojazdu (marka, model, rok produkcji) i usługi. Odpowiedź (tekst rekomendacji) jest zapisana w `recommendation_text` przed insertem do bazy. Przy błędzie OpenRouter, używany jest fallback tekst. Frontend odbiera kompletną rezerwację z rekomendacją.

## 8. Interakcje użytkownika
- **Wyświetlenie podsumowania:** Po pomyślnej rezerwacji automatyczne przejście do widoku podsumowania.
- **Kopiowanie linku:** Kliknięcie przycisku kopiuje `window.location.origin/reservations/${reservation.id}` do schowka z toastem potwierdzenia.
- **Nawigacja:** Kliknięcie "Przejdź do listy rezerwacji" przekierowuje do `/reservations`.
- **Wyświetlanie rekomendacji:** Rekomendacja zawsze widoczna, nawet przy pustym tekście (fallback).

## 9. Warunki brzegowe
- **Brak rekomendacji:** Jeśli `recommendation_text` jest pusty, wyświetlany jest komunikat fallback (np. "Rekomendacja niedostępna").
- **Błąd API:** Jeśli POST się nie powiedzie, użytkownik pozostaje w poprzednim kroku z komunikatem błędu.
- **Responsywność:** Komponent dostosowuje się do rozmiaru ekranu przy użyciu Tailwind.

## 10. Obsługa błędów
- **Błąd OpenRouter:** Obsługiwany po stronie backendu z fallback tekstem; frontend zawsze otrzymuje `recommendation_text`.
- **Błąd kopiowania:** Jeśli `navigator.clipboard` nie działa (starsze przeglądarki), wyświetlić komunikat o błędzie.
- **Brak danych rezerwacji:** Jeśli `reservationSummary` jest null, nie renderować podsumowania.

## 11. Kroki implementacji
1. Rozszerzyć `ReservationsAvailableView` o nowy stan `reservationSummary` i krok "reservation-summary".
2. Utworzyć komponent `ReservationConfirmationView` z propsami reservation i onBackToReservations.
3. Zaimplementować podkomponenty: `ReservationDetailsCard`, `RecommendationSection`, `ActionButtons`.
4. Zmodyfikować logikę po rezerwacji: zamiast `window.location.href = "/reservations"`, ustawić `currentStep: "reservation-summary"` i `reservationSummary: createdReservation`.
5. Dodać funkcję kopiowania linku z toastem potwierdzenia (wymaga instalacji toast komponentu jeśli nieobecny).
6. Przetestować integrację z OpenRouter: upewnić się, że `recommendation_text` jest obecny w odpowiedzi API.
7. Sprawdzić responsywność i dostępność komponentów.
8. Dodać obsługę fallback dla pustej rekomendacji.
9. Przeprowadzić testy: rezerwacja → podsumowanie → kopiowanie linku → nawigacja.
10. Refaktoryzacja i optymalizacja kodu.
