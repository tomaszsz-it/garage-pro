/**
 * JSON Schema type for response format
 */
export type JSONSchema = Record<string, unknown>;

/**
 * Model parameters configuration
 */
export interface ModelParameters {
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  max_tokens?: number;
}

/**
 * Message role types
 */
export type MessageRole = "system" | "user" | "assistant";

/**
 * Message structure for OpenRouter API
 */
export interface Message {
  role: MessageRole;
  content: string;
}

/**
 * Request payload for OpenRouter API
 */
export interface RequestPayload {
  model: string;
  messages: Message[];
  response_format?: {
    type: "json_object";
    schema?: JSONSchema;
  };
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  max_tokens?: number;
}

/**
 * API response structure
 */
export interface ApiResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: {
    index: number;
    message: {
      role: MessageRole;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Configuration options for OpenRouter service
 *
 * @property apiKey - The API key for OpenRouter
 * @property apiUrl - The base URL for the OpenRouter API (defaults to "https://openrouter.ai/api/v1/chat/completions")
 * @property defaultModel - The default model to use (defaults to "openai/gpt-3.5-turbo")
 * @property defaultModelParameters - Default parameters for the model
 * @property timeout - Request timeout in milliseconds (defaults to 30000)
 * @property retries - Number of retries for failed requests (defaults to 3)
 * @property maxTokens - Maximum number of tokens to generate (defaults to 4096)
 * @property rateLimitPerMinute - Maximum number of requests per minute (defaults to 60)
 */
export interface OpenRouterServiceOptions {
  apiKey: string;
  apiUrl?: string;
  defaultModel?: string;
  defaultModelParameters?: ModelParameters;
  timeout?: number;
  retries?: number;
  maxTokens?: number;
  rateLimitPerMinute?: number;
}

