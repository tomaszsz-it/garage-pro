# 🧪 Testing Guide - Garage Pro

## 📋 Przegląd

Projekt używa nowoczesnego stosu testowego:
- **Vitest** - testy jednostkowe z natywnym wsparciem TypeScript i ESM
- **React Testing Library** - testowanie komponentów React 19 z naciskiem na UX
- **Playwright** - cross-browser testy end-to-end (Chromium/Desktop Chrome)
- **jsdom** - środowisko DOM dla testów jednostkowych

## 🚀 Szybki start

### Testy jednostkowe (Vitest)

```bash
# Uruchom testy w trybie watch
npm run test

# Uruchom testy jednokrotnie
npm run test:run

# Uruchom testy z interfejsem UI
npm run test:ui

# Uruchom testy z coverage
npm run test:coverage
```

### Testy E2E (Playwright)

```bash
# Uruchom testy e2e
npm run test:e2e

# Uruchom testy z interfejsem UI
npm run test:e2e:ui

# Uruchom testy w trybie headed (z widoczną przeglądarką)
npm run test:e2e:headed

# Debug testy krok po kroku
npm run test:e2e:debug
```

## 📁 Struktura plików

```
src/
├── test/
│   ├── setup.ts              # Globalna konfiguracja testowa
│   ├── test-utils.tsx         # Utility do renderowania z providerami
│   └── supabase-mocks.ts      # Mocki dla Supabase
├── components/
│   └── **/*.test.tsx          # Testy komponentów obok kodu
e2e/
├── pages/                     # Page Object Model classes
├── tests/                     # Pliki testów e2e
├── global-setup.ts            # Globalna konfiguracja przed testami
└── global-teardown.ts         # Cleanup po testach
```

## 🎯 Najlepsze praktyki

### Testy jednostkowe

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const mockFn = vi.fn();
    render(<MyComponent onClick={mockFn} />);
    
    await userEvent.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalledOnce();
  });
});
```

### Testy E2E z Page Object Model

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test('should navigate to vehicles', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.navigateToVehicles();
  
  await expect(page).toHaveURL(/.*\/vehicles/);
});
```

## 🔧 Konfiguracja

### Vitest (`vitest.config.ts`)
- Environment: jsdom
- Coverage: v8 provider
- UI mode włączony
- Globalne setupy i mocki

### Playwright (`playwright.config.ts`)
- Tylko Chromium/Desktop Chrome
- Page Object Model
- Trace viewer dla debugowania
- Screenshot/video tylko przy błędach

## 🏭 Mocki i Test Doubles

### Supabase Client
```typescript
import { createMockSupabaseClient } from '@/test/supabase-mocks';

const mockSupabase = createMockSupabaseClient();
mockSupabase.from.mockReturnValue({
  select: vi.fn().mockResolvedValue({ data: [], error: null }),
});
```

### Globalne mocki (automatyczne)
- `window.matchMedia`
- `ResizeObserver`
- `IntersectionObserver`
- `localStorage` / `sessionStorage`
- `fetch`

## 📊 Coverage

Skonfigurowane progi coverage:
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## 🐛 Debug i troubleshooting

### Vitest
```bash
# UI mode dla wizualnego debugowania
npm run test:ui

# Watch mode z filtrowaniem
npm run test -- --reporter=verbose --run --filter="MyComponent"
```

### Playwright
```bash
# Debug mode krok po kroku  
npm run test:e2e:debug

# Headed mode z widoczną przeglądarką
npm run test:e2e:headed

# Trace viewer po testach
npx playwright show-trace test-results/trace.zip
```

## 📝 Pisanie nowych testów

1. **Testy jednostkowe**: umieść obok komponentu z rozszerzeniem `.test.tsx`
2. **Testy E2E**: dodaj do `e2e/tests/` z rozszerzeniem `.spec.ts`
3. **Page Objects**: dodaj do `e2e/pages/` dla nowych stron
4. **Mocki**: rozszerz `src/test/` o nowe utility

## ⚡ Performance

- Testy jednostkowe używają równoległego wykonania (threads)
- Testy E2E: równoległe na CI, sekwencyjne lokalnie
- Watch mode dla szybkiego feedback podczas rozwoju
