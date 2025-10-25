Jesteś wykwalifikowanym architektem frontend, którego zadaniem jest stworzenie kompleksowej architektury interfejsu użytkownika w oparciu o dokument wymagań produktu (PRD), plan API i notatki z sesji planowania. Twoim celem jest zaprojektowanie struktury interfejsu użytkownika, która skutecznie spełnia wymagania produktu, jest zgodna z możliwościami API i zawiera spostrzeżenia z sesji planowania.

Najpierw dokładnie przejrzyj następujące dokumenty:

Dokument wymagań produktu (PRD):
<prd>
{{prd}} <- zamień na referencję do @prd.md
</prd>

Plan API:
<api_plan>
{{api-plan}} <- zamień na referencję do @api-plan.md
</api_plan>

Session Notes:
<session_notes>
<conversation_summary>
<decisions>
1. Aplikacja będzie miała widoki: Auth, lista rezerwacji, wyszukiwanie dostępnych rezerwacji oraz panel zarządzania autami.  
2. Jednolity ekran logowania (bez rejestracji).  
3. Lista rezerwacji z paginacją (limit 20), filtrem wg numeru rejestracyjnego, przyciskami „Anuluj”, „Szukaj dostępnych” i „Dodaj auto”.  
4. Formularz tworzenia rezerwacji – wszystkie pola na jednej stronie z walidacją inline.  
5. Widok szczegółów rezerwacji z przyciskami „Edytuj”, „Anuluj” oraz dialogiem potwierdzenia.  
6. Błędy krytyczne wyświetlane inline, niekrytyczne i komunikaty sukcesu w postaci toastów (top-right, 5 s, zielony/czerwony).  
7. Responsywność: desktop – tabela, mobile – karty, realizowane klasami Tailwind (`md:hidden`/`hidden md:block`) i komponentami Shadcn/UI.  
8. Dostępność na poziomie WCAG AA: aria-label, focus management, odpowiednie kontrasty.  
9. Zarządzanie stanem: React hooks i Context (ewentualnie Zustand później).  
10. Zakres MVP: tylko rola zalogowanego użytkownika (bez sekretariatu).

</decisions>
<matched_recommendations>
1. Użycie layoutu z publicznym `/login` i chronionymi trasami oraz persistent Header z linkami „Rezerwacje”, „Moje auta”, „Wyloguj”.  
2. Panel filtrów nad listą dostępnych terminów (dropdowny + pola daty).  
3. Komponenty Shadcn/UI: Table, Card, SkeletonLoader, InlineAlert, Toast, Dialog.  
4. Tabela ↔ karty responsywne (Tailwind + Shadcn/UI).  
5. Walidacja inline przy formularzach i dialog potwierdzenia akcji.  
6. Toasty dla sukcesów i niekrytycznych błędów (top-right, 5 s, kolorystyka).  
7. React hooks + Context do fetchowania i synchronizacji stanu list.  
8. Obsługa stanów ładowania: `isLoading`, dezaktywacja przycisków, spinner w buttonach.  
9. InlineAlert dla błędów HTTP 400/401/403/409/500; przekierowanie do `/login` przy 401/403.  
10. Ukrywanie akcji tylko dla właściciela zasobów (warunkowe renderowanie w oparciu o token/rola).

</matched_recommendations>
<ui_architecture_planning_summary>
**Główne wymagania UI**  
- Ekran logowania, chronione trasy dla rezerwacji i panelu aut.  
- CRUD rezerwacji: lista z paginacją i filtrami, wyszukiwanie dostępnych slotów, tworzenie rezerwacji, edycja, anulowanie.  
- Zarządzanie autami: lista, dodawanie, edycja.

**Kluczowe widoki i przepływy**  
1. `/login` → po uwierzytelnieniu → `/reservations` (lista rezerwacji).  
2. `/reservations`: filtr wg auta, akcje: anuluj, przejdź do `/reservations/available`, dodaj auto.  
3. `/reservations/available`: wybór terminu i rezerwacja (POST).  
4. `/vehicles`: panel aut z dodawaniem i edycją (GET/POST/DELETE).

**Integracja z API i zarządzanie stanem**  
- Endpoints:  
  • GET `/reservations` (page, limit, filter)  
  • GET `/reservations/available` (service_id, start_ts, end_ts, limit)  
  • POST `/reservations` (service_id, vehicle_license_plate, employee_id, start_ts, end_ts)
  • PATCH `/reservations/{id}`
  • GET/POST `/vehicles`
  • PATCH/DELETE `/vehicles/{license_plate}`
    
- Stan: `useState` + `useContext` do przechowywania tokenu i roli oraz aktualnych list; ręczne refetch po mutacjach.

