import { ReactNode } from "react"

type Props = {
    children?: ReactNode
}

export default function Footer(progs: Props) {
    return (
        <>
            <footer className="footer footer-center p-4 bg-base-300 text-base-content sticky-footer row-start-2 row-end-3">
                <div>
                    <p>
                        Copyright © {new Date().getFullYear()} - All right
                        reserved by c30
                    </p>
                </div>
            </footer>
        </>
    )
}
