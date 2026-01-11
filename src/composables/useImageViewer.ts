import type { InjectionKey } from "vue"
import { inject } from "vue"

export interface ImageViewerState {
  src: string
  alt: string
  width?: number
  height?: number
}

export interface ImageViewerContext {
  openViewer: (state: ImageViewerState) => void
  closeViewer: () => void
}

export const imageViewerKey = Symbol(
  "imageViewer",
) as InjectionKey<ImageViewerContext>

export function useImageViewer() {
  const context = inject(imageViewerKey)
  if (!context) {
    throw new Error("useImageViewer must be used within ImageViewerProvider")
  }
  return context
}
