/** @type {import('next').NextConfig} */

import LicensePlugin from "webpack-license-plugin"

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.node$/,
      loader: "node-loader",
    })

    if (process.env.npm_lifecycle_event !== "dev") {
      config.plugins.push(
        new LicensePlugin({
          outputFilename: "../src/licenses.json",
          unacceptableLicenseTest: (licenseType) =>
            licenseType.includes("GPL") || licenseType.includes("AGPL"),
        }),
      )
    }

    return config
  },
}

export default nextConfig
