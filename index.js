// dsh-think-autoexpand — host half.
// Browser half keeps Think rows visible and auto-expanded.
// Host half injects a per-turn rule through the official "agent/pre-step"
// waterfall, forcing Chinese thinking (Think / reasoning) and replies.
// The rule is written in Chinese itself so it can never be self-defeating.

import { createUserMessage } from '@deepseek-ai/dsh-llm'

export const name = 'dsh-think-autoexpand'
export const inject = []

const PLUGIN = 'dsh-think-autoexpand'

const RULE = '重要语言规则：请始终使用中文进行思考（Think / reasoning 内容）和回复。即使用户或上下文使用其他语言，也必须输出中文。'

// DSH 会话格式 v4 拒绝已退役的 { kind: 'plugin' } 包装，要求生产者自有 kind。
// 官方迁移把未知第三方插件映射为 "plugin:<包名>"，新注入消息沿用同一形状。
const SOURCE_KIND = `plugin:${PLUGIN}`

export function apply(ctx) {
  ctx.on('agent/pre-step', async (event, next) => {
    const decision = await next()
    if (decision.kind === 'reject' || event.step !== 1) return decision
    if (decision.messages.length === 0) return decision
    if (decision.messages.some((message) => message.source?.kind === SOURCE_KIND || message.source?.plugin === PLUGIN)) return decision

    const message = createUserMessage({
      content: [{ type: 'text', text: RULE }],
      source: { kind: SOURCE_KIND },
    })

    const lastClaimedIndex = decision.messages.findLastIndex((message) => event.messages.includes(message))
    return {
      kind: 'enter',
      messages: decision.messages.toSpliced(lastClaimedIndex + 1, 0, message),
    }
  })
}
