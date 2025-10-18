// src/lib/groq.ts
import Groq from "groq-sdk";
import { env } from "./env";

// Initialize Groq client
export const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});

// Available Groq models
export const GROQ_MODELS = {
  "llama-3.1-405b-reasoning": "llama-3.1-405b-reasoning", // Most capable reasoning model
  "llama-3.1-70b-versatile": "llama-3.1-70b-versatile",   // Fast and versatile
  "llama-3.1-8b-instant": "llama-3.1-8b-instant",         // Fastest model
  "llama3-groq-70b-8192-tool-use-preview": "llama3-groq-70b-8192-tool-use-preview", // Tool use
  "llama3-groq-8b-8192-tool-use-preview": "llama3-groq-8b-8192-tool-use-preview",   // Tool use (faster)
  "mixtral-8x7b-32768": "mixtral-8x7b-32768",             // Mixtral model
  "gemma-7b-it": "gemma-7b-it",                           // Google Gemma
  "gemma2-9b-it": "gemma2-9b-it",                         // Google Gemma 2
} as const;

export type GroqModel = keyof typeof GROQ_MODELS;

// Model display names for UI
export const GROQ_MODEL_NAMES: Record<GroqModel, { name: string; description: string; maxTokens: number }> = {
  "llama-3.1-405b-reasoning": {
    name: "Llama 3.1 405B Reasoning",
    description: "Most capable model for complex reasoning tasks",
    maxTokens: 8192
  },
  "llama-3.1-70b-versatile": {
    name: "Llama 3.1 70B Versatile", 
    description: "Fast and versatile model for most tasks",
    maxTokens: 32768
  },
  "llama-3.1-8b-instant": {
    name: "Llama 3.1 8B Instant",
    description: "Fastest model for simple tasks",
    maxTokens: 8192
  },
  "llama3-groq-70b-8192-tool-use-preview": {
    name: "Llama 3 70B Tool Use",
    description: "Optimized for function calling and tool use",
    maxTokens: 8192
  },
  "llama3-groq-8b-8192-tool-use-preview": {
    name: "Llama 3 8B Tool Use",
    description: "Fast tool use model",
    maxTokens: 8192
  },
  "mixtral-8x7b-32768": {
    name: "Mixtral 8x7B",
    description: "Mixture of experts model",
    maxTokens: 32768
  },
  "gemma-7b-it": {
    name: "Gemma 7B",
    description: "Google's Gemma model",
    maxTokens: 8192
  },
  "gemma2-9b-it": {
    name: "Gemma 2 9B",
    description: "Google's Gemma 2 model",
    maxTokens: 8192
  },
};

// Chat completion interface matching OpenAI format
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionRequest {
  model: GroqModel;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
  stop?: string | string[];
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Create chat completion using Groq
export async function createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
  try {
    const response = await groq.chat.completions.create({
      model: GROQ_MODELS[request.model],
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens ?? 1024,
      top_p: request.top_p ?? 0.9,
      stream: request.stream ?? false,
      stop: request.stop,
    });

    return response as ChatCompletionResponse;
  } catch (error) {
    console.error("Groq API error:", error);
    throw new Error(
      error instanceof Error 
        ? `Groq API Error: ${error.message}` 
        : "Unknown Groq API error"
    );
  }
}

// Stream chat completion
export async function createStreamingChatCompletion(request: ChatCompletionRequest) {
  try {
    const stream = await groq.chat.completions.create({
      ...request,
      model: GROQ_MODELS[request.model],
      stream: true,
    });

    return stream;
  } catch (error) {
    console.error("Groq streaming API error:", error);
    throw new Error(
      error instanceof Error 
        ? `Groq Streaming API Error: ${error.message}` 
        : "Unknown Groq streaming API error"
    );
  }
}

// Helper function to estimate tokens (rough estimation)
export function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token for most models
  return Math.ceil(text.length / 4);
}

// Helper function to validate model
export function isValidGroqModel(model: string): model is GroqModel {
  return model in GROQ_MODELS;
}