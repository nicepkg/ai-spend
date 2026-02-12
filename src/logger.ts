import type { CostRecord, CostSummary } from './types.js'
import { getConfig } from './store.js'

const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
}

function formatCost(cost: number): string {
  if (cost < 0.001) return `$${cost.toFixed(6)}`
  if (cost < 0.01) return `$${cost.toFixed(4)}`
  return `$${cost.toFixed(4)}`
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

/**
 * Log a single cost record to console.
 */
export function logRecord(record: CostRecord): void {
  if (getConfig().silent) return

  const { cyan, dim, green, reset, yellow } = COLORS
  const cost = formatCost(record.cost)
  const tokens = `${formatTokens(record.inputTokens)} in / ${formatTokens(record.outputTokens)} out`

  console.log(
    `${dim}[ai-spend]${reset} ${cyan}${record.model}${reset} ${yellow}${cost}${reset} ${dim}(${tokens})${reset}`
  )
}

/**
 * Log a summary to console.
 */
export function logSummary(summary: CostSummary): void {
  if (getConfig().silent) return

  const { cyan, dim, green, reset, white, yellow } = COLORS
  const divider = `${dim}${'─'.repeat(50)}${reset}`

  console.log('')
  console.log(divider)
  console.log(`${white} ai-spend Cost Summary${reset}`)
  console.log(divider)
  console.log(`  Total Cost:     ${yellow}${formatCost(summary.totalCost)}${reset}`)
  console.log(`  Total Requests: ${cyan}${summary.totalRequests}${reset}`)
  console.log(`  Input Tokens:   ${dim}${formatTokens(summary.totalInputTokens)}${reset}`)
  console.log(`  Output Tokens:  ${dim}${formatTokens(summary.totalOutputTokens)}${reset}`)

  const models = Object.entries(summary.byModel).sort((a, b) => b[1].cost - a[1].cost)
  if (models.length > 0) {
    console.log('')
    console.log(`  ${white}By Model:${reset}`)
    for (const [model, data] of models) {
      console.log(
        `    ${cyan}${model.padEnd(30)}${reset} ${yellow}${formatCost(data.cost).padStart(10)}${reset}  ${dim}(${data.requests} calls)${reset}`
      )
    }
  }

  console.log(divider)
  console.log('')
}
