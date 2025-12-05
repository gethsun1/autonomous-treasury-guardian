import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/manrope/400.css";
import { Providers } from "./providers";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { config } from "@/lib/wagmi";
import ATGParticles from "@/components/Particles";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

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
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans text-frost-white min-h-screen overflow-x-hidden`}>
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] bg-[radial-gradient(circle,_rgba(0,255,200,0.12)_0%,_transparent_70%)] blur-3xl"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] bg-[radial-gradient(circle,_rgba(0,200,255,0.08)_0%,_transparent_80%)] blur-3xl"></div>
          <ATGParticles />
        </div>
        <div className="fixed left-0 top-0 h-full w-[2px] bg-gradient-to-b from-cyan-500/40 to-transparent blur-lg pointer-events-none z-50"></div>
        <div className="fixed right-0 top-0 h-full w-[2px] bg-gradient-to-b from-blue-500/40 to-transparent blur-lg pointer-events-none z-50"></div>
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  );
}
