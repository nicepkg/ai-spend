import type { CostRecord, CostSummary, AiSpendConfig } from './types.js'

/**
 * In-memory store for all cost records.
 */
const records: CostRecord[] = []
let config: AiSpendConfig = {}

export function getConfig(): AiSpendConfig {
  return config
}

export function setConfig(newConfig: AiSpendConfig): void {
  config = { ...config, ...newConfig }
}

export function addRecord(record: CostRecord): void {
  records.push(record)
}

export function getRecords(): readonly CostRecord[] {
  return records
}

export function clearRecords(): void {
  records.length = 0
}

export function getSummary(): CostSummary {
  const summary: CostSummary = {
    totalCost: 0,
    totalRequests: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    byModel: {},
    byProvider: {},
  }

  for (const r of records) {
    summary.totalCost += r.cost
    summary.totalRequests += 1
    summary.totalInputTokens += r.inputTokens
    summary.totalOutputTokens += r.outputTokens

    // by model
    if (!summary.byModel[r.model]) {
      summary.byModel[r.model] = { cost: 0, requests: 0, inputTokens: 0, outputTokens: 0 }
    }
    const m = summary.byModel[r.model]
    m.cost += r.cost
    m.requests += 1
    m.inputTokens += r.inputTokens
    m.outputTokens += r.outputTokens

    // by provider
    if (!summary.byProvider[r.provider]) {
      summary.byProvider[r.provider] = { cost: 0, requests: 0 }
    }
    const p = summary.byProvider[r.provider]
    p.cost += r.cost
    p.requests += 1
  }

  return summary
}
