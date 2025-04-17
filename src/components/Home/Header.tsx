"use client";

import Image from "next/image";
import { FiCalendar } from "react-icons/fi";
import logo from "../../../public/images/logo.png";
import { useAuth } from "@/contexts/AuthContext";

export const HomeHeader = () => {
  const { user } = useAuth();
  return (
    <div className="grid md:grid-cols-2 grid-cols-1 mb-6">
      <div className="flex items-center mb-4 md:mb-0">
        <Image
          className="mr-3"
          priority
          src={user?.logo || logo}
          height={40}
          width={40}
          alt="Copa Accounting Logo"
        />
        <h1 className="text-[22px] font-bold text-gray-800">
          {user?.company || "Your Company"}
        </h1>
      </div>
      <div className="flex items-center md:justify-end justify-center">
        <div className="flex items-center justify-center bg-white gap-2 px-4 py-2 rounded-lg shadow-sm md:w-auto w-full">
          <FiCalendar className="text-gray-500" />
          <span className="text-gray-700 font-medium">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
