// dsh-think-autoexpand — host half.
// Browser half keeps Think rows visible and auto-expanded.
// Host half injects a per-turn language instruction through the official
// "agent/pre-step" waterfall (same mechanism as dsh-agent-instructions), so
// it works even when the active preset uses a complete persona prompt that
// drops ordinary system-prompt sections.

import { createUserMessage } from '@deepseek-ai/dsh-llm'

export const name = 'dsh-think-autoexpand'
export const inject = []

const PLUGIN = 'dsh-think-autoexpand'

const PROMPTS = {
  zh: '重要语言规则：请始终使用中文进行思考（Think / reasoning 内容）和回复。即使用户或上下文使用其他语言，也必须输出中文。',
  en: 'Important language rule: Always think (Think / reasoning content) and reply in English, even if the user or context uses another language.',
  auto: "Important language rule: Match your thinking (Think / reasoning content) and replies to the DeepSeek Harness interface language. When the interface language cannot be determined, use the same language as the user's most recent message.",
}

function readHarnessLocale(ctx) {
  try {
    const settings = ctx.get('settings', false)
    const locale = settings && typeof settings.get === 'function'
      ? settings.get('locale')
      : undefined
    return locale && (locale.preference === 'zh' || locale.preference === 'en')
      ? locale.preference
      : undefined
  } catch {
    return undefined
  }
}

function instructionFor(ctx) {
  const locale = readHarnessLocale(ctx)
  if (locale === 'zh') return PROMPTS.zh
  if (locale === 'en') return PROMPTS.en
  return PROMPTS.auto
}

export function apply(ctx) {
  ctx.on('agent/pre-step', async (event, next) => {
    const decision = await next()
    if (decision.kind === 'reject' || event.step !== 1) return decision
    if (decision.messages.length === 0) return decision
    if (decision.messages.some((message) => message.source?.plugin === PLUGIN)) return decision

    const message = createUserMessage({
      content: [{ type: 'text', text: instructionFor(ctx) }],
      source: { kind: 'plugin', plugin: PLUGIN },
    })

    const lastClaimedIndex = decision.messages.findLastIndex((message) => event.messages.includes(message))
    return {
      kind: 'enter',
      messages: decision.messages.toSpliced(lastClaimedIndex + 1, 0, message),
    }
  })
}
