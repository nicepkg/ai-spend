# ai-spend

Track your LLM API costs with one line of code.

Wraps OpenAI and Anthropic SDKs to automatically monitor token usage and spending — no proxy, no endpoint changes, no data leaves your machine.

```bash
# npm (once published)
npm install ai-spend

# From GitHub Release
npm install https://github.com/nicepkg/ai-spend/releases/download/v0.1.0/ai-spend-0.1.0.tgz

# From GitHub (latest)
npm install github:nicepkg/ai-spend
```

## Why

You're building with LLMs. Your API bill is growing. You need to know **which features cost how much** — but OpenAI's dashboard only shows daily totals, and tools like Portkey/Langfuse want you to change your endpoints or send data to their servers.

**ai-spend** adds cost tracking to your existing code with zero changes:

```ts
import OpenAI from 'openai'
import { trackCost } from 'ai-spend'

// Just wrap your client — everything else stays the same
const openai = trackCost(new OpenAI())

const res = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }],
})

// Console output:
// [ai-spend] gpt-4o $0.0003 (12 in / 8 out)
```

That's it. Every API call now shows its cost in your terminal.

## Features

- **One-line setup** — wrap your client, done
- **Zero dependencies** — no bloat, <15KB total
- **Local-first** — all data stays in your process, nothing sent anywhere
- **50+ models** — built-in pricing for OpenAI, Anthropic, Google, DeepSeek
- **Streaming support** — works with `stream: true`
- **Cache-aware** — tracks Anthropic prompt caching costs correctly
- **Custom pricing** — override or add your own model prices
- **TypeScript** — full type safety, your IDE autocomplete still works

## Quick Start

### OpenAI

```ts
import OpenAI from 'openai'
import { trackCost } from 'ai-spend'

const openai = trackCost(new OpenAI())

// Works with chat completions
await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Explain quantum computing in one sentence' }],
})
// [ai-spend] gpt-4o-mini $0.0001 (15 in / 22 out)

// Works with streaming
const stream = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Write a haiku' }],
  stream: true,
  stream_options: { include_usage: true },
})

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '')
}
// [ai-spend] gpt-4o $0.0004 (10 in / 17 out)
```

### Anthropic

```ts
import Anthropic from '@anthropic-ai/sdk'
import { trackCost } from 'ai-spend'

const anthropic = trackCost(new Anthropic())

await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }],
})
// [ai-spend] claude-sonnet-4-20250514 $0.0002 (10 in / 5 out)
```

### Get Summary

```ts
import { getSummary, logSummary, exportCosts } from 'ai-spend'

// After making some API calls...

// Pretty-print to console
logSummary(getSummary())

// ──────────────────────────────────────────────────
//  ai-spend Cost Summary
// ──────────────────────────────────────────────────
//   Total Cost:     $0.0234
//   Total Requests: 15
//   Input Tokens:   12.5K
//   Output Tokens:  8.3K
//
//   By Model:
//     gpt-4o                         $0.0180  (8 calls)
//     claude-sonnet-4-20250514       $0.0042  (5 calls)
//     gpt-4o-mini                    $0.0012  (2 calls)
// ──────────────────────────────────────────────────

// Export as JSON
const json = exportCosts()
// [{ provider: "openai", model: "gpt-4o", cost: 0.0023, ... }, ...]
```

## Configuration

```ts
import { configure } from 'ai-spend'

configure({
  // Silence console output
  silent: true,

  // Add custom model pricing (per 1M tokens, USD)
  customPricing: {
    'my-fine-tuned-model': { input: 5.0, output: 15.0 },
    'gpt-4o': { input: 2.5, output: 10.0 },  // override built-in
  },
})
```

## API

| Function | Description |
|----------|-------------|
| `trackCost(client)` | Wrap an OpenAI/Anthropic client to track costs |
| `getSummary()` | Get aggregated cost summary |
| `logSummary(summary)` | Pretty-print summary to console |
| `getRecords()` | Get all individual cost records |
| `exportCosts()` | Export all records as JSON string |
| `configure(options)` | Set global options |
| `clearRecords()` | Reset all tracked data |
| `getModelPricing(model)` | Look up pricing for a model |
| `calculateCost(model, in, out)` | Calculate cost for token counts |

## Built-in Models

50+ models with up-to-date pricing:

| Provider | Models |
|----------|--------|
| **OpenAI** | GPT-4.1, GPT-4o, GPT-4o-mini, o1, o3, o4-mini, GPT-4 Turbo, GPT-3.5 Turbo, Embeddings |
| **Anthropic** | Claude Opus 4, Claude Sonnet 4, Claude 3.7 Sonnet, Claude 3.5 Sonnet/Haiku, Claude 3 family |
| **Google** | Gemini 2.0 Flash, Gemini 1.5 Pro/Flash |
| **DeepSeek** | DeepSeek Chat, DeepSeek Reasoner |

Custom models? Just add them via `configure()`.

## How It Works

ai-spend uses JavaScript [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to intercept API calls on your SDK client. When you call `client.chat.completions.create()`, the proxy:

1. Lets the original API call happen normally
2. Reads the `usage` field from the response
3. Looks up the model's pricing
4. Calculates and logs the cost
5. Returns the original response untouched

No monkey-patching. No prototype modification. No network requests. Your code works exactly as before.

## Comparison

| Feature | ai-spend | Portkey | Langfuse | LangSmith |
|---------|----------|---------|----------|-----------|
| Setup | 1 line | Change endpoint | Add traces | Add callbacks |
| Data location | Your machine | Their servers | Their servers | Their servers |
| Pricing | Free | $49/mo+ | $59/mo+ | $39/user/mo+ |
| Dependencies | 0 | SDK + proxy | SDK + backend | SDK + backend |
| Works offline | Yes | No | No | No |

## Coming Soon

- Cloud dashboard for team-wide cost tracking
- Cost alerts and budgets
- More providers (Google, Mistral, Cohere)
- Express/Fastify middleware

## License

MIT
