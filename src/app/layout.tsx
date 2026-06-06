import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  DM_Serif_Display,
  Google_Sans,
} from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import QueryProvider from "@/components/QueryProvider";

const googleSans = Google_Sans({
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage-grotesque",
});

export const metadata: Metadata = {
  title: {
    default: "Grasp — Audio-first personalized learning",
    template: "%s | Grasp"
  },
  description: "Grasp designs high-quality, personalized audio courses on any topic. Learn on the go with structured modules, spoken narration, and interactive Wikipedia diagrams.",
  keywords: [
    "education", "audio learning", "personalized course", "AI tutor", "learn on the go", "Wikipedia diagrams", "audio courses", "curriculum designer"
  ],
  authors: [{ name: "Grasp AI Team" }],
  creator: "Grasp AI",
  metadataBase: new URL("https://grasp.ai"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Grasp — Audio-first personalized learning",
    description: "Grasp designs high-quality, personalized audio courses on any topic. Learn on the go with structured modules, spoken narration, and interactive Wikipedia diagrams.",
    url: "https://grasp.ai",
    siteName: "Grasp",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "Grasp — Audio-first personalized learning",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grasp — Audio-first personalized learning",
    description: "Grasp designs high-quality, personalized audio courses on any topic. Learn on the go with structured modules, spoken narration, and interactive Wikipedia diagrams.",
    images: ["/og-image.jpeg"],
    creator: "@graspdotai",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${googleSans.className} ${bricolageGrotesque.variable} ${dmSerif.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
