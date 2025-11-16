# Podsumowanie pozostałych błędów lintera

## Status naprawy
Data: 16 listopada 2025

### ✅ Naprawione (z ~1871 błędów do 85)
1. **prettier/prettier** - Wszystkie błędy formatowania (cudzysłowy, białe znaki, średniki) - ~1758 błędów
2. **no-console** (klienckie) - Usunięto console.log/error z 9 komponentów klienckich

### ❌ Pozostałe błędy: 85 (67 errors, 18 warnings)

---

## Kategorie błędów do naprawy przez kolejny agent

### 1. TypeScript `any` types - 47 wystąpień ⚠️ PRIORYTET
**Typ:** @typescript-eslint/no-explicit-any  
**Trudność:** Średnia-Wysoka

#### Pliki testowe (37 wystąpień):
- `src/lib/services/__tests__/reservationAvailabilityService.test.ts` - 35 wystąpień
- `src/hooks/__tests__/useAuthRedirect.test.ts` - 6 wystąpień  
- `src/components/reservations/available/__tests__/ReservationsAvailableView.test.tsx` - 1 wystąpienie
- `src/pages/api/__tests__/reservations-available.test.ts` - 2 wystąpienia
- `src/test/setup.ts` - 2 wystąpienia
- `src/test/supabase-mocks.ts` - 1 wystąpienie

#### Pliki produkcyjne (10 wystąpień):
- `src/components/vehicles/hooks/useVehicleForm.ts:212` - 1 wystąpienie
- `src/components/reservations/available/hooks/useAvailableReservations.ts:31` - 1 wystąpienie
- `src/hooks/useApiWithRetry.ts` - 2 wystąpienia (linie 17, 69)
- `src/hooks/useAuthRedirect.ts` - 2 wystąpienia (linie 4, 5)
- `src/hooks/useBookingState.ts:115` - 1 wystąpienie

**Instrukcje:**
- W testach: Zdefiniować odpowiednie typy zamiast `any` (np. `unknown`, konkretne interfejsy)
- W kodzie produkcyjnym: **OBOWIĄZKOWO** zdefiniować właściwe typy
- Przykład: `(error: any)` → `(error: Error | unknown)` lub stwórz dedykowany interface

---

### 2. Accessibility (a11y) - 3 błędy ⚠️ PRIORYTET  
**Typ:** jsx-a11y/label-has-associated-control  
**Trudność:** Łatwa

**Plik:** `src/components/reservations/EditReservationDialog.tsx` (linie 233, 259, 285)

**Problem:** Elementy `<label>` nie są powiązane z kontrolkami formularza

**Rozwiązanie:**
```tsx
// ❌ Źle
<label>Pojazd</label>
<select>...</select>

// ✅ Dobrze - opcja 1 (htmlFor + id)
<label htmlFor="vehicle">Pojazd</label>
<select id="vehicle">...</select>

// ✅ Dobrze - opcja 2 (zagnieżdżenie)
<label>
  Pojazd
  <select>...</select>
</label>
```

---

### 3. Console statements (Backend) - 18 warnings ℹ️ NISKI PRIORYTET
**Typ:** no-console  
**Trudność:** Łatwa (ale wymaga decyzji)

#### E2E testy (7 wystąpień) - DO ZOSTAWIENIA
- `e2e/auth.setup.ts` - 3 wystąpienia
- `e2e/global-teardown.ts` - 4 wystąpienia

**Akcja:** Dodać `/* eslint-disable no-console */` na początku plików testowych

#### API routes (10 wystąpień) - DO ZOSTAWIENIA LUB ZASTĄPIENIA
- `src/pages/api/auth/forgot-password.ts` - 2 wystąpienia
- `src/pages/api/auth/login.ts` - 2 wystąpienia
- `src/pages/api/auth/logout.ts` - 1 wystąpienie
- `src/pages/api/auth/register.ts` - 1 wystąpienie
- `src/pages/api/reservations.ts` - 1 wystąpienie
- `src/pages/api/services.ts` - 2 wystąpienia

**Decyzja do podjęcia:**
1. Zostawić `console.error` w API routes (backend logging) + dodać `eslint-disable`
2. LUB zastąpić systemem logowania (np. `pino`, `winston`)

#### Hook (1 wystąpienie) - DO USUNIĘCIA
- `src/components/vehicles/hooks/useVehicleDelete.ts:61` - console.error do usunięcia

---

### 4. Unused variables - 3 błędy
**Typ:** @typescript-eslint/no-unused-vars  
**Trudność:** Bardzo łatwa

**Pliki:**
- `src/components/reservations/ReservationDetailView.tsx:49` - `error` (2 wystąpienia, linie 49 i 65)
- `src/components/reservations/available/__tests__/ReservationsAvailableView.test.tsx:3` - `fireEvent`

**Rozwiązanie:**
```typescript
// ❌
catch (error) { ... }

// ✅ Jeśli nie używamy error
catch { ... }

// ✅ Jeśli chcemy go mieć ale nie używać
catch (_error) { ... }
```

---

### 5. Astro parsing errors - 4 błędy ⚠️ PRIORYTET
**Typ:** prettier/prettier - Parsing error: Unexpected token  
**Trudność:** Średnia

