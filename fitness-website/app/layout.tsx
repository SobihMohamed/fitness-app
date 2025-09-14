import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FitPro - Your Ultimate Fitness Destination",
  description:
    "Transform your fitness journey with FitPro's comprehensive courses, expert guidance, and premium equipment.",
  keywords: "fitness, workout, training, courses, equipment, health, wellness",
  authors: [{ name: "FitPro Team" }],
  creator: "FitPro",
  publisher: "FitPro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://fitpro.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FitPro - Your Ultimate Fitness Destination",
    description:
      "Transform your fitness journey with FitPro's comprehensive courses, expert guidance, and premium equipment.",
    url: "https://fitpro.com",
    siteName: "FitPro",
    images: [
      {
        url: "/placeholder.jpg",
        width: 1200,
        height: 630,
        alt: "FitPro - Your Ultimate Fitness Destination",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FitPro - Your Ultimate Fitness Destination",
    description:
      "Transform your fitness journey with FitPro's comprehensive courses, expert guidance, and premium equipment.",
    images: ["/placeholder.jpg"],
    creator: "@fitpro",
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
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
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
      <body className={inter.className}>
        <Providers>
          <Navigation />
            <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
