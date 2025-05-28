"use client";

import React from "react";
import Link from "next/link";
import { FaAngleRight } from "react-icons/fa";

export const Breadcrumb = () => {
  return (
    <>
      <main className="pb-4 border-b flex justify-between items-center">
        <div>
          <p className="text-[16px] font-[600]">Employee Settings</p>
          <div className="md:block hidden">
            <div className="flex items-center">
              <Link className="text-[12px] text-[#797c8b]" href="/dashboard">
                Dashboard
              </Link>
              <FaAngleRight className="text-[12px] text-[#797c8b] mx-2" />
              <p className="text-[12px] text-[#797c8b]">Employees</p>
              <FaAngleRight className="text-[12px] text-[#797c8b] mx-2" />
              <p className="text-[12px] text-[#797c8b]">Employee Settings</p>
            </div>
          </div>
        </div>
        <Link
          className="text-[14px] font-[500] py-2 px-3 rounded cursor-pointer transition-all duration-300 text-white bg-[#307EF3] hover:bg-[#478cf3] focus:bg-[#307EF3]"
          href={"/employees/add-employees"}
        >
          Add Employees
        </Link>
      </main>
    </>
  );
};
