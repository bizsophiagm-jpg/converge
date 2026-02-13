import "./globals.css";
import { ReactNode } from "react";
import { Nav } from "../components/Nav";

export const metadata = {
  title: "Converge",
  description: "Private investigative intelligence map"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto max-w-md min-h-screen flex flex-col">
          <header className="px-4 pt-4 pb-2">
            <div className="text-xl font-semibold tracking-tight">Converge</div>
            <div className="text-xs text-slate-400">Mobile-first investigative graph</div>
          </header>

          <main className="flex-1 px-4 pb-24">{children}</main>

          <Nav />
        </div>
      </body>
    </html>
  );
}
