"use client"

import Link from "next/link"

export default function NavBar() {
  return (
    <>
      <header className="sticky top-0 z-10">
        <div className="navbar bg-base-50 bg-opacity-80 backdrop-blur-sm shadow-lg">
          <div className="navbar-start">
            <label htmlFor="drawer" className="btn btn-ghost">
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <title>Click here to open the drawer menu</title>
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
          <div className="navbar-center">
            <Link className="btn btn-ghost normal-case text-xl" href="/">
              c30 life
            </Link>
          </div>
          <div className="navbar-end">
            <label className="flex cursor-pointer gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <title>Click here to change the theme</title>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <input
                type="checkbox"
                value="cupcake"
                className="toggle theme-controller"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <title>Click here to change the theme</title>
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
              </svg>
            </label>
          </div>
        </div>
      </header>
    </>
  )
}
