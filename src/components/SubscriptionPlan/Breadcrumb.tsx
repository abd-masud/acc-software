"use client";

import React from "react";
import Link from "next/link";
import { FaAngleRight } from "react-icons/fa";

export const Breadcrumb = () => {
  return (
    <>
      <main className="pb-4 border-b flex justify-between items-center">
        <div>
          <p className="text-[16px] font-[600]">Subscription Plan</p>
          <div className="sm:block hidden">
            <div className="flex items-center">
              <Link className="text-[12px] text-[#797c8b]" href="/dashboard">
                Dashboard
              </Link>
              <FaAngleRight className="text-[12px] text-[#797c8b] mx-2" />
              <p className="text-[12px] text-[#797c8b]">Subscription Plan</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
