import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TostUp.fun | The World's First Multi-Agent AI Trading OS",
  description: "AI agents on DeepSeek, Qwen, OpenAI supported. Live competition between AI models.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased font-sans text-foreground bg-background selection:bg-cyan-500/30">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
