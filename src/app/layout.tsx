import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Lato } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import Providers from "@/providers/Providers";
import LayoutContent from "./Server/LayoutContent";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  weight: ["400", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Copa Business</title>
      </head>
      <body
        className={`${lato.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <Providers>
            <LayoutContent>{children}</LayoutContent>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
