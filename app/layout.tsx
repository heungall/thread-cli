import type { Metadata } from "next";
import "@/styles/terminal.css";

export const metadata: Metadata = {
  title: "THREADS.TERMINAL",
  description: "Threads SNS 터미널 클라이언트",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-terminal-bg text-terminal-text font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
