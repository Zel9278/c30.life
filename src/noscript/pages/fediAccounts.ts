import {
  accountProfileUrl,
  type FediverseAccount,
  type FediversePlatform,
  fediverseSections,
  mainFediverseAccounts,
} from "../../../fediverseLinks.ts"
import { escapeHtml, safeUrl } from "../html.ts"
import type { NoscriptRenderer } from "../types.ts"

// アバターや投稿数は外部サーバーへの問い合わせが必要なので noscript では出さない
function renderAccount(
  platform: FediversePlatform,
  account: FediverseAccount,
): string {
  const href = safeUrl(accountProfileUrl(platform, account))
  return `<li class="link-item"><a href="${escapeHtml(href)}" rel="me noopener noreferrer">@${escapeHtml(
    account.userId,
  )}<br><span class="small muted">${escapeHtml(account.host)}</span></a></li>`
}

function renderAccountList(
  platform: FediversePlatform,
  accounts: FediverseAccount[],
): string {
  return `<ul class="link-list">${accounts
    .map((account) => renderAccount(platform, account))
    .join("")}</ul>`
}

export const render: NoscriptRenderer = async () => {
  const total =
    mainFediverseAccounts.length +
    fediverseSections.reduce((sum, section) => sum + section.accounts.length, 0)

  const sections = fediverseSections
    .filter((section) => section.accounts.length > 0)
    .map(
      (section) => `<details>
<summary>${escapeHtml(section.title)} <span class="muted small">(${escapeHtml(section.accounts.length)})</span></summary>
${renderAccountList(section.platform, section.accounts)}
</details>`,
    )
    .join("\n")

  return {
    body: `<div class="noscript-card">
<h1>Fedi Accounts</h1>
<p class="subtitle">Fediverseのアカウント一覧（${escapeHtml(total)}件）</p>
<p class="small muted">JavaScriptを有効にすると、アバターや投稿数も表示されます。</p>
<h2>メインアカウント</h2>
${renderAccountList("misskey", mainFediverseAccounts)}
${sections}
</div>`,
  }
}
