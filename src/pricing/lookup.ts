import type { ModelPricing } from '../types.js'
import { defaultPricing } from './models.js'
import { getConfig } from '../store.js'

/**
 * Look up pricing for a model. Custom pricing overrides built-in.
 */
export function getModelPricing(model: string): ModelPricing | null {
  const { customPricing } = getConfig()

  // Check custom pricing first
  if (customPricing?.[model]) {
    return customPricing[model]
  }

  // Check built-in pricing
  if (defaultPricing[model]) {
    return defaultPricing[model]
  }

  return null
}

/**
 * Calculate cost for a single API call.
 */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cacheWriteTokens = 0,
  cacheReadTokens = 0,
): number {
  const pricing = getModelPricing(model)
  if (!pricing) return 0

  let cost = 0
  cost += (inputTokens / 1_000_000) * pricing.input
  cost += (outputTokens / 1_000_000) * pricing.output

  if (cacheWriteTokens > 0 && pricing.cacheWrite) {
    cost += (cacheWriteTokens / 1_000_000) * pricing.cacheWrite
  }
  if (cacheReadTokens > 0 && pricing.cacheRead) {
    cost += (cacheReadTokens / 1_000_000) * pricing.cacheRead
  }

  return cost
}
