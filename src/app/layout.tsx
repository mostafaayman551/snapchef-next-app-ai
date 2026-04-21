import type { Metadata } from "next";
import { Alegreya } from "next/font/google";
import "./globals.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import ClientProviders from "./ClientProviders";
const alegreya = Alegreya({
  subsets: ["latin"],
  display: "swap",
});
export const metadata: Metadata = {
  title: "SnapChef AI Chef",
  description: "Snap a Pic, Get a Recipe | SnapChef AI Chef",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={alegreya.className} suppressHydrationWarning>
        <ClientProviders>
          <Header />
          {children}
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
