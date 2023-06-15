import Link from "next/link"

export default function NavBar() {
    return (
        <>
            <header className="sticky top-0 z-50">
                <div className="navbar bg-base-50 backdrop-blur-sm shadow-lg">
                    <div className="flex-1">
                        <label htmlFor="drawer" className="btn btn-ghost">
                            <svg viewBox="0 0 24 24" className="w-6 h-6">
                                <path
                                    fill="currentColor"
                                    d="M3,12h18a1,1,0,0,0,0-2H3A1,1,0,0,0,3,12Z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M3,6h18a1,1,0,0,0,0-2H3A1,1,0,0,0,3,6Z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M3,18h9a1,1,0,0,0,0-2H3A1,1,0,0,0,3,18Z"
                                />
                            </svg>
                        </label>
                    </div>
                    <div className="flex-auto">
                        <Link
                            className="btn btn-ghost normal-case text-xl"
                            href="/"
                        >
                            c30 life
                        </Link>
                    </div>
                </div>
            </header>
        </>
    )
}
