import type { CostRecord } from './types.js'
import { addRecord } from './store.js'
import { logRecord } from './logger.js'
import { parseOpenAIResponse, isStreamingRequest as isOpenAIStreaming } from './providers/openai.js'
import { parseAnthropicResponse, isStreamingRequest as isAnthropicStreaming } from './providers/anthropic.js'
import { getModelPricing } from './pricing/lookup.js'

type Provider = 'openai' | 'anthropic' | 'unknown'

/**
 * Detect which SDK provider this client belongs to.
 */
function detectProvider(client: any): Provider {
  // OpenAI client has client.chat.completions
  if (client?.chat?.completions?.create) return 'openai'
  // Also check for base completions
  if (client?.completions?.create) return 'openai'
  // Anthropic client has client.messages.create
  if (client?.messages?.create) return 'anthropic'
  return 'unknown'
}

function recordCost(record: CostRecord | null): void {
  if (!record || record.cost === 0) {
    // Still record zero-cost if we have token data (unknown model pricing)
    if (record && (record.inputTokens > 0 || record.outputTokens > 0)) {
      addRecord(record)
      logRecord(record)
    }
    return
  }
  addRecord(record)
  logRecord(record)
}

/**
 * Wrap an async iterator (streaming response) to track costs.
 */
async function* wrapAsyncIterator(
  iterator: AsyncIterable<any>,
  provider: Provider,
  requestArgs: any[],
): AsyncGenerator<any> {
  let finalUsage: any = null
  let model: string = requestArgs[0]?.model || 'unknown'

  for await (const chunk of iterator) {
    yield chunk

    // OpenAI: usage in final chunk (when stream_options.include_usage = true)
    if (chunk?.usage) {
      finalUsage = chunk.usage
      if (chunk.model) model = chunk.model
    }

    // Anthropic: message_delta event has usage
    if (chunk?.type === 'message_delta' && chunk?.usage) {
      finalUsage = { ...finalUsage, ...chunk.usage }
    }

    // Anthropic: message_start has the initial usage
    if (chunk?.type === 'message_start' && chunk?.message?.usage) {
      finalUsage = chunk.message.usage
      if (chunk.message.model) model = chunk.message.model
    }
  }

  // After stream ends, try to record costs
  if (finalUsage) {
    let record: CostRecord | null = null

    if (provider === 'openai') {
      record = parseOpenAIResponse({ usage: finalUsage, model }, requestArgs)
    } else if (provider === 'anthropic') {
      record = parseAnthropicResponse({ usage: finalUsage, model }, requestArgs)
    }

    recordCost(record)
  }
}

/**
 * Create a wrapped async iterable that tracks streaming costs.
 */
function wrapStreamResponse(
  streamObj: any,
  provider: Provider,
  requestArgs: any[],
): any {
  // Both OpenAI and Anthropic stream objects are async iterables
  // We need to wrap the async iterator while preserving other properties

  // If it has [Symbol.asyncIterator], wrap it
  if (streamObj && typeof streamObj[Symbol.asyncIterator] === 'function') {
    const originalIterator = streamObj[Symbol.asyncIterator].bind(streamObj)

    // Create a proxy that wraps the async iterator but preserves everything else
    return new Proxy(streamObj, {
      get(target, prop, receiver) {
        if (prop === Symbol.asyncIterator) {
          return () => {
            const gen = wrapAsyncIterator(
              { [Symbol.asyncIterator]: originalIterator },
              provider,
              requestArgs,
            )
            return gen
          }
        }
        return Reflect.get(target, prop, receiver)
      },
    })
  }

  return streamObj
}

/**
 * Create a deep proxy that intercepts API calls on an SDK client.
 */
function createDeepProxy(target: any, provider: Provider, path: string[] = []): any {
  return new Proxy(target, {
    get(obj, prop, receiver) {
      const value = Reflect.get(obj, prop, receiver)

      // Don't proxy symbols, private props, or non-string props
      if (typeof prop !== 'string' || prop.startsWith('_')) {
        return value
      }

      // If it's a function (potential API method)
      if (typeof value === 'function') {
        const currentPath = [...path, prop]

        // Only intercept 'create' methods on known resource paths
        if (prop === 'create') {
          return function(this: any, ...args: any[]) {
            const result = value.apply(obj, args)

            // Check if streaming
            const isStreaming = args[0]?.stream === true

            if (result instanceof Promise) {
              return result.then((response: any) => {
                if (isStreaming) {
                  return wrapStreamResponse(response, provider, args)
                }

                // Non-streaming: parse response immediately
                let record: CostRecord | null = null
                if (provider === 'openai') {
                  record = parseOpenAIResponse(response, args)
                } else if (provider === 'anthropic') {
                  record = parseAnthropicResponse(response, args)
                }
                recordCost(record)
                return response
              })
            }

            return result
          }
        }

        // For non-'create' methods, return as-is bound to original
        return value.bind(obj)
      }

      // If it's an object (nested resource like client.chat.completions), proxy it too
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return createDeepProxy(value, provider, [...path, prop])
      }

      return value
    },
  })
}

/**
 * Wrap an OpenAI or Anthropic SDK client to automatically track costs.
 *
 * @example
 * ```ts
 * import OpenAI from 'openai'
 * import { trackCost } from 'ai-spend'
 *
 * const client = trackCost(new OpenAI())
 *
 * // Use as normal — costs are tracked automatically
 * const res = await client.chat.completions.create({
 *   model: 'gpt-4o',
 *   messages: [{ role: 'user', content: 'Hello' }]
 * })
 * ```
 */
export function trackCost<T extends object>(client: T): T {
  const provider = detectProvider(client)
  if (provider === 'unknown') {
    console.warn('[ai-spend] Unknown SDK client. Cost tracking will not work. Supported: OpenAI, Anthropic.')
    return client
  }
  return createDeepProxy(client, provider) as T
}
