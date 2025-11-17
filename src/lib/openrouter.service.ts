import {
  OpenRouterAuthError,
  OpenRouterError,
  OpenRouterNetworkError,
  OpenRouterParsingError,
  OpenRouterRateLimitError,
  OpenRouterTimeoutError,
  OpenRouterValidationError,
} from "./errors/openrouter.error";
import type {
  ApiResponse,
  JSONSchema,
  Message,
  ModelParameters,
  OpenRouterServiceOptions,
  RequestPayload,
} from "./openrouter.types";

/**
 * OpenRouter Service for integrating with LLM models through OpenRouter API
 *
 * This service handles communication with the OpenRouter API, allowing for
 * automatic generation of responses based on system and user messages,
 * while processing structured JSON responses.
 */
export class OpenRouterService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly defaultModel: string;
  private readonly defaultModelParameters: ModelParameters;
  private readonly timeout: number;
  private readonly retries: number;
  private readonly maxTokens: number;
  private readonly rateLimitPerMinute: number;
  private readonly requestTimestamps: number[] = [];

  private currentSystemMessage: string | null = null;
  private currentUserMessage: string | null = null;
  private currentResponseFormat: JSONSchema | null = null;
  private currentModelName: string;
  private currentModelParameters: ModelParameters;

  /**
   * Creates a new OpenRouter service instance
   *
   * @param options Configuration options for the service
   * @throws {OpenRouterValidationError} If the API key is missing or invalid
   */
  constructor(options: OpenRouterServiceOptions) {
    // Validate API key
    if (!options.apiKey || options.apiKey.trim() === "") {
      throw new OpenRouterValidationError("API key is required");
    }

    // Initialize API configuration
    this.apiKey = options.apiKey;
    this.apiUrl = options.apiUrl || "https://openrouter.ai/api/v1/chat/completions";
    this.defaultModel = options.defaultModel || "openai/o3-mini";
    this.defaultModelParameters = {
      temperature: 0.7,
      top_p: 1.0,
      frequency_penalty: 0,
      presence_penalty: 0,
      ...options.defaultModelParameters,
    };
    this.timeout = options.timeout || 30000; // 30 seconds default
    this.retries = options.retries || 3;
    this.maxTokens = options.maxTokens || 4096; // Default max tokens
    this.rateLimitPerMinute = options.rateLimitPerMinute || 60; // Default rate limit

    // Set current model to default
    this.currentModelName = this.defaultModel;
    this.currentModelParameters = { ...this.defaultModelParameters };
  }

  /**
   * Sets the system message to be used in API requests
   *
   * @param message The system message content
   * @throws {OpenRouterValidationError} If the message is empty or exceeds token limit
   */
  public setSystemMessage(message: string): void {
    if (!message || message.trim() === "") {
      throw new OpenRouterValidationError("System message cannot be empty");
    }

    // Sanitize input by removing any potential script tags or dangerous content
    const sanitizedMessage = this.sanitizeInput(message);
    this.currentSystemMessage = sanitizedMessage;
  }

  /**
   * Sets the user message to be used in API requests
   *
   * @param message The user message content
   * @throws {OpenRouterValidationError} If the message is empty or exceeds token limit
   */
  public setUserMessage(message: string): void {
    if (!message || message.trim() === "") {
      throw new OpenRouterValidationError("User message cannot be empty");
    }

    // Sanitize input by removing any potential script tags or dangerous content
    const sanitizedMessage = this.sanitizeInput(message);
    this.currentUserMessage = sanitizedMessage;
  }

  /**
   * Sets the JSON schema for structured responses
   *
   * @param schema JSON Schema for response format
   * @throws {OpenRouterValidationError} If the schema is invalid
   */
  public setResponseFormat(schema: JSONSchema): void {
    if (!schema || typeof schema !== "object") {
      throw new OpenRouterValidationError("Response format schema must be a valid JSON object");
    }
    this.currentResponseFormat = schema;
  }

  /**
   * Sets the model and its parameters
   *
   * @param name Model name to use
   * @param parameters Model parameters configuration
   * @throws {OpenRouterValidationError} If the model name is empty
   */
  public setModel(name: string, parameters: ModelParameters = {}): void {
    if (!name || name.trim() === "") {
      throw new OpenRouterValidationError("Model name cannot be empty");
    }

    this.currentModelName = name;
    this.currentModelParameters = {
      ...this.defaultModelParameters,
      ...parameters,
    };
  }

  /**
   * Sets model parameters without changing the current model
   *
   * @param parameters Model parameters configuration to merge with current parameters
   */
  public setModelParameters(parameters: ModelParameters): void {
    this.currentModelParameters = {
      ...this.currentModelParameters,
      ...parameters,
    };
  }

  /**
   * Sends a chat message to the OpenRouter API
   *
   * @param userMessage The user message to send (overrides any previously set user message)
   * @returns Promise with the API response
   * @throws {OpenRouterValidationError} If validation fails
   * @throws {OpenRouterRateLimitError} If rate limit is exceeded
   * @throws {OpenRouterAuthError} If authentication fails
   * @throws {OpenRouterNetworkError} If network issues occur
   * @throws {OpenRouterTimeoutError} If the request times out
   * @throws {OpenRouterParsingError} If response parsing fails
   * @throws {OpenRouterError} For other errors
   */
  public async sendChatMessage<T = unknown>(userMessage?: string): Promise<T> {
    // Check rate limiting before proceeding
    this.checkRateLimit();

    // Override current user message if provided
    if (userMessage !== undefined) {
      this.setUserMessage(userMessage);
    }

    // Validate that we have a user message
    if (!this.currentUserMessage) {
      throw new OpenRouterValidationError("User message is required");
    }

    // Build the request payload
    const requestPayload = this.buildRequestPayload();

    // Execute the request
    const response = await this.executeRequest(requestPayload);

    // Record this request timestamp for rate limiting
    this.recordRequestTimestamp();

    // Extract and parse the content from the response
    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new OpenRouterParsingError("Empty response from API");
    }

    // If we have a response format, parse the content as JSON
    if (this.currentResponseFormat) {
      try {
        return JSON.parse(content) as T;
      } catch {
        throw new OpenRouterParsingError("Failed to parse JSON response", { content });
      }
    }

    // Otherwise return the content as is
    return content as unknown as T;
  }

  /**
   * Builds the request payload for the API call
   *
   * @returns The formatted request payload
   * @private
   */
  private buildRequestPayload(): RequestPayload {
    const messages: Message[] = [];

    // Add system message if available
    if (this.currentSystemMessage) {
      messages.push({
        role: "system",
        content: this.currentSystemMessage,
      });
    }

    // Add user message
    messages.push({
      role: "user",
      content: this.currentUserMessage as string,
    });

    // Build the payload
    const payload: RequestPayload = {
      model: this.currentModelName,
      messages,
      ...this.currentModelParameters,
    };

    // Add response format if specified
    if (this.currentResponseFormat) {
      payload.response_format = {
        type: "json_object",
        schema: this.currentResponseFormat,
      };
    }

    // Add max tokens if not already specified in parameters
    if (this.maxTokens && !payload.max_tokens) {
      payload.max_tokens = this.maxTokens;
    }

    return payload;
  }

  /**
   * Executes the API request with retry logic
   *
   * @param requestPayload The payload to send to the API
   * @returns Promise with the API response
   * @private
   */
  private async executeRequest(requestPayload: RequestPayload): Promise<ApiResponse> {
    let lastError: Error | null = null;
    let attempt = 0;

    // Implement retry logic with exponential backoff
    while (attempt < this.retries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(this.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": "https://garage-pro.app", // Add your app's domain
            "X-Title": "Garage Pro", // Add your app's name
          },
          body: JSON.stringify(requestPayload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle HTTP errors based on status code
        if (!response.ok) {
          const errorText = await response.text();
          const status = response.status;
          const errorDetails = { status, body: errorText };

          // Handle specific error types based on status code
          switch (true) {
            case status === 401:
              throw new OpenRouterAuthError("Authentication failed", errorDetails);
            case status === 403:
              throw new OpenRouterAuthError("API key does not have permission", errorDetails);
            case status === 429:
              throw new OpenRouterRateLimitError("Rate limit exceeded", errorDetails);
            case status >= 400 && status < 500:
              throw new OpenRouterValidationError(`Request validation failed: ${status}`, errorDetails);
            case status >= 500:
              throw new OpenRouterError(`Server error: ${status}`, errorDetails, status.toString());
            default:
              throw new OpenRouterError(`Unknown error: ${status}`, errorDetails, status.toString());
          }
        }

        // Parse response
        const data = await response.json();
        return data as ApiResponse;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // If it's an abort error (timeout), don't retry
        if (lastError.name === "AbortError") {
          throw new OpenRouterTimeoutError("Request timed out", { timeout: this.timeout });
        }

        // For network errors or 5xx status codes, retry with exponential backoff
        const isRetryableError =
          lastError instanceof TypeError || // Network error
          (lastError instanceof OpenRouterError && lastError.code && parseInt(lastError.code, 10) >= 500);

        if (!isRetryableError) {
          // Convert network errors to our custom error type
          if (lastError instanceof TypeError) {
            throw new OpenRouterNetworkError("Network error", { originalError: lastError.message });
          }
          throw lastError;
        }

        // Calculate backoff delay: 2^attempt * 100ms with jitter
        const delay = Math.min(Math.pow(2, attempt) * 100 + Math.random() * 100, 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));

        attempt++;
      }
    }

    // If we've exhausted all retries
    if (lastError instanceof TypeError) {
      throw new OpenRouterNetworkError("Network error after multiple retries", {
        retries: this.retries,
        originalError: lastError.message,
      });
    }
    throw lastError || new OpenRouterError("Request failed after multiple retries");
  }

  /**
   * Sanitizes user input to prevent injection attacks
   *
   * @param input The input string to sanitize
   * @returns The sanitized input string
   * @private
   */
  private sanitizeInput(input: string): string {
    // Basic sanitization to prevent script injection
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+=/gi, "");
  }

  /**
   * Records the current timestamp for rate limiting
   *
   * @private
   */
  private recordRequestTimestamp(): void {
    const now = Date.now();
    this.requestTimestamps.push(now);
    const oneMinuteAgo = now - 60000;
    while (this.requestTimestamps.length > 0 && this.requestTimestamps[0] < oneMinuteAgo) {
      this.requestTimestamps.shift();
    }
  }

  /**
   * Checks if the current request would exceed the rate limit
   *
   * @throws {OpenRouterRateLimitError} If rate limit would be exceeded
   * @private
   */
  private checkRateLimit(): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Clean up old timestamps
    while (this.requestTimestamps.length > 0 && this.requestTimestamps[0] < oneMinuteAgo) {
      this.requestTimestamps.shift();
    }

    // Check if we would exceed the rate limit
    if (this.requestTimestamps.length >= this.rateLimitPerMinute) {
      const oldestTimestamp = this.requestTimestamps[0];
      const resetTime = oldestTimestamp + 60000;
      const waitTimeMs = resetTime - now;

      throw new OpenRouterRateLimitError("Rate limit exceeded", {
        limit: this.rateLimitPerMinute,
        resetInMs: waitTimeMs,
        resetAt: new Date(resetTime).toISOString(),
      });
    }
  }
}

