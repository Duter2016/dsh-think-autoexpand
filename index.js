// dsh-think-autoexpand — host half.
// Browser half keeps Think rows visible and auto-expanded.
// Host half injects a per-turn language rule through the official
// "agent/pre-step" waterfall (same mechanism as dsh-agent-instructions), so
// it works even when the active preset uses a complete persona prompt that
// drops ordinary system-prompt sections.
//
// The rule itself is emitted in the language it demands. A fallback rule in
// the wrong language was self-defeating: it became the newest user-role
// message, so "follow the latest user message" pointed back at English.

import { createUserMessage } from '@deepseek-ai/dsh-llm'

export const name = 'dsh-think-autoexpand'
export const inject = []

const PLUGIN = 'dsh-think-autoexpand'

const PROMPTS = {
  zh: "重要语言规则：请始终使用中文进行思考（Think / reasoning 内容）和回复。即使用户或上下文使用其他语言，也必须输出中文。",
  en: "Important language rule: Always think (Think / reasoning content) and reply in English, even if the user or context uses another language.",
  both: "语言规则：请使用用户当前消息的语言进行思考（Think / reasoning）和回复——用户写中文就用中文，用户写英文就用英文。Language rule: think and reply in the same language as the user's current message (Chinese for Chinese input, English for English input).",
}

function textOf(content) {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  let out = ''
  for (const block of content) {
    if (block && typeof block.text === 'string') out += block.text + '\n'
  }
  return out
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

function detectUserLanguage(messages) {
  if (!Array.isArray(messages)) return undefined
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i]
    if (!message || message.source?.kind !== 'user') continue
    const text = textOf(message.content)
    if (!text) continue
    const cjk = (text.match(/[\u3000-\u9fff\uf900-\ufaff]/g) || []).length
    const latin = (text.match(/[a-zA-Z]/g) || []).length
    if (cjk > 0 && cjk >= latin) return 'zh'
    if (latin > 0 && latin > cjk) return 'en'
  }
  return undefined
}

function instructionFor(ctx, messages) {
  const locale = readHarnessLocale(ctx)
  if (locale === 'zh') return PROMPTS.zh
  if (locale === 'en') return PROMPTS.en
  const detected = detectUserLanguage(messages)
  if (detected === 'zh') return PROMPTS.zh
  if (detected === 'en') return PROMPTS.en
  return PROMPTS.both
}

export function apply(ctx) {
  ctx.on('agent/pre-step', async (event, next) => {
    const decision = await next()
    if (decision.kind === 'reject' || event.step !== 1) return decision
    if (decision.messages.length === 0) return decision
    if (decision.messages.some((message) => message.source?.plugin === PLUGIN)) return decision

    const message = createUserMessage({
      content: [{ type: 'text', text: instructionFor(ctx, event.messages) }],
      source: { kind: 'plugin', plugin: PLUGIN },
    })

    const lastClaimedIndex = decision.messages.findLastIndex((message) => event.messages.includes(message))
    return {
      kind: 'enter',
      messages: decision.messages.toSpliced(lastClaimedIndex + 1, 0, message),
    }
  })
}
