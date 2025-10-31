# OpenRouter Service Implementation Plan

## 1. Opis usługi

Usługa OpenRouter ma na celu integrację z interfejsem API OpenRouter w celu wzbogacenia czatów opartych na LLM. Umożliwia wymianę komunikatów pomiędzy systemem a użytkownikiem, przetwarzanie ustrukturyzowanych odpowiedzi oraz konfigurowanie parametrów modeli.

## 2. Opis konstruktora

Konstruktor usługi powinien inicjalizować podstawowe ustawienia:
- Ustawienie adresu API OpenRouter.
- Konfigurację domyślnych parametrów modeli (nazwa modelu, parametry, schemat odpowiedzi).
- Inicjalizację modułów logiki komunikacji (system message, user message, handler response_format).

## 3. Publiczne metody i pola

**Publiczne metody:**
1. `sendRequest(message: string, context?: object): Promise<Response>`
   - Wysyła zapytanie do API OpenRouter, przetwarza odpowiedź i zwraca wynik.

2. `configure(options: ConfigOptions): void`
   - Umożliwia konfigurację usługi, w tym ustawienie nazwy modelu i parametrów modelu.

3. `setResponseFormat(format: ResponseFormat): void`
   - Ustawia schemat odpowiedzi (`response_format`) zgodnie z ustalonym wzorem.

**Publiczne pola:**
- `apiEndpoint: string` - Adres endpointa API OpenRouter.
- `modelName: string` - Nazwa wykorzystywanego modelu.
- `modelParams: object` - Parametry konfiguracyjne modelu (np. temperatura, maksymalna liczba tokenów).

## 4. Prywatne metody i pola

**Prywatne metody:**
1. `_preparePayload(systemMessage: string, userMessage: string): object`
   - Dokonuje strukturyzacji danych, łącząc komunikat systemowy, komunikat użytkownika, ustawienia response_format oraz konfigurację modelu.

2. `_handleResponse(response: any): any`
   - Przetwarza odpowiedź z API, walidując ją względem przyjętego schematu odpowiedzi.

**Prywatne pola:**
- `_defaultResponseFormat` - Domyślny schemat odpowiedzi, np.: 
  ```
  { type: json_schema, json_schema: { name: OpenRouterResponse, strict: true, schema: { result: string, metadata: { timestamp: number } } } }
  ```
- `_httpClient` - Instancja klienta HTTP do komunikacji z API.

## 5. Obsługa błędów

**Potencjalne scenariusze błędów:**
1. Błąd połączenia z API OpenRouter.
   - Rozwiązanie: Implementacja mechanizmu ponawiania (retry logic) oraz fallback do komunikatu o błędzie.

2. Niepoprawny format odpowiedzi.
   - Rozwiązanie: Walidacja odpowiedzi z użyciem wspólnego schematu JSON (`json_schema`), logowanie błędów i zwrócenie komunikatu o niezgodności.

3. Błąd walidacji wejściowych danych.
   - Rozwiązanie: Weryfikacja danych wejściowych przed wysłaniem żądania, stosowanie walidatorów schematów.

4. Błąd konfiguracyjny.
   - Rozwiązanie: Zastosowanie mechanizmu fallback oraz wartości domyślnych.

## 6. Kwestie bezpieczeństwa

- Uwierzytelnianie API: Wymaganie bezpiecznego połączenia (HTTPS), implementacja tokenów uwierzytelniających.
- Walidacja i sanityzacja danych: Dokładna walidacja danych wejściowych i odpowiedzi, aby zapobiec atakom typu injection.
- Logowanie i monitorowanie: Pełne logowanie błędów oraz nieautoryzowanych prób dostępu.
- Ograniczenie dostępu: Ograniczenie dostępu do kluczowych konfiguracji oraz danych wrażliwych.

## 7. Plan wdrożenia krok po kroku

1. **Analiza wymagań i konfiguracja**
   - Zapoznanie się z dokumentacją API OpenRouter.
   - Ustalenie parametrów: `apiEndpoint`, `modelName`, `modelParams` oraz `response_format`.

2. **Implementacja modułu komunikacji**
   - Implementacja metody `sendRequest` przy użyciu `_httpClient`.
   - Testowanie połączenia z API w środowisku deweloperskim.

3. **Konfiguracja payload i schematu odpowiedzi**
   - Implementacja `_preparePayload` w celu strukturyzacji danych:
     - Komunikat systemowy: np. "System: Przetwarzanie zapytania"
     - Komunikat użytkownika: przekazany z interfejsu
     - Response_format zgodny z wzorem: 
       { type: json_schema, json_schema: { name: OpenRouterResponse, strict: true, schema: { result: string, metadata: { timestamp: number } } } }
     - Nazwa modelu: np. "gpt-4-openrouter"
     - Parametry modelu: np. { temperature: 0.5, max_tokens: 150 }

4. **Implementacja publicznych interfejsów**
   - Utworzenie metod `configure` i `setResponseFormat`.



6. **Obsługa błędów i logowanie**
   - Implementacja mechanizmów ponawiania próby połączenia oraz logowania błędów.


