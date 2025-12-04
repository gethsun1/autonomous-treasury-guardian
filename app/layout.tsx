import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { config } from "@/lib/wagmi";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Autonomous Treasury Guardian",
  description: "AI-powered treasury management on Avalanche",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const initialState = cookieToInitialState(config, headersList.get("cookie"));
  
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-midnight-indigo text-frost-white min-h-screen`}>
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  );
}
