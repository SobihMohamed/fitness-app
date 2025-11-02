import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FitOrigin - Your Ultimate Fitness Destination",
  description:
    "Transform your fitness journey with FitOrigin's comprehensive courses, expert guidance, and premium equipment.",
  keywords: "fitness, workout, training, courses, equipment, health, wellness",
  authors: [{ name: "FitOrigin Team" }],
  creator: "FitOrigin",
  publisher: "FitOrigin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://fitorigin.org"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FitOrigin - Your Ultimate Fitness Destination",
    description:
      "Transform your fitness journey with FitOrigin's comprehensive courses, expert guidance, and premium equipment.",
    url: "https://fitorigin.org",
    siteName: "FitOrigin",
    images: [
      {
        url: "/placeholder.jpg",
        width: 1200,
        height: 630,
        alt: "FitOrigin - Your Ultimate Fitness Destination",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FitOrigin - Your Ultimate Fitness Destination",
    description:
      "Transform your fitness journey with FitOrigin's comprehensive courses, expert guidance, and premium equipment.",
    images: ["/placeholder.jpg"],
    creator: "@fitorigin",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/placeholder-logo.png", sizes: "16x16", type: "image/png" },
      { url: "/placeholder-logo.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/placeholder-logo.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/grid-pattern.svg",
        color: "#007BFF",
      },
    ],
  },
  manifest: "/site.webmanifest",
  other: {
    "msapplication-TileColor": "#007BFF",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#ffffff",
  },
    
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <Navigation />
            <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
