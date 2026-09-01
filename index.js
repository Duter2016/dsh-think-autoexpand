// dsh-think-autoexpand — host half.
// Browser half keeps Think rows visible and auto-expanded.
// Host half injects a system-prompt section so the agent's thinking
// language follows the DeepSeek Harness interface language (locale setting).

export const name = 'dsh-think-autoexpand'
export const inject = ['systemPrompt']

const SECTION_NAME = 'dsh-think-autoexpand-language'

const PROMPTS = {
  zh: 'DeepSeek Harness 界面语言是中文。你的思考过程（Think / reasoning 内容）和回复都必须始终使用中文，即使用户使用其他语言。',
  en: 'The DeepSeek Harness interface language is English. Your thinking process (Think / reasoning content) and replies must always be in English, even if the user writes in another language.',
  auto: "Match your thinking process (Think / reasoning content) and replies to the DeepSeek Harness interface language. When the interface language cannot be determined, use the same language as the user's most recent message.",
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

function promptText(ctx) {
  const locale = readHarnessLocale(ctx)
  if (locale === 'zh') return PROMPTS.zh
  if (locale === 'en') return PROMPTS.en
  return PROMPTS.auto
}

export function apply(ctx) {
  ctx.systemPrompt.section({
    name: SECTION_NAME,
    // Before the persona so the instruction is read first every turn.
    order: -90,
    text: () => promptText(ctx),
  })
}
