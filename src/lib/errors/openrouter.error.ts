/**
 * Base OpenRouter error class
 */
export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly details?: unknown,
    public readonly code?: string
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

/**
 * Error for authentication issues with the OpenRouter API
 */
export class OpenRouterAuthError extends OpenRouterError {
  constructor(message: string, details?: unknown) {
    super(message, details, "auth_error");
    this.name = "OpenRouterAuthError";
  }
}

/**
 * Error for rate limiting issues with the OpenRouter API
 */
export class OpenRouterRateLimitError extends OpenRouterError {
  constructor(message: string, details?: unknown) {
    super(message, details, "rate_limit");
    this.name = "OpenRouterRateLimitError";
  }
}

/**
 * Error for validation issues with the OpenRouter API
 */
export class OpenRouterValidationError extends OpenRouterError {
  constructor(message: string, details?: unknown) {
    super(message, details, "validation_error");
    this.name = "OpenRouterValidationError";
  }
}

/**
 * Error for network issues with the OpenRouter API
 */
export class OpenRouterNetworkError extends OpenRouterError {
  constructor(message: string, details?: unknown) {
    super(message, details, "network_error");
    this.name = "OpenRouterNetworkError";
  }
}

/**
 * Error for timeout issues with the OpenRouter API
 */
export class OpenRouterTimeoutError extends OpenRouterError {
  constructor(message: string, details?: unknown) {
    super(message, details, "timeout");
    this.name = "OpenRouterTimeoutError";
  }
}

/**
 * Error for parsing issues with the OpenRouter API responses
 */
export class OpenRouterParsingError extends OpenRouterError {
  constructor(message: string, details?: unknown) {
    super(message, details, "parsing_error");
    this.name = "OpenRouterParsingError";
  }
}
