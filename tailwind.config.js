/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: ["prettier-plugin-tailwindcss", require("daisyui")],
    daisyui: {
        themes: ["cupcake", "forest"],
        darkTheme: "forest",
    },
    darkMode: ["class", '[data-theme="forest"]'],
}
