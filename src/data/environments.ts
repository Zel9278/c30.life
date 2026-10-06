// /environments ページのデータ (SPA と noscript で共有する)

export type PcSpec = {
  cpu: string
  gpu: string
  ram: string
  storage: string
  os: string
  earPhone: string
  mouse: string
  tablet: string
  controller: string
}

export type Phone = {
  name: string
  os: string
  rooted: boolean
}

export const environmentsPage = {
  title: "Environment",
  subtitle: "c30の開発環境",
}

export const pc: PcSpec = {
  cpu: "11th Gen Intel(R) Core(TM) i7-11800H @ 2.30 GHz",
  gpu: "RTX 3050 Ti Laptop GPU",
  ram: "16GB",
  storage: "512 GB NVMe + 1TB External SSD + 4TB External HDD",
  os: "Fedora Linux 44 (KDE Plasma Desktop Edition) x86_64",
  earPhone: "3ｍ earphone",
  mouse: "Logicool G203 LIGHTSYNC",
  tablet: "none",
  controller: "Xbox One Controller",
}

// PC スペックの表示ラベルと表示順
export const pcSpecRows: { label: string; key: keyof PcSpec }[] = [
  { label: "CPU", key: "cpu" },
  { label: "GPU", key: "gpu" },
  { label: "RAM", key: "ram" },
  { label: "Storage", key: "storage" },
  { label: "OS", key: "os" },
  { label: "Earphone", key: "earPhone" },
  { label: "Mouse", key: "mouse" },
  { label: "Tablet", key: "tablet" },
  { label: "Controller", key: "controller" },
]

export const phones: Phone[] = [
  {
    name: "AQUOS R9",
    os: "Android 15",
    rooted: false,
  },
]

export const formatRooted = (rooted: boolean): string => (rooted ? "Yes" : "No")
