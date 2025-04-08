"use client";

import { Popover } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import logo from "../../../public/images/logo.png";
import Image from "next/image";
import dummy from "../../../public/images/dummy.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { FaUser } from "react-icons/fa";
import { FaKey } from "react-icons/fa6";
import { FaRightFromBracket } from "react-icons/fa6";
import { signOut } from "next-auth/react";

export const Header = () => {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("acc_user");
      localStorage.removeItem("userEmail");
      await signOut({
        redirect: false,
        callbackUrl: "/auth/login",
      });
      router.push("/auth/login");
    } catch {}
  };

  const popoverContent = (
    <div className="w-52">
      <div className="flex border-b mt-1 pl-3">
        <div className="mb-4">
          <p className="font-[500] text-black text-[14px]">{user?.name}</p>
          <p className="text-[13px] text-[#797c8b] capitalize">{user?.role}</p>
        </div>
      </div>
      <div className="flex flex-col gap-1 my-3 border-b">
        <Link
          className="flex items-center bg-white text-black hover:bg-[#EDF2F6] hover:text-[#00A3FF] transition-all duration-300  px-3 py-2 rounded text-[14px]"
          href={"/profile"}
        >
          <FaUser className="text-[12px] mr-3" />
          <span>My Profile</span>
        </Link>
        <Link
          className="flex items-center bg-white text-black hover:bg-[#EDF2F6] hover:text-[#00A3FF] transition-all duration-300  px-3 py-2 rounded text-[14px] mb-3"
          href={"/auth/change-password"}
        >
          <FaKey className="text-[12px] mr-3" />
          <span>Change Password</span>
        </Link>
      </div>
      <button
        className="flex items-center bg-red-500 text-white hover:bg-red-600 cursor-pointer transition-all duration-300  py-2 px-5 rounded-md ml-3 font-[500] my-2"
        onClick={handleSignOut}
      >
        <FaRightFromBracket className="mr-2" />
        <span>Log out</span>
      </button>
    </div>
  );

  return (
    <main className="flex justify-between items-center h-[70px] p-5 shadow-md w-full bg-white border-b border-[#dddddd]">
      <Link href={"/"}>
        <div className="flex items-center justify-center">
          <Image
            className="mr-1"
            priority
            src={logo}
            height={30}
            width={30}
            alt={"Logo"}
          />
          <p className="text-black font-[700]">Copa Accounting</p>
        </div>
      </Link>
      <Popover content={popoverContent} trigger="click" placement="bottomRight">
        <button className="flex items-center border-2 border-[#307DF1] rounded-full overflow-hidden">
          <Image
            className="h-[42px] w-[42px]"
            src={user?.image || dummy}
            height={225}
            width={225}
            alt={"User"}
          />
        </button>
      </Popover>
    </main>
  );
};
