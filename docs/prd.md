# Dokument wymagań produktu (PRD) - Warsztat

## 1. Przegląd produktu

Warsztat to aplikacja webowa umożliwiająca klientom indywidualnym szybkie wyszukanie dostępnego terminu na proste naprawy samochodowe (np. wymiana oleju) i dokonanie rezerwacji mechanika wraz z miejscem w warsztacie. Sekretariat może nadal obsługiwać rezerwacje telefoniczne za pomocą tego samego interfejsu. Panel administracyjny umożliwia ręczne planowanie dostępności mechaników i stanowisk raz w miesiącu. System generuje rekomendacje konserwacyjne na podstawie historii napraw i danych auta.

## 2. Problem użytkownika

Klienci mają trudności z szybkim znalezieniem wolnego terminu na proste naprawy samochodowe. Sekretariat warsztatu jest obciążone obsługą wszystkich rezerwacji telefonicznych. Właściciel warsztatu potrzebuje sposobu na automatyzację i optymalne wypełnienie godzin pracy mechaników bez dodatkowego zaangażowania w proces rezerwacji.

## 3. Wymagania funkcjonalne

1. Wyszukiwanie dostępnych terminów
   - lista dostępnych terminów u wszystkich mechaników
   - filtr po rodzaju usługi 
2. Rezerwacja wizyty
   - formularz dla zalogowanego użytkownika; wymagane: rodzaj usługi, data, godzina, wybór auta - numer rejestracyjny. Dane kontaktowe i auta (opcjonalne: VIN, marka, model, rok, typ silnika)  pobierane z konta; 
   - walidacja inline z czytelnymi komunikatami
3. Zarządzanie rezerwacjami (CRUD)
   - klient może tworzyć, edytować i anulować własne rezerwacje
   - sekretariat może tworzyć, edytować, usuwać i anulować dowolne wizyty
   - natychmiastowe zwolnienie slotu po anulowaniu
4. Panel administracyjny
   - definiowanie dostępności mechaników i stanowisk raz w miesiącu
   - domyślne godziny pracy (8:00-16:00, pn–pt)
   - odblokowanie harmonogramu na kolejny miesiąc 10. dnia każdego miesiąca
5. Rekomendacje konserwacyjne AI
   -  sugestie dotyczące przeglądów i wymiany filtrów, wyświetlane po rezerwacji (np. na ekranie podsumowania)
   - uwzględnienie historii napraw z systemu
6. Dashboard KPI
   - raport liczby anulowanych wizyt z poprzedniego miesiąca
7. Uwierzytelnianie i autoryzacja
   - klienci indywidualni widzą i zarządzają wyłącznie własnymi wizytami
   - sekretariat posiada dostęp do wszystkich rezerwacji

## 4. Granice produktu

W MVP nie uwzględniamy:
- dedykowanych stanowisk do specjalistycznych napraw
- złożonych napraw wymagających więcej niż jednego mechanika
- aplikacji mobilnych
- integracji z zewnętrznymi kalendarzami i serwisami
- powiadomień push, SMS, e-mail i działań marketingowych
- monitorowania dokładności rekomendacji
- audytu zmian i historii edycji
- testów obciążeniowych i skalowania powyżej dwóch jednoczesnych użytkowników

## 5. Historyjki użytkowników

- ID: US-000
  Tytuł: Przegląd swoich rezerwacji
  Opis: Jako klient indywidualny chcę zobaczyć listę zaplanowanych i historycznych rezerwacji.
  Kryteria akceptacji:
  - wyświetlana lista rezerwacji
  - możliwość filtrowania po pojeżdzie, rodzaju usługi
  - możliwość przejścia do ekranu szczegółów rezerwacji
  - możliwośc przejścia do ekranu przeglądu dostępnych terminów (US-001) w celu utworzenia nowej rezerwacji
  - funkcjonalność przeglądu i edycji swoich rezerwacji nie jest dostępna bez logowania się do systemu (US-010).

- ID: US-001
  Tytuł: Przegląd dostępnych terminów
  Opis: Jako klient indywidualny chcę zobaczyć listę dostępnych terminów dla wybranej usługi, aby szybko wybrać dogodny termin.
  Kryteria akceptacji:
  - wyświetlana lista najbliższych dostępnych terminów (np. kolejne 10) w formacie DD.MM.YYYY, HH:MM
  - możliwość filtrowania po rodzaju usługi
  - brak dostępnych terminów wyświetla odpowiedni komunikat
  - funkcjonalność przeglądu terminów jest dostępna bez logowania się do systemu (US-009).

  <scope_update>
  Zakładam endpoint GET /reservations/available przy użyciu query parameters: serviceId, start_ts, end_ts.
  </scope_update>

- ID: US-002
  Tytuł: Rezerwacja wizyty
  Opis: Jako klient indywidualny chcę wypełnić formularz rezerwacji i otrzymać potwierdzenie rezerwacji, aby mieć gwarancję terminu.
  Kryteria akceptacji:
  - formularz zawiera wymagane i opcjonalne pola
  - walidacja inline z komunikatami o błędach
  - po zatwierdzeniu wyświetlany jest ekran podsumowania z numerem rezerwacji i możliwością skopiowania linku
  - funkcjonalność rezerwacji nie jest dostępna bez logowania się do systemu (US-010).
  - zakładam endpoint POST /reservations z użyciem standardowej walidacji danych wejściowych.