**Pliki:**
- `src/components/shared/Navigation.astro:130`
- `src/pages/vehicles.astro:15`
- `src/pages/vehicles/[license_plate]/edit.astro:32`
- `src/pages/vehicles/new.astro:20`

**Możliwe przyczyny:**
1. Składnia JSX wewnątrz Astro nieprawidłowo sformatowana
2. Konflikt prettier z formatowaniem Astro
3. Brakujące nawiasy/cudzysłowy w specific locations

**Akcja:**
1. Sprawdzić każdy plik w podanych liniach
2. Upewnić się, że składnia jest zgodna z Astro
3. Może być potrzebna ręczna naprawa lub dodanie `prettier-ignore`

---

### 6. TypeScript strict mode issues - 3 błędy
**Typ:** Różne  
**Trudność:** Średnia

#### 6.1 Non-null assertion (1 błąd)
- `src/components/vehicles/hooks/useVehicleForm.ts:170`
- **Problem:** `licensePlate!` - używanie `!` jest zabronione
- **Rozwiązanie:** 
```typescript
// ❌
const endpoint = `/api/vehicles/${licensePlate!}`;

// ✅
if (!licensePlate) throw new Error("License plate is required");
const endpoint = `/api/vehicles/${licensePlate}`;
```

#### 6.2 Dynamic delete (1 błąd)
- `src/components/vehicles/hooks/useVehicleForm.ts:188`
- **Problem:** `delete payload[key]` - dynamiczne usuwanie właściwości
- **Rozwiązanie:**
```typescript
// ❌
delete payload[key as keyof typeof payload];

// ✅
const { [key]: _, ...rest } = payload;
return rest;

// LUB
const cleaned = { ...payload };
if ('key' in cleaned) {
  const { key, ...rest } = cleaned;
  return rest;
}
```

#### 6.3 Unnecessary try/catch (1 błąd)
- `src/hooks/useApiWithRetry.ts:70`
- **Problem:** `try { throw } catch { throw }` - niepotrzebne
- **Rozwiązanie:** Usunąć wrapper jeśli tylko przekazuje błąd wyżej

---

### 7. React Hooks - 1 warning
**Typ:** react-hooks/exhaustive-deps  
**Trudność:** Średnia

**Plik:** `src/components/reservations/available/hooks/useAvailableReservations.ts:121`

**Problem:** Hook `useCallback` ma brakujące zależności: `onError`, `onLoading`, `onSuccess`

**Rozwiązanie:**
```typescript
// Opcja 1: Dodać do dependency array
useCallback(() => { ... }, [onError, onLoading, onSuccess, ...])

// Opcja 2: Jeśli są stabilne, użyć useRef
const onLoadingRef = useRef(onLoading);
useEffect(() => { onLoadingRef.current = onLoading; }, [onLoading]);

// Opcja 3: Dodać eslint-disable jeśli jest to zamierzone
// eslint-disable-next-line react-hooks/exhaustive-deps
```

---

### 8. React Compiler - 1 błąd
**Typ:** react-compiler/react-compiler  
**Trudność:** Wysoka

**Plik:** `src/hooks/useAuthRedirect.ts:22`

**Problem:** Pisanie do zmiennej zdefiniowanej poza komponentem/hookiem

**Rozwiązanie:**
- Użyć `useEffect` lub innego mechanizmu React
- Przenieść zmienną do state lub ref
- Sprawdzić czy zmienna powinna być globalnym stanem (context, zustand)

---

## Podsumowanie priorytetów

### 🔴 WYSOKI PRIORYTET (do naprawy w pierwszej kolejności)
1. **Astro parsing errors** (4) - blokuje formatowanie
2. **TypeScript any w kodzie produkcyjnym** (10) - bezpieczeństwo typów
3. **Accessibility issues** (3) - ważne dla użytkowników

### 🟡 ŚREDNI PRIORYTET
4. **TypeScript strict mode** (3) - jakość kodu
5. **React Hooks dependencies** (1) - potencjalne bugi
6. **React Compiler** (1) - optymalizacja

### 🟢 NISKI PRIORYTET
7. **TypeScript any w testach** (37) - można zostawić na później
8. **Unused variables** (3) - kosmetyka
9. **Console statements** (18) - wymaga decyzji strategicznej

---

## Szacowany czas naprawy
- **Wysoki priorytet:** 2-3 godziny
- **Średni priorytet:** 1-2 godziny  
- **Niski priorytet:** 1-2 godziny (jeśli się zdecydujemy naprawiać)

**TOTAL:** ~4-7 godzin pracy

---

## Rekomendacje

1. **Rozpocznij od Astro parsing errors** - napraw te 4 błędy, by prettier działał poprawnie
2. **Następnie TypeScript any** - zacznij od kodu produkcyjnego (10 plików)
3. **Popraw accessibility** - 3 proste zmiany w jednym pliku
4. **Pozostałe według uznania** - można część zaakceptować przez eslint-disable

## Komendy pomocnicze

```bash
# Sprawdź aktualny stan
npm run lint

# Auto-fix co się da
npm run lint -- --fix

# Sprawdź tylko błędy (bez warnings)
npm run lint -- --quiet

# Sprawdź konkretny plik
npx eslint src/path/to/file.ts
```
