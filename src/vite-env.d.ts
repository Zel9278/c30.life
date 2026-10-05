/// <reference types="vite/client" />

declare const __APP_VERSION__: string

declare module "virtual:package-info" {
  export const dependencies: { name: string; version: string }[]
  export const devDependencies: { name: string; version: string }[]
  export const licenses: {
    name: string
    version: string
    license: string
    repository: string
    publisher?: string
    licenseText: string
  }[]
}
