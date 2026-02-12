/**
 * Per-1M tokens pricing for a model.
 */
export interface ModelPricing {
  /** Cost per 1M input tokens in USD */
  input: number
  /** Cost per 1M output tokens in USD */
  output: number
  /** Cost per 1M cache write tokens (optional) */
  cacheWrite?: number
  /** Cost per 1M cache read tokens (optional) */
  cacheRead?: number
}

/**
 * Record of a single LLM API call with cost information.
 */
export interface CostRecord {
  provider: string
  model: string
  inputTokens: number
  outputTokens: number
  cacheWriteTokens?: number
  cacheReadTokens?: number
  cost: number
  timestamp: number
}

/**
 * Aggregated cost summary.
 */
export interface CostSummary {
  totalCost: number
  totalRequests: number
  totalInputTokens: number
  totalOutputTokens: number
  byModel: Record<string, {
    cost: number
    requests: number
    inputTokens: number
    outputTokens: number
  }>
  byProvider: Record<string, {
    cost: number
    requests: number
  }>
}

/**
 * Configuration options for ai-spend.
 */
export interface AiSpendConfig {
  /** Disable console output (default: false) */
  silent?: boolean
  /** Custom pricing overrides: { "gpt-4o": { input: 2.5, output: 10 } } */
  customPricing?: Record<string, ModelPricing>
}
