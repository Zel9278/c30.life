import type { Metadata } from "next"

export default async function Home() {
  const pc = {
    cpu: "11th Gen Intel(R) Core(TM) i7-11800H @ 2.30 GHz",
    gpu: "RTX 3050 Ti Laptop GPU",
    ram: "16GB",
    storage: "512 GB NVMe + 1TB External SSD + 4TB External HDD",
    os: "Windows 11 Home",
    earPhone: "USB-C earphone",
    mouse: "Logicool G203 LIGHTSYNC",
    tablet: "XPPen Artist 12 Second (Japan Only Model)",
    softwares: [
      "Visual Studio Code",
      "OBS Studio",
      "Discord",
      "Google Chrome",
      "Google Chrome Dev",
      "OperaGX",
      "Steam",
      "Git",
      "Windows Terminal",
      "ShareX",
      "Tailscale",
      "Voicemeeter Potato",
      "EarTrumpet",
      "DevToys",
      "PowerToys",
      "NVIDIA Apps",
      "Flow Launcher",
      "etc...",
    ],
    games: ["Minecraft", "Osu!", "etc..."],
  }
  const phones = [
    {
      name: "AQUOS R9",
      os: "Android 15",
      rooted: false,
    },
    {
      name: "Google Pixel 8",
      os: "Android 15",
      rooted: true,
    },
    {
      name: "Moto g53y",
      os: "Android 15 with 2by2",
      rooted: true,
    },
  ]

  return (
    <>
      <div className="card w-full bg-base-100 shadow-xl rounded-lg">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-4">Environment</h2>
          <div className="bg-neutral w-full h-0.5 rounded mb-6" />

          <h3 className="text-xl font-semibold mb-2">PC</h3>
          <ul className="list-disc list-inside mb-6">
            <li>CPU: {pc.cpu}</li>
            <li>GPU: {pc.gpu}</li>
            <li>RAM: {pc.ram}</li>
            <li>Storage: {pc.storage}</li>
            <li>OS: {pc.os}</li>
            <li>Earphone: {pc.earPhone}</li>
            <li>Mouse: {pc.mouse}</li>
            <li>Tablet: {pc.tablet}</li>
          </ul>

          <h4 className="text-lg font-semibold mb-2">Softwares</h4>
          <table className="table-auto w-full border border-neutral mb-6">
            <thead className="bg-neutral text-neutral-content">
              <tr>
                <th className="py-2 px-4 text-left">Software</th>
              </tr>
            </thead>
            <tbody>
              {pc.softwares.map((software) => (
                <tr key={software} className="even:bg-base-200 odd:bg-base-100">
                  <td className="py-2 px-4">{software}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 className="text-lg font-semibold mb-2">Games</h4>
          <table className="table-auto w-full border border-neutral mb-6">
            <thead className="bg-neutral text-neutral-content">
              <tr>
                <th className="py-2 px-4 text-left">Game</th>
              </tr>
            </thead>
            <tbody>
              {pc.games.map((game) => (
                <tr key={game} className="even:bg-base-200 odd:bg-base-100">
                  <td className="py-2 px-4">{game}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bg-neutral w-full h-0.5 rounded mb-6" />

          <h3 className="text-xl font-semibold mb-2">Phones</h3>
          <table className="table-auto w-full border border-neutral">
            <thead className="bg-neutral text-neutral-content">
              <tr>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">OS</th>
                <th className="py-2 px-4 text-left">Rooted</th>
              </tr>
            </thead>
            <tbody>
              {phones.map((phone) => (
                <tr
                  key={phone.name}
                  className="even:bg-base-200 odd:bg-base-100"
                >
                  <td className="py-2 px-4">{phone.name}</td>
                  <td className="py-2 px-4">{phone.os}</td>
                  <td className="py-2 px-4">{phone.rooted ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export function generateMetadata(): Metadata {
  return {
    description: "c30の今の環境です。",
    openGraph: {
      title: "environments",
      description: "c30の今の環境です。。",
      url: "https://c30.life/environments",
    },
  }
}