- ID: US-003
  Tytuł: Anulowanie rezerwacji
  Opis: Jako klient chcę anulować moją rezerwację, aby zwolnić termin dla innych.
  Kryteria akceptacji:
  - opcja anulowania dostępna na ekranie szczegółów rezerwacji
  - po anulowaniu slot jest natychmiast widoczny w liście dostępnych terminów
  - klient otrzymuje potwierdzenie anulowania
  - funkcjonalność anulowania rezerwacji nie jest dostępna bez logowania się do systemu (US-010).
  - zakładam, że anulowanie rezerwacji będzie realizowane poprzez aktualizację flagi rezerwacji przy użyciu endpointu PATCH /reservations, ustawiając status na 'Cancelled'.

- ID: US-004
  Tytuł: Edycja rezerwacji
  Opis: Jako klient chcę edytować dane mojej rezerwacji (np. zmienić godzinę), aby dostosować termin do moich potrzeb.
  Kryteria akceptacji:
  - klient może zmienić datę, godzinę i usługę przed terminem rezerwacji
  - walidacja zmian zgodnie z dostępnymi slotami
  - potwierdzenie zmian i aktualizacja daty w systemie
  - funkcjonalność edycji swoich rezerwacji nie jest dostępna bez logowania się do systemu (US-010).

- ID: US-005
  Tytuł: CRUD dla pojazdów 
  Opis: Jako klient chcę przeglądać, dodawać, edytować, usuwać swoje pojazdy dla których będę mógł dokonac rezerwacji.
  Kryteria akceptacji:
  - Po dodaniu pojazdu, jest on automatycznie dostepny dla rezerwacji
  - funkcjonalność przeglądu dodawania i edycji swoich pojazdów  nie jest dostępna bez logowania się do systemu (US-010).

- ID: US-006
  Tytuł: Definiowanie dostępności
  Opis: Jako administrator chcę raz w miesiącu zdefiniować dostępność mechaników i stanowisk, aby zaplanować harmonogram.
  Kryteria akceptacji:
  - administrator wprowadza dni i godziny pracy każdego mechanika
  - zakładam że w MVP właściciel warsztatu jest również administratorem systemu i może sam wykonać insert do bazy danych. 
  - w zakresie MVP jest wyprodukowanie skryptu bazodanowego odpowiedzialnego za utworzenie 3 mechaników z ich losowymi danymi ale imionami Mechanik1 Mechanik2 Mechanik3 oraz charmongramu dostepności w pracy we wszystkie dni robocze w Polsce roku 2025 i 2026

- ID: US-007
  Tytuł: rekomendacja konserwacji
  Opis: Jako klient chcę otrzymać rekomendację konserwacyjną po rezerwacji, aby wiedzieć o zalecanych przeglądach.
  Kryteria akceptacji:
  - po zakończonej rezerwacji wyświetlana jest rekomendacja w formie tekstu
  - rekomendacja uwzględnia historię napraw z systemu
  - tekst jest sformatowany i czytelny
  - W MVP nie jest analizowana hostoria serwisowa, natomiast wysyłane jest zapytanie do modelu LLM a danymi auta, rokiem produkcji oraz aktualna data. Na tej podstawie klient dostaje rekomendację, np. jeśli wizyta jest rok po dacie produkcji auta oraz auto ma przjejechane tylko 15000 km, nie ma sensu propozycja wymiany filtra paliwa, ale to AI już lepiej wie, co doradzić w takiej sytuacji

- ID: US-009
  Tytuł: Logowanie i autoryzacja
  Opis: Jako użytkownik systemu chcę się zalogować i mieć dostęp zgodny z moją rolą, aby zapewnić bezpieczeństwo danych.
  Kryteria akceptacji:
  - możliwy jest login dla klientów
  - klienci widzą tylko swoje rezerwacje
  - sekretariat ma dostęp do wszystkich danych rezerwacji, sekretariat jest poza MVP

- US-010: Bezpieczny dostęp i uwierzytelnianie
  Tytuł: Bezpieczny dostęp
  Opis: Jako użytkownik chcę mieć możliwość rejestracji i logowania się do systemu w sposób zapewniający bezpieczeństwo moich danych.
  Kryteria akceptacji:
  - Logowanie i rejestracja odbywają się na dedykowanych stronach.
  - Logowanie wymaga podania adresu email i hasła.
  - Rejestracja wymaga podania adresu email, hasła i potwierdzenia hasła.
  - Użytkownik MOŻE korzystać z funkcji wyszukiwania dostepnych terminów bez logowania się do systemu (US-002).
  - Użytkownik NIE MOŻE korzystać z funkcji przeglądu dodawania i edycji rezerwacji bez logowania się do systemu (US-000, US-002, US-003, US-004).
  - Użytkownik NIE MOŻE korzystać z funkcji przeglądu dodawania i edycji pojazdów bez logowania się do systemu (US-005).
  - Użytkownik może logować się do systemu poprzez przycisk w prawym górnym rogu.
  - Użytkownik może się wylogować z systemu poprzez przycisk w prawym górnym rogu w głównym @Layout.astro.
  - Nie korzystamy z zewnętrznych serwisów logowania (np. Google, GitHub).
  - Odzyskiwanie hasła powinno być możliwe.

## 6. Metryki sukcesu

- Brak błędów podczas obsługi 10 jednoczesnych użytkowników.
- Brak przestojów w pracy mechaników.
- Zmniejszenie liczby nieodwołanych wizyt.
