// /products の各サービスのアイコン。scripts/product-icons.mjs が favicon を取ってきて
// public/product-icons/ に置き、productIcons.json に一覧を書く（無いものは頭文字のアイコン）

import icons from "./productIcons.json"
import { productHost } from "./products.ts"

export type ProductIcon = {
  src: string
  // 暗い絵柄で透明な部分があるもの。暗いカードの上では見えないので明るい下地に置く
  light: boolean
}

export function productIcon(url: string): ProductIcon | null {
  return (icons as Record<string, ProductIcon>)[productHost(url)] ?? null
}
