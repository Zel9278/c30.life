import type { Metadata } from "next"

export default async function Home() {
    const pc = {
        cpu: "11th Gen Intel(R) Core(TM) i7-11800H @ 2.30 GHz",
        gpu: "RTX 3050 Ti Laptop GPU",
        ram: "16GB",
        storage: "512 GB NVMe + 1TB External SSD + 4TB External HDD",
        os: "Windows 11 Pro",
        earPhone: "3m cable",
        softwares: [
            "Visual Studio Code",
            "OBS Studio",
            "Discord",
            "Google Chrome",
            "Steam",
            "Unity",
            "Git",
            "Windows Terminal",
            "ShareX",
            "Tailscale",
            "Voicemeeter Potato",
            "EarTrumpet",
            "WakaTime",
            "DevToys",
            "PowerToys",
            "NVIDIA Apps",
            "Flow Launcher",
            "BatteryBar Pro",
            "etc...",
        ],
        games: [
            "Minecraft",
            "VRChat (Desktop)",
            "神椿市協奏中。",
            "Zenless Zone Zero",
            "Osu!",
            "etc...",
        ],
    }
    const vr = {
        device: "Meta Quest 3s",
        connection: "無限Linkケーブル",
        softwares: [
            "SteamVR",
            "Virtual Desktop",
            "gnihtet ( for USB connection )",
            "XSOverlay",
            "fpsVR",
            "OVR Advanced Settings",
            "VRHandsFrame",
        ],
        games: ["Beat Saber", "VRChat"],
    }
    const phones = [
        {
            name: "AQUOS R9",
            os: "Android 14",
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
            <main className="p-6 min-h-screen bg-base-200">
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
                        </ul>

                        <h4 className="text-lg font-semibold mb-2">
                            Softwares
                        </h4>
                        <table className="table-auto w-full border border-neutral mb-6">
                            <thead className="bg-neutral text-neutral-content">
                                <tr>
                                    <th className="py-2 px-4 text-left">
                                        Software
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {pc.softwares.map((software) => (
                                    <tr
                                        key={software}
                                        className="even:bg-base-200 odd:bg-base-100"
                                    >
                                        <td className="py-2 px-4">
                                            {software}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <h4 className="text-lg font-semibold mb-2">Games</h4>
                        <table className="table-auto w-full border border-neutral mb-6">
                            <thead className="bg-neutral text-neutral-content">
                                <tr>
                                    <th className="py-2 px-4 text-left">
                                        Game
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {pc.games.map((game) => (
                                    <tr
                                        key={game}
                                        className="even:bg-base-200 odd:bg-base-100"
                                    >
                                        <td className="py-2 px-4">{game}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="bg-neutral w-full h-0.5 rounded mb-6" />

                        <h3 className="text-xl font-semibold mb-2">VR</h3>
                        <ul className="list-disc list-inside mb-6">
                            <li>Device: {vr.device}</li>
                            <li>Connection: {vr.connection}</li>
                        </ul>

                        <h4 className="text-lg font-semibold mb-2">
                            Softwares
                        </h4>
                        <table className="table-auto w-full border border-neutral mb-6">
                            <thead className="bg-neutral text-neutral-content">
                                <tr>
                                    <th className="py-2 px-4 text-left">
                                        Software
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {vr.softwares.map((software) => (
                                    <tr
                                        key={software}
                                        className="even:bg-base-200 odd:bg-base-100"
                                    >
                                        <td className="py-2 px-4">
                                            {software}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <h4 className="text-lg font-semibold mb-2">Games</h4>
                        <table className="table-auto w-full border border-neutral mb-6">
                            <thead className="bg-neutral text-neutral-content">
                                <tr>
                                    <th className="py-2 px-4 text-left">
                                        Game
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {vr.games.map((game) => (
                                    <tr
                                        key={game}
                                        className="even:bg-base-200 odd:bg-base-100"
                                    >
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
                                    <th className="py-2 px-4 text-left">
                                        Name
                                    </th>
                                    <th className="py-2 px-4 text-left">OS</th>
                                    <th className="py-2 px-4 text-left">
                                        Rooted
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {phones.map((phone) => (
                                    <tr
                                        key={phone.name}
                                        className="even:bg-base-200 odd:bg-base-100"
                                    >
                                        <td className="py-2 px-4">
                                            {phone.name}
                                        </td>
                                        <td className="py-2 px-4">
                                            {phone.os}
                                        </td>
                                        <td className="py-2 px-4">
                                            {phone.rooted ? "Yes" : "No"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
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
