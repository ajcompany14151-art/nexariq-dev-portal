// src/lib/lynxa.ts
export const LYNXA_MODELS = {
  "lynxa-pro": "lynxa-pro",
} as const;

export type LynxaModel = keyof typeof LYNXA_MODELS;

// Model display names for UI
export const LYNXA_MODEL_NAMES: Record<LynxaModel, { name: string; description: string; maxTokens: number }> = {
  "lynxa-pro": {
    name: "Lynxa Pro",
    description: "Advanced AI assistant developed by Nexariq (AJ STUDIOZ) - Powered by cutting-edge language models",
    maxTokens: 4096
  },
};

// Chat completion interface
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionRequest {
  model: LynxaModel;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created?: number;
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
  developer?: string;
  user?: string;
}

// Helper function to validate model
export function isValidLynxaModel(model: string): model is LynxaModel {
  return model in LYNXA_MODELS;
}

// Helper function to estimate tokens (rough estimation)
export function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token for most models
  return Math.ceil(text.length / 4);
}