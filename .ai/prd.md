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

- ID: US-001
  Tytuł: Przegląd dostępnych terminów
  Opis: Jako klient indywidualny chcę zobaczyć listę dostępnych terminów dla wybranej usługi, aby szybko wybrać dogodny termin.
  Kryteria akceptacji:
  - wyświetlana lista najbliższych dostępnych terminów (np. kolejne 10) w formacie DD.MM.YYYY, HH:MM
  - możliwość filtrowania po rodzaju usługi
  - brak dostępnych terminów wyświetla odpowiedni komunikat

- ID: US-002
  Tytuł: Rezerwacja wizyty
  Opis: Jako klient indywidualny chcę wypełnić formularz rezerwacji i otrzymać potwierdzenie rezerwacji, aby mieć gwarancję terminu.
  Kryteria akceptacji:
  - formularz zawiera wymagane i opcjonalne pola
  - walidacja inline z komunikatami o błędach
  - po zatwierdzeniu wyświetlany jest ekran podsumowania z numerem rezerwacji i możliwością skopiowania linku

- ID: US-003
  Tytuł: Anulowanie rezerwacji
  Opis: Jako klient chcę anulować moją rezerwację, aby zwolnić termin dla innych.
  Kryteria akceptacji:
  - opcja anulowania dostępna na ekranie szczegółów rezerwacji
  - po anulowaniu slot jest natychmiast widoczny w liście dostępnych terminów
  - klient otrzymuje potwierdzenie anulowania

- ID: US-004
  Tytuł: Edycja rezerwacji
  Opis: Jako klient chcę edytować dane mojej rezerwacji (np. zmienić godzinę), aby dostosować termin do moich potrzeb.
  Kryteria akceptacji:
  - klient może zmienić datę, godzinę i usługę przed terminem rezerwacji
  - walidacja zmian zgodnie z dostępnymi slotami
  - potwierdzenie zmian i aktualizacja daty w systemie

- ID: US-005
  Tytuł: Tworzenie rezerwacji przez sekretariat
  Opis: Jako pracownik sekretariatu chcę wprowadzić rezerwację telefoniczną za klienta za pomocą tego samego formularza, aby uprościć proces.
  Kryteria akceptacji:
  - sekretariat używa identycznego formularza jak klient
  - sekcja sekretariatu może wybrać z listy klienta lub wprowadzić dane ręcznie
  - po zatwierdzeniu rezerwacja trafia do systemu i jest widoczna we wszystkich widokach
  - możliwe utworzenie rezerwacji z override (świadome nadpisanie pojemności)

- ID: US-006
  Tytuł: Definiowanie dostępności
  Opis: Jako administrator chcę raz w miesiącu zdefiniować dostępność mechaników i stanowisk, aby zaplanować harmonogram.
  Kryteria akceptacji:
  - administrator wprowadza dni i godziny pracy każdego mechanika i stanowiska
  - system zapisuje harmonogram i udostępnia sloty klientom od 10. dnia miesiąca
  - możliwość edycji harmonogramu przed jego odblokowaniem
  - możliwe jest dodanie wyjątków dla wybranych dni lub godzin
  - klienci widzą listę najbliższych terminów w ustalonym horyzoncie (np. 30 dni)

- ID: US-007
  Tytuł: rekomendacja konserwacji
  Opis: Jako klient chcę otrzymać rekomendację konserwacyjną po rezerwacji, aby wiedzieć o zalecanych przeglądach.
  Kryteria akceptacji:
  - po zakończonej rezerwacji wyświetlana jest rekomendacja w formie tekstu
  - rekomendacja uwzględnia historię napraw z systemu
  - tekst jest sformatowany i czytelny

- ID: US-008
  Tytuł: Dashboard KPI dla sekretariatu
  Opis: Jako pracownik sekretariatu chcę zobaczyć raport liczby anulowanych wizyt z poprzedniego miesiąca, aby monitorować wskaźniki.
  Kryteria akceptacji:
  - dashboard pokazuje liczbę anulowanych wizyt za poprzedni miesiąc
  - widok przedstawia dane w tabeli

- ID: US-009
  Tytuł: Logowanie i autoryzacja
  Opis: Jako użytkownik systemu chcę się zalogować i mieć dostęp zgodny z moją rolą, aby zapewnić bezpieczeństwo danych.
  Kryteria akceptacji:
  - możliwy jest login dla klientów i pracowników sekretariatu
  - klienci widzą tylko swoje rezerwacje
  - sekretariat ma dostęp do wszystkich danych rezerwacji

## 6. Metryki sukcesu

- ponad 50% wszystkich rezerwacji realizowanych online (źródło rezerwacji rejestrowane jako online/telefon)
- liczba anulowanych wizyt poniżej ustalonego progu (monitorowane w dashboardzie)
- brak błędów przy obsłudze 2 jednoczesnych użytkowników
- demo prezentujące scenariusze tworzenia, edycji i anulowania wizyt
