import type { ModelPricing } from '../types.js'

/**
 * Built-in pricing table for 50+ models.
 * Prices are per 1M tokens in USD.
 * Last updated: 2026-02-12
 *
 * Sources: OpenAI, Anthropic, Google official pricing pages
 */
export const defaultPricing: Record<string, ModelPricing> = {
  // ===== OpenAI =====
  // GPT-4.1 family
  'gpt-4.1': { input: 2.0, output: 8.0, cacheRead: 0.5 },
  'gpt-4.1-mini': { input: 0.4, output: 1.6, cacheRead: 0.1 },
  'gpt-4.1-nano': { input: 0.1, output: 0.4, cacheRead: 0.025 },

  // GPT-4o family
  'gpt-4o': { input: 2.5, output: 10.0, cacheRead: 1.25 },
  'gpt-4o-2024-11-20': { input: 2.5, output: 10.0, cacheRead: 1.25 },
  'gpt-4o-2024-08-06': { input: 2.5, output: 10.0, cacheRead: 1.25 },
  'gpt-4o-2024-05-13': { input: 5.0, output: 15.0 },
  'gpt-4o-mini': { input: 0.15, output: 0.6, cacheRead: 0.075 },
  'gpt-4o-mini-2024-07-18': { input: 0.15, output: 0.6, cacheRead: 0.075 },

  // o-series reasoning
  'o1': { input: 15.0, output: 60.0, cacheRead: 7.5 },
  'o1-2024-12-17': { input: 15.0, output: 60.0, cacheRead: 7.5 },
  'o1-mini': { input: 1.1, output: 4.4, cacheRead: 0.55 },
  'o1-mini-2024-09-12': { input: 1.1, output: 4.4, cacheRead: 0.55 },
  'o1-pro': { input: 150.0, output: 600.0 },
  'o3': { input: 2.0, output: 8.0, cacheRead: 0.5 },
  'o3-mini': { input: 1.1, output: 4.4, cacheRead: 0.55 },
  'o4-mini': { input: 1.1, output: 4.4, cacheRead: 0.275 },

  // GPT-4 Turbo
  'gpt-4-turbo': { input: 10.0, output: 30.0 },
  'gpt-4-turbo-2024-04-09': { input: 10.0, output: 30.0 },
  'gpt-4-turbo-preview': { input: 10.0, output: 30.0 },

  // GPT-4
  'gpt-4': { input: 30.0, output: 60.0 },
  'gpt-4-0613': { input: 30.0, output: 60.0 },
  'gpt-4-32k': { input: 60.0, output: 120.0 },

  // GPT-3.5
  'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
  'gpt-3.5-turbo-0125': { input: 0.5, output: 1.5 },
  'gpt-3.5-turbo-1106': { input: 1.0, output: 2.0 },

  // Embeddings
  'text-embedding-3-small': { input: 0.02, output: 0 },
  'text-embedding-3-large': { input: 0.13, output: 0 },
  'text-embedding-ada-002': { input: 0.1, output: 0 },

  // ===== Anthropic =====
  // Claude 4 family
  'claude-opus-4-20250514': { input: 15.0, output: 75.0, cacheWrite: 18.75, cacheRead: 1.5 },
  'claude-sonnet-4-20250514': { input: 3.0, output: 15.0, cacheWrite: 3.75, cacheRead: 0.3 },

  // Claude 3.7
  'claude-3-7-sonnet-20250219': { input: 3.0, output: 15.0, cacheWrite: 3.75, cacheRead: 0.3 },
  'claude-3-7-sonnet-latest': { input: 3.0, output: 15.0, cacheWrite: 3.75, cacheRead: 0.3 },

  // Claude 3.5 family
  'claude-3-5-sonnet-20241022': { input: 3.0, output: 15.0, cacheWrite: 3.75, cacheRead: 0.3 },
  'claude-3-5-sonnet-20240620': { input: 3.0, output: 15.0, cacheWrite: 3.75, cacheRead: 0.3 },
  'claude-3-5-sonnet-latest': { input: 3.0, output: 15.0, cacheWrite: 3.75, cacheRead: 0.3 },
  'claude-3-5-haiku-20241022': { input: 0.8, output: 4.0, cacheWrite: 1.0, cacheRead: 0.08 },
  'claude-3-5-haiku-latest': { input: 0.8, output: 4.0, cacheWrite: 1.0, cacheRead: 0.08 },

  // Claude 3 family
  'claude-3-opus-20240229': { input: 15.0, output: 75.0, cacheWrite: 18.75, cacheRead: 1.5 },
  'claude-3-opus-latest': { input: 15.0, output: 75.0, cacheWrite: 18.75, cacheRead: 1.5 },
  'claude-3-sonnet-20240229': { input: 3.0, output: 15.0 },
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25, cacheWrite: 0.3, cacheRead: 0.03 },

  // ===== Google =====
  'gemini-2.0-flash': { input: 0.1, output: 0.4 },
  'gemini-2.0-flash-lite': { input: 0.075, output: 0.3 },
  'gemini-1.5-pro': { input: 1.25, output: 5.0 },
  'gemini-1.5-flash': { input: 0.075, output: 0.3 },
  'gemini-1.0-pro': { input: 0.5, output: 1.5 },

  // ===== DeepSeek =====
  'deepseek-chat': { input: 0.27, output: 1.1, cacheRead: 0.07 },
  'deepseek-reasoner': { input: 0.55, output: 2.19, cacheRead: 0.14 },
}
