"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Providers from "@/providers/Providers";
import QueryProvider from "@/providers/QueryProvider";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SideBar } from "@/components/SideBar/SideBar";
import { Header } from "@/components/Header/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const HIDDEN_PAGES = [
  "/auth/sign-up",
  "/auth/login",
  "/auth/forgot-password",
  "/auth/verify-otp",
  "/auth/new-password",
] as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setSidebarVisible((prev) => !prev);
  const closeSidebar = () => isSidebarVisible && setSidebarVisible(false);

  const isHiddenPage = HIDDEN_PAGES.includes(
    pathname as (typeof HIDDEN_PAGES)[number]
  );

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    if (isSidebarVisible && isMobile) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isSidebarVisible, isMobile]);

  return (
    <html lang="en">
      <head>
        <title>Copa Business</title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Providers>
            <QueryProvider>
              {!isHiddenPage && (
                <>
                  <div
                    className={`fixed w-[250px] z-50 transition-transform duration-300 ${
                      isSidebarVisible ? "translate-x-0" : "-translate-x-full"
                    }`}
                    aria-hidden={!isSidebarVisible}
                  >
                    <SideBar closeSidebar={closeSidebar} />
                  </div>
                  {isSidebarVisible && (
                    <div
                      className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition duration-300"
                      onClick={closeSidebar}
                      role="presentation"
                    />
                  )}
                </>
              )}
              <main
                className={`flex-1 transition-all duration-300 ${
                  !isHiddenPage && isSidebarVisible
                    ? "md:ml-[250px] ml-0"
                    : "ml-0"
                }`}
              >
                {!isHiddenPage && (
                  <div className="sticky top-0 z-20 bg-white">
                    <Header toggleSidebar={toggleSidebar} />
                  </div>
                )}
                {children}
              </main>
            </QueryProvider>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
