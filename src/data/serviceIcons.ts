// /services の各サービスのアイコン。scripts/service-icons.mjs が favicon を取ってきて
// public/service-icons/ に置き、serviceIcons.json に一覧を書く（無いものは頭文字のアイコン）

import icons from "./serviceIcons.json"
import { serviceHost } from "./services.ts"

export type ServiceIcon = {
  src: string
  // 暗い絵柄で透明な部分があるもの。暗いカードの上では見えないので明るい下地に置く
  light: boolean
}

export function serviceIcon(url: string): ServiceIcon | null {
  return (icons as Record<string, ServiceIcon>)[serviceHost(url)] ?? null
}
