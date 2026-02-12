import type { CostRecord } from '../types.js'
import { calculateCost } from '../pricing/lookup.js'

/**
 * Extract cost info from an OpenAI chat completion response.
 */
export function parseOpenAIResponse(response: any, requestArgs: any[]): CostRecord | null {
  const usage = response?.usage
  if (!usage) return null

  const model: string = response.model || requestArgs[0]?.model || 'unknown'
  const inputTokens = usage.prompt_tokens ?? 0
  const outputTokens = usage.completion_tokens ?? 0

  // OpenAI caching (if available)
  const cacheReadTokens = usage.prompt_tokens_details?.cached_tokens ?? 0

  const cost = calculateCost(model, inputTokens, outputTokens, 0, cacheReadTokens)

  return {
    provider: 'openai',
    model,
    inputTokens,
    outputTokens,
    cacheReadTokens: cacheReadTokens || undefined,
    cost,
    timestamp: Date.now(),
  }
}

/**
 * Extract cost from OpenAI streaming response.
 * OpenAI includes usage in the final chunk when stream_options.include_usage is true.
 */
export function parseOpenAIStreamChunk(chunk: any): { inputTokens: number; outputTokens: number; model: string } | null {
  if (chunk?.usage) {
    return {
      inputTokens: chunk.usage.prompt_tokens ?? 0,
      outputTokens: chunk.usage.completion_tokens ?? 0,
      model: chunk.model || 'unknown',
    }
  }
  return null
}

/**
 * Check if the request args indicate this is a chat completions call.
 */
export function isCompletionRequest(methodPath: string[]): boolean {
  // client.chat.completions.create
  // client.completions.create
  const path = methodPath.join('.')
  return path.includes('completions') && methodPath[methodPath.length - 1] === 'create'
}

/**
 * Check if request args indicate streaming.
 */
export function isStreamingRequest(args: any[]): boolean {
  return args[0]?.stream === true
}
