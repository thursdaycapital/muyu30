import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const miniAppEmbed = {
  version: "1",
  imageUrl: `${appUrl}/og`,
  button: {
    title: "木鱼28",
    action: {
      type: "launch_frame",
      name: "木鱼28 · 每天敲28次",
      url: appUrl,
      splashImageUrl: `${appUrl}/muyu.svg`,
      splashBackgroundColor: "#f6f1e8",
    },
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "木鱼28",
  description: "每天敲木鱼28次，保平安也保坚持。",
  openGraph: {
    type: "website",
    title: "木鱼28",
    description: "每天敲木鱼28次，带上好友一起打卡。",
    url: appUrl,
    siteName: "木鱼28",
    images: [
      {
        url: `${appUrl}/og`,
        width: 1200,
        height: 630,
        alt: "木鱼28 - 每天敲木鱼28次",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "木鱼28",
    description: "每天敲木鱼28次，带上好友一起打卡。",
    images: [`${appUrl}/og`],
  },
  other: {
    "fc:miniapp": JSON.stringify(miniAppEmbed),
    "fc:frame": JSON.stringify(miniAppEmbed),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
