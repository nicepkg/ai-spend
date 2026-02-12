export { trackCost } from './tracker.js'
export { getSummary, getRecords, clearRecords, setConfig } from './store.js'
export { logSummary } from './logger.js'
export { defaultPricing } from './pricing/models.js'
export { getModelPricing, calculateCost } from './pricing/lookup.js'

export type {
  ModelPricing,
  CostRecord,
  CostSummary,
  AiSpendConfig,
} from './types.js'

/**
 * Configure ai-spend globally.
 *
 * @example
 * ```ts
 * import { configure } from 'ai-spend'
 *
 * configure({
 *   silent: true, // disable console output
 *   customPricing: {
 *     'my-fine-tuned-model': { input: 5.0, output: 15.0 }
 *   }
 * })
 * ```
 */
export { setConfig as configure } from './store.js'

import { getRecords as _getRecords } from './store.js'

/**
 * Export cost data as JSON string.
 */
export function exportCosts(): string {
  return JSON.stringify(_getRecords(), null, 2)
}
