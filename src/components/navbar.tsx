import Link from "next/link"

export default function NavBar() {
    return (
        <>
            <header className="sticky top-0 z-50">
                <div className="navbar bg-base-50 backdrop-blur-sm shadow-lg">
                    <div className="flex-1">
                        <Link
                            className="btn btn-ghost normal-case text-xl"
                            href="/"
                        >
                            c30 life
                        </Link>
                    </div>
                    <div className="flex-none">
                        <ul className="menu menu-horizontal px-1">
                            <li tabIndex={0}>
                                <a>
                                    Pages
                                    <svg
                                        className="fill-current"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                                    </svg>
                                </a>
                                <ul className="p-2 bg-base-100 right-1 z-20">
                                    <li>
                                        <Link href="/links">Links</Link>
                                    </li>
                                    <li>
                                        <Link href="/misskey">
                                            Misskey Links
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/mdic">
                                            Misskey Default Icon Checker
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/pubkeys">Public keys</Link>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </header>
        </>
    )
}
