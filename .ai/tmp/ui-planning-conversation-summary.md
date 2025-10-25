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
  • PATCH `/reservations/{reservationId}`
  • GET/POST `/vehicles`
  • PATCH/DELETE `/vehicles/{vehicleId}`
    
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