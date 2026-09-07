import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "AI Opdatering // The Intelligence Chronicle",
  description: "Futuristisk avis og live aggregator for AI-nyheder fra Frontier Labs, uafhængige analytikere, danske kilder og forskningsverdenen.",
  keywords: ["AI", "Kunstig Intelligens", "OpenAI", "Anthropic", "DeepMind", "Version2", "LLM", "Machine Learning"],
  authors: [{ name: "Adam Bindslev" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da" className="dark">
      <body className="min-h-screen bg-[#0a0d12] text-gray-100 antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