**Responsywność i dostępność**  
- Desktop: tabela z sorted columns, Mobile: karty wertykalne (data/godzina, auto, usługa, przyciski).  
- Tailwind breakpoints (`sm`, `md`, `lg`) + Shadcn/UI.  
- WCAG AA: aria-label, logiczne kolejności fokusu, wysokie kontrasty.

**Bezpieczeństwo i autoryzacja**  
- Token JWT (do wdrożenia na póżniejszym etapie projektu) i (opcjonalnie) rola w Context.  
- Warunkowe renderowanie przycisków tylko dla właściciela.  
- Obsługa błędów 401/403: inline alert + przekierowanie do logowania.

</ui_architecture_planning_summary>
<unresolved_issues>
- Dokładne reguły walidacji formularza auta (komunikaty, pola wymagane).  
- Wybór konkretnej biblioteki DatePicker/TimePicker i jej integracja.  

- Mechanizm refetch list po mutacjach (React Query vs manual fetch).  
- Obsługa błędów sieciowych/offline (ErrorBoundary, banner „Brak połączenia”).  
</unresolved_issues>
Dodatkowo:
- Użyć lekkiego DatePicker i ograniczeniem wybieralnych dat na podstawie danych z API.
- Dodać globalny ErrorBoundary (React) i banner/toast „Brak połączenia” dla network error, by użytkownik wiedział, że musi odświeżyć.
</conversation_summary>
</session_notes>

Twoim zadaniem jest stworzenie szczegółowej architektury interfejsu użytkownika, która obejmuje niezbędne widoki, mapowanie podróży użytkownika, strukturę nawigacji i kluczowe elementy dla każdego widoku. Projekt powinien uwzględniać doświadczenie użytkownika, dostępność i bezpieczeństwo.

Wykonaj następujące kroki, aby ukończyć zadanie:

1. Dokładnie przeanalizuj PRD, plan API i notatki z sesji.
2. Wyodrębnij i wypisz kluczowe wymagania z PRD.
3. Zidentyfikuj i wymień główne punkty końcowe API i ich cele.
4. Utworzenie listy wszystkich niezbędnych widoków na podstawie PRD, planu API i notatek z sesji.
5. Określenie głównego celu i kluczowych informacji dla każdego widoku.
6. Zaplanuj podróż użytkownika między widokami, w tym podział krok po kroku dla głównego przypadku użycia.
7. Zaprojektuj strukturę nawigacji.
8. Zaproponuj kluczowe elementy interfejsu użytkownika dla każdego widoku, biorąc pod uwagę UX, dostępność i bezpieczeństwo.
9. Rozważ potencjalne przypadki brzegowe lub stany błędów.
10. Upewnij się, że architektura interfejsu użytkownika jest zgodna z planem API.
11. Przejrzenie i zmapowanie wszystkich historyjek użytkownika z PRD do architektury interfejsu użytkownika.
12. Wyraźne mapowanie wymagań na elementy interfejsu użytkownika.
13. Rozważ potencjalne punkty bólu użytkownika i sposób, w jaki interfejs użytkownika je rozwiązuje.

Dla każdego głównego kroku pracuj wewnątrz tagów <ui_architecture_planning> w bloku myślenia, aby rozbić proces myślowy przed przejściem do następnego kroku. Ta sekcja może być dość długa. To w porządku, że ta sekcja może być dość długa.

Przedstaw ostateczną architekturę interfejsu użytkownika w następującym formacie Markdown:

```markdown
# Architektura UI dla [Nazwa produktu]

## 1. Przegląd struktury UI

[Przedstaw ogólny przegląd struktury UI]

## 2. Lista widoków

[Dla każdego widoku podaj:
- Nazwa widoku
- Ścieżka widoku
- Główny cel
- Kluczowe informacje do wyświetlenia
- Kluczowe komponenty widoku
- UX, dostępność i względy bezpieczeństwa]

## 3. Mapa podróży użytkownika

[Opisz przepływ między widokami i kluczowymi interakcjami użytkownika]

## 4. Układ i struktura nawigacji

[Wyjaśnij, w jaki sposób użytkownicy będą poruszać się między widokami]

## 5. Kluczowe komponenty

[Wymień i krótko opisz kluczowe komponenty, które będą używane w wielu widokach].
```

Skup się wyłącznie na architekturze interfejsu użytkownika, podróży użytkownika, nawigacji i kluczowych elementach dla każdego widoku. Nie uwzględniaj szczegółów implementacji, konkretnego projektu wizualnego ani przykładów kodu, chyba że są one kluczowe dla zrozumienia architektury.

Końcowy rezultat powinien składać się wyłącznie z architektury UI w formacie Markdown w języku polskim, którą zapiszesz w pliku .ai/ui-plan.md. Nie powielaj ani nie powtarzaj żadnej pracy wykonanej w bloku myślenia.