import {
  affiliations,
  backgroundSong,
  fictosexual,
  getProfileFacts,
  hobbies,
  type LgbtLetter,
  languages,
  lgbtLetters,
  profile,
  secretBadges,
} from "../../data/profile.ts"
import { escapeHtml, link, safeUrl } from "../html.ts"
import type { NoscriptRenderer } from "../types.ts"

const divider = '<div class="ns-divider" role="presentation"></div>'

function badges(items: string[]): string {
  return `<div class="badge-group">${items
    .map((item) => `<span class="ns-badge">${escapeHtml(item)}</span>`)
    .join("")}</div>`
}

// SPA ではクリックでツールチップを出しているが、noscript では <abbr title> で代用する
function letter(item: LgbtLetter): string {
  const text = escapeHtml(item.letter)
  return `<abbr title="${escapeHtml(item.name)}">${item.highlight ? `<strong>${text}</strong>` : text}</abbr>`
}

// トップページの本文。index.html のフォールバックとしてビルド時にも使うので純粋関数にしている
export function renderHomeBody(now: Date): string {
  const facts = getProfileFacts(now)
    .map(
      (fact) => `<div class="info-box">
<div class="info-label">${escapeHtml(fact.label)}</div>
<div class="info-value">${escapeHtml(fact.value)}</div>
<div class="info-sub">${escapeHtml(fact.sub)}</div>
</div>`,
    )
    .join("\n")

  return `<article class="noscript-card center">
<header class="profile-header">
<img class="profile-avatar" src="${escapeHtml(safeUrl(profile.avatar.src))}" alt="${escapeHtml(profile.avatar.alt)}" width="112" height="112">
<h1>${escapeHtml(profile.siteName)}</h1>
<p class="subtitle">${escapeHtml(profile.handle)}</p>
<p class="subtitle small"><em>"${escapeHtml(profile.tagline)}"</em></p>
</header>
${divider}
<section aria-labelledby="home-intro">
<h2 id="home-intro">自己紹介</h2>
<p class="intro-text">${escapeHtml(profile.intro)}</p>
<details>
<summary>その他の情報</summary>
${badges(secretBadges.map((badge) => badge.text))}
${divider}
<p class="muted small">${lgbtLetters.map(letter).join("")} + ${letter(fictosexual)}</p>
</details>
</section>
${divider}
<section aria-labelledby="home-profile">
<h3 id="home-profile">プロフィール</h3>
<div class="info-grid">
${facts}
</div>
</section>
${divider}
<section aria-labelledby="home-hobbies">
<h3 id="home-hobbies">趣味</h3>
${badges(hobbies)}
</section>
<section aria-labelledby="home-languages">
<h3 id="home-languages">プログラミング言語</h3>
${badges(languages.map((lang) => lang.name))}
</section>
${divider}
<section aria-labelledby="home-affiliations">
<h3 id="home-affiliations">所属</h3>
${badges(affiliations.map((affiliation) => affiliation.name))}
</section>
</article>
<p class="muted small center">Background: ${link(encodeURI(backgroundSong.midiUrl), backgroundSong.title)}</p>
<p class="muted small center">ピアノ演奏にはJavaScriptが必要です。</p>`
}

export const render: NoscriptRenderer = async () => ({
  body: renderHomeBody(new Date()),
})
