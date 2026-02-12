import type { CostRecord } from '../types.js'
import { calculateCost } from '../pricing/lookup.js'

/**
 * Extract cost info from an Anthropic message response.
 */
export function parseAnthropicResponse(response: any, requestArgs: any[]): CostRecord | null {
  const usage = response?.usage
  if (!usage) return null

  const model: string = response.model || requestArgs[0]?.model || 'unknown'
  const inputTokens = usage.input_tokens ?? 0
  const outputTokens = usage.output_tokens ?? 0
  const cacheWriteTokens = usage.cache_creation_input_tokens ?? 0
  const cacheReadTokens = usage.cache_read_input_tokens ?? 0

  const cost = calculateCost(model, inputTokens, outputTokens, cacheWriteTokens, cacheReadTokens)

  return {
    provider: 'anthropic',
    model,
    inputTokens,
    outputTokens,
    cacheWriteTokens: cacheWriteTokens || undefined,
    cacheReadTokens: cacheReadTokens || undefined,
    cost,
    timestamp: Date.now(),
  }
}

/**
 * Check if the method path indicates a messages.create call.
 */
export function isMessageRequest(methodPath: string[]): boolean {
  // client.messages.create
  const path = methodPath.join('.')
  return path.includes('messages') && methodPath[methodPath.length - 1] === 'create'
}

/**
 * Check if request args indicate streaming.
 */
export function isStreamingRequest(args: any[]): boolean {
  return args[0]?.stream === true
}
