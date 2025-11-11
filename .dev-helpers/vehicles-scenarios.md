# Scenariusze testowe dla widoku Pojazdy

## Scenariusze użytkownika - Lista pojazdów

### ✅ Scenariusz 1: Ładowanie listy pojazdów
- **Opis**: Użytkownik wchodzi na stronę `/vehicles`
- **Oczekiwany rezultat**: 
  - Wyświetla się skeleton loader
  - Po załadowaniu danych pokazuje się lista pojazdów
  - Widoczna jest paginacja (jeśli więcej niż 1 strona)
  - Panel akcji z przyciskiem "Dodaj pojazd"

### ✅ Scenariusz 2: Stan pusty (brak pojazdów)
- **Opis**: Użytkownik nie ma żadnych pojazdów
- **Oczekiwany rezultat**:
  - Wyświetla się komunikat "Nie masz jeszcze żadnych pojazdów"
  - Przycisk "Dodaj pierwszy pojazd" prowadzi do `/vehicles/new`

### ✅ Scenariusz 3: Responsywność
- **Desktop**: Lista w formie tabeli z kolumnami
- **Mobile**: Lista w formie kart z pełnymi informacjami

### ✅ Scenariusz 4: Paginacja
- **Opis**: Użytkownik ma więcej niż 20 pojazdów
- **Oczekiwany rezultat**:
  - Widoczne są kontrolki paginacji
  - Kliknięcie na numer strony ładuje odpowiednie dane
  - Przyciski "poprzednia"/"następna" działają poprawnie

## Scenariusze użytkownika - Dodawanie pojazdu

### ✅ Scenariusz 5: Dodawanie nowego pojazdu
- **Opis**: Użytkownik klika "Dodaj pojazd" i wypełnia formularz
- **Kroki**:
  1. Klik "Dodaj pojazd" → przekierowanie na `/vehicles/new`
  2. Wypełnienie wymaganych pól (numer rejestracyjny)
  3. Opcjonalne wypełnienie pozostałych pól
  4. Klik "Dodaj pojazd"
- **Oczekiwany rezultat**:
  - Toast z sukcesem
  - Przekierowanie na `/vehicles`
  - Nowy pojazd widoczny na liście

### ✅ Scenariusz 6: Walidacja formularza
- **Opis**: Użytkownik próbuje zapisać formularz z błędami
- **Przypadki testowe**:
  - Pusty numer rejestracyjny → błąd walidacji
  - VIN o nieprawidłowej długości → błąd walidacji
  - Rok produkcji poza zakresem → błąd walidacji
  - Duplikat numeru rejestracyjnego → błąd 409 z API

## Scenariusze użytkownika - Edycja pojazdu

### ✅ Scenariusz 7: Edycja istniejącego pojazdu
- **Opis**: Użytkownik klika "Edytuj" przy pojeździe
- **Kroki**:
  1. Klik "Edytuj" → przekierowanie na `/vehicles/{license_plate}/edit`
  2. Formularz ładuje się z danymi pojazdu
  3. Użytkownik modyfikuje pola
  4. Klik "Zapisz zmiany"
- **Oczekiwany rezultat**:
  - Toast z sukcesem
  - Przekierowanie na `/vehicles`
  - Zaktualizowane dane widoczne na liście

### ✅ Scenariusz 8: Edycja nieistniejącego pojazdu
- **Opis**: Użytkownik próbuje edytować pojazd, który nie istnieje
- **Oczekiwany rezultat**:
  - Komunikat błędu "Pojazd nie został znaleziony"
  - Przycisk powrotu do listy pojazdów

## Scenariusze użytkownika - Usuwanie pojazdu

### ✅ Scenariusz 9: Usuwanie pojazdu bez aktywnych rezerwacji
- **Opis**: Użytkownik klika "Usuń" przy pojeździe
- **Kroki**:
  1. Klik "Usuń" → otwiera się dialog potwierdzenia
  2. Dialog zawiera ostrzeżenia o konsekwencjach
  3. Klik "Usuń pojazd"
- **Oczekiwany rezultat**:
  - Toast z sukcesem
  - Pojazd znika z listy
  - Dialog się zamyka

### ✅ Scenariusz 10: Usuwanie pojazdu z aktywnymi rezerwacjami
- **Opis**: Użytkownik próbuje usunąć pojazd z aktywnymi rezerwacjami
- **Oczekiwany rezultat**:
  - Błąd 409 z API
  - Toast z komunikatem o aktywnych rezerwacjach
  - Pojazd pozostaje na liście

### ✅ Scenariusz 11: Anulowanie usuwania
- **Opis**: Użytkownik otwiera dialog usuwania, ale anuluje
- **Oczekiwany rezultat**:
  - Dialog się zamyka
  - Pojazd pozostaje na liście
  - Brak zmian w stanie aplikacji

## Scenariusze błędów i edge cases

### ✅ Scenariusz 12: Błąd sieci podczas ładowania
- **Opis**: Brak połączenia z internetem lub błąd serwera
- **Oczekiwany rezultat**:
  - Komunikat błędu z przyciskiem "Spróbuj ponownie"
  - Możliwość ponownego załadowania danych

### ✅ Scenariusz 13: Nieautoryzowany dostęp
- **Opis**: Użytkownik nie jest zalogowany
- **Oczekiwany rezultat**:
  - Przekierowanie na stronę logowania
  - Brak wyświetlania danych pojazdów

### ✅ Scenariusz 14: Próba edycji cudzego pojazdu
- **Opis**: Użytkownik próbuje edytować pojazd innego użytkownika
- **Oczekiwany rezultat**:
  - Błąd 403 z API
  - Komunikat o braku uprawnień

## Integracja z innymi modułami

### ✅ Scenariusz 15: Integracja z rezerwacjami
- **Opis**: Pojazdy dodane w tym module są dostępne w formularzu rezerwacji
- **Oczekiwany rezultat**:
  - Nowo dodane pojazdy pojawiają się w liście wyboru podczas tworzenia rezerwacji
  - Usunięte pojazdy znikają z listy wyboru

## Testy wydajności

### ✅ Scenariusz 16: Duża liczba pojazdów
- **Opis**: Użytkownik ma więcej niż 100 pojazdów
- **Oczekiwany rezultat**:
  - Paginacja działa poprawnie
  - Ładowanie kolejnych stron jest szybkie
  - Brak problemów z wydajnością

## Testy dostępności

### ✅ Scenariusz 17: Nawigacja klawiaturą
- **Opis**: Użytkownik nawiguje tylko za pomocą klawiatury
- **Oczekiwany rezultat**:
  - Wszystkie interaktywne elementy są dostępne przez Tab
  - Focus jest widoczny
  - Enter/Space aktywują przyciski

### ✅ Scenariusz 18: Screen reader
- **Opis**: Użytkownik korzysta z czytnika ekranu
- **Oczekiwany rezultat**:
  - Wszystkie elementy mają odpowiednie aria-labels
  - Struktura jest logiczna dla czytnika
  - Komunikaty o błędach są ogłaszane

## Status implementacji

- ✅ Wszystkie komponenty zaimplementowane
- ✅ API endpointy gotowe i przetestowane
- ✅ Walidacja formularzy działająca
- ✅ Obsługa błędów zaimplementowana
- ✅ Responsywność zapewniona
- ✅ Accessibility uwzględnione
- ✅ Integracja z toast notifications
- ✅ Paginacja zunifikowana z resztą aplikacji