/**
 * Creates a new OpenRouter service instance with the provided options
 *
 * This factory function is the recommended way to create an OpenRouter service.
 * It handles the creation of the service with the provided options and ensures
 * that the API key is properly set.
 *
 * @param options Configuration options for the service
 * @returns A configured OpenRouter service instance
 * @throws {OpenRouterValidationError} If the API key is missing or invalid
 *
 * @example
 * ```typescript
 * // Create a service with API key from environment variable
 * const openRouter = createOpenRouterService({
 *   apiKey: import.meta.env.OPENROUTER_API_KEY,
 * });
 *
 * // Set system and user messages
 * openRouter.setSystemMessage("You are a helpful assistant.");
 * openRouter.setUserMessage("What is the capital of France?");
 *
 * // Send the chat message and get the response
 * const response = await openRouter.sendChatMessage();
 * console.log(response); // "The capital of France is Paris."
 * ```
 */
export function createOpenRouterService(options: OpenRouterServiceOptions): OpenRouterService {
  // Use API key from environment variable if not provided
  if (!options.apiKey) {
    if (typeof import.meta.env.OPENROUTER_API_KEY === "string") {
      options.apiKey = import.meta.env.OPENROUTER_API_KEY;
    } else {
      throw new OpenRouterValidationError(
        "API key is required. Either provide it in options or set OPENROUTER_API_KEY environment variable."
      );
    }
  }
  return new OpenRouterService(options);
}
