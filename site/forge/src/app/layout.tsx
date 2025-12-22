import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import BackButton from "@/components/BackButton";

const forgeSans = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-forge-sans",
});

const forgeBody = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-forge-body",
});

export const metadata: Metadata = {
  title: "THE FORGE",
  description: "A system of judgment, not taste.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${forgeSans.variable} ${forgeBody.variable} forge-body`}>
        <header className="forge-header">
          <a className="forge-brand" href="/">
            <img
              className="forge-logo"
              src="/img/theForge_logo.png"
              alt="The Forge"
              width={120}
              height={120}
            />
            <span className="forge-brandText">THE FORGE</span>
          </a>
          <nav className="forge-nav">
            <a href="/crucible">Crucible</a>
            <a href="/anvil">Anvil</a>
            <a href="/dossier">Dossier</a>
            <a href="/archive">Archive</a>
            <a href="/indexer">Index</a>
            <a href="/how-the-forge-works">How the Forge Works</a>
            <a href="/manifesto">Manifesto</a>
            <a href="/about">About</a>
          </nav>
        </header>
        <BackButton />
        {children}
        <footer className="forge-footer">
          <div className="forge-footerBrand">
            <img
              className="forge-logoSmall"
              src="/img/theForge_logo.png"
              alt="The Forge"
              width={72}
              height={72}
            />
            <span className="forge-footerTagline">
              Forged structures. No mythology.
            </span>
          </div>
          <div className="forge-footerLinks">
            Methodology &middot;{" "}
            <a href="/how-the-forge-works">How the Forge Works</a>
            {" "} &middot;{" "}
            <a href="https://buttondown.email/theforge">Join the Forgeletter</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
