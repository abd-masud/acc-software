"use client";

import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Providers from "@/providers/Providers";
import QueryProvider from "@/providers/QueryProvider";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SideBar } from "@/components/SideBar/SideBar";
import { Header } from "@/components/Header/Header";
import { AnimatePresence, motion } from "framer-motion";
import { Lato } from "next/font/google";
import { Modal } from "antd";
import { User } from "next-auth";
import Image from "next/image";
import warning from "../../public/images/warning.png";
import { signOut } from "next-auth/react";
import { FaRightFromBracket } from "react-icons/fa6";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  weight: ["400", "700"],
});

const HIDDEN_PAGES = [
  "/auth/sign-up",
  "/auth/login",
  "/auth/forgot-password",
  "/auth/verify-otp",
  "/auth/new-password",
  "/auth/employee-login",
] as const;

function CompanyCheck({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (
      user &&
      user?.role?.toLowerCase() !== "admin" &&
      user?.status?.toLowerCase() === "inactive"
    ) {
      setShowInactiveModal(true);
      return;
    }

    if (user?.role.toLowerCase() == "admin") {
      const requiredFields: (keyof User)[] = [
        "contact",
        "company",
        "logo",
        "address",
      ];
      const isMissingField = requiredFields.some((field) => !user[field]);

      if (isMissingField) {
        setShowModal(true);
      }
    }
  }, [user]);

  return (
    <>
      {children}
      <Modal open={showModal} footer={null} closable={false}>
        <div className="py-4 px-2">
          <div className="flex justify-center">
            <Image
              height={150}
              width={150}
              src={warning}
              alt={"Warning"}
            ></Image>
          </div>
          <h2 className="text-xl font-bold text-center mb-4">
            Profile Information Required
          </h2>
          <p>
            Please set up your profile information (Your company name, company
            logo, contact number, address) to continue using the platform.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Set Up Later
            </button>
            <button
              onClick={() => {
                router.push("/profile");
                setShowModal(false);
              }}
              className="text-[14px] font-[500] py-2 px-3 rounded cursor-pointer transition-all duration-300 text-white bg-[#307EF3] hover:bg-[#478cf3] focus:bg-[#307EF3]"
            >
              Set Up Profile
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={showInactiveModal} footer={null} closable={false}>
        <div className="py-4 px-2">
          <div className="flex justify-center">
            <Image
              height={150}
              width={150}
              src={warning}
              alt={"Warning"}
            ></Image>
          </div>
          <h2 className="text-xl font-bold text-center mb-4">
            Account Inactive
          </h2>
          <p className="text-center">
            Your account is currently inactive. Please contact your admin.
          </p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={async () => {
                setShowInactiveModal(false);
                localStorage.removeItem("acc_user");
                localStorage.removeItem("userEmail");
                await signOut({
                  redirect: false,
                  callbackUrl: "/auth/login",
                });
                router.push("/auth/login");
              }}
              className="flex items-center bg-red-500 text-white hover:bg-red-600 cursor-pointer transition-all duration-300  py-2 px-5 rounded-md ml-3 font-[500]"
            >
              <FaRightFromBracket className="mr-2" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

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
        className={`${lato.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <Providers>
            <QueryProvider>
              <CompanyCheck>
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

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={pathname}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {children}
                    </motion.div>
                  </AnimatePresence>
                </main>
              </CompanyCheck>
            </QueryProvider>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
