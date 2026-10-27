import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Proofcase — Digital Evidence Vault",
  description: "A secure workspace for digital evidence and chain of custody.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
