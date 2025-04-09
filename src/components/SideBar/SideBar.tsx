"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/images/logo.png";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AiFillDashboard, AiFillProduct } from "react-icons/ai";
import {
  FaBookBookmark,
  FaGear,
  FaMoneyBillTrendUp,
  FaUsers,
} from "react-icons/fa6";
import { FaChevronDown } from "react-icons/fa";
import { BsCalendar2DateFill } from "react-icons/bs";
import { GiNotebook } from "react-icons/gi";

export const SideBar = () => {
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection == section ? null : section);
  };

  const handleSubMenuClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  };

  const closeSubmenu = () => {
    setOpenSection(null);
  };

  const linkClass = (route: string) =>
    `text-[13px] text-[#797c8b] hover:text-white font-[500] flex items-center transition duration-300 group h-11 border-t border-[#252D37] ${
      pathname == route ? "text-white bg-[#1E2639]" : ""
    }`;

  const subLinkClass = (route: string) =>
    `text-[13px] text-[#797c8b] hover:text-white font-[500] flex items-center transition duration-300 group h-11 ${
      pathname == route ? "text-white" : ""
    }`;

  const linkBar = (route: string) =>
    `bg-[#307DF1] h-[23px] w-[3px] group-hover:opacity-100 opacity-0 transition duration-300 ${
      pathname == route ? "opacity-100" : ""
    }`;

  return (
    <main className="bg-[#131226] h-screen">
      <Link
        className="text-white font-bold flex items-center text-[30px] px-8 py-[19.5px]"
        href={"/"}
      >
        <Image height={30} src={logo} alt={"Logo"} priority />
        <span className="text-white text-[18px] font-bold ml-2">
          Copa Accounting
        </span>
      </Link>
      <Link href={"/"} className={linkClass("/")} onClick={closeSubmenu}>
        <div className={linkBar("/")}></div>
        <AiFillDashboard className="ml-[21px] text-[16px] mr-3 w-5" />
        Dashboard
      </Link>

      <button
        onClick={() => toggleSection("customers")}
        className={`text-[13px] text-[#797c8b] hover:text-white font-[500] flex items-center justify-between pr-5 transition duration-300 group h-11 w-full border-t border-[#252D37] ${
          pathname.includes("/customers") ? "text-white bg-[#1E2639]" : ""
        }`}
      >
        <div className="flex items-center">
          <div
            className={`h-[23px] w-[3px] group-hover:bg-[#307DF1] transition duration-300 ${
              pathname.includes("/customers")
                ? "bg-[#307DF1]"
                : "bg-transparent"
            }`}
          ></div>
          <FaUsers className="ml-[21px] text-[16px] mr-3 w-5" />
          Customers
        </div>
        <FaChevronDown />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 transform ${
          openSection == "customers"
            ? "max-h-[90px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="pl-[56px] bg-[#1D1B31] text-[13px]">
          <Link
            className={subLinkClass("/customers/add-customers")}
            href="/customers/add-customers"
            onClick={handleSubMenuClick}
          >
            Add Customers
          </Link>

          <Link
            className={subLinkClass("/customers/customers-list")}
            href="/customers/customers-list"
            onClick={handleSubMenuClick}
          >
            Customers List
          </Link>
        </div>
      </div>

      <button
        onClick={() => toggleSection("invoice")}
        className={`text-[13px] text-[#797c8b] hover:text-white font-[500] flex items-center justify-between pr-5 transition duration-300 group h-11 w-full border-t border-[#252D37] ${
          pathname.includes("/invoice") ? "text-white bg-[#1E2639]" : ""
        }`}
      >
        <div className="flex items-center">
          <div
            className={`h-[23px] w-[3px] group-hover:bg-[#307DF1] transition duration-300 ${
              pathname.includes("/invoice") ? "bg-[#307DF1]" : "bg-transparent"
            }`}
          ></div>
          <FaMoneyBillTrendUp className="ml-[21px] text-[16px] mr-3 w-5" />
          Invoice
        </div>
        <FaChevronDown />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 transform ${
          openSection == "invoice"
            ? "max-h-[90px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="pl-[56px] bg-[#1D1B31] text-[13px]">
          <Link
            className={subLinkClass("/invoice/create-invoice")}
            href="/invoice/create-invoice"
            onClick={handleSubMenuClick}
          >
            Create Invoice
          </Link>

          <Link
            className={subLinkClass("/invoice/invoice-list")}
            href="/invoice/invoice-list"
            onClick={handleSubMenuClick}
          >
            Invoice List
          </Link>
        </div>
      </div>

      <button
        onClick={() => toggleSection("products")}
        className={`text-[13px] text-[#797c8b] hover:text-white font-[500] flex items-center justify-between pr-5 transition duration-300 group h-11 w-full border-t border-[#252D37] ${
          pathname.includes("/products") ? "text-white bg-[#1E2639]" : ""
        }`}
      >
        <div className="flex items-center">
          <div
            className={`h-[23px] w-[3px] group-hover:bg-[#307DF1] transition duration-300 ${
              pathname.includes("/products") ? "bg-[#307DF1]" : "bg-transparent"
            }`}
          ></div>
          <AiFillProduct className="ml-[21px] text-[16px] mr-3 w-5" />
          Products
        </div>
        <FaChevronDown />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 transform ${
          openSection == "products"
            ? "max-h-[90px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="pl-[56px] bg-[#1D1B31] text-[13px]">
          <Link
            className={subLinkClass("/products/add-products")}
            href="/products/add-products"
            onClick={handleSubMenuClick}
          >
            Add Products
          </Link>

          <Link
            className={subLinkClass("/products/products-list")}
            href="/products/products-list"
            onClick={handleSubMenuClick}
          >
            Products List
          </Link>
        </div>
      </div>

      <Link
        href={"/date-to-date-sales"}
        className={linkClass("/date-to-date-sales")}
        onClick={closeSubmenu}
      >
        <div className={linkBar("/date-to-date-sales")}></div>
        <BsCalendar2DateFill className="ml-[21px] text-[16px] mr-3 w-5" />
        Date to Date Sales
      </Link>

      <Link
        href={"/party-ledger"}
        className={linkClass("/party-ledger")}
        onClick={closeSubmenu}
      >
        <div className={linkBar("/party-ledger")}></div>
        <FaBookBookmark className="ml-[21px] text-[16px] mr-3 w-5" />
        Party Ledger
      </Link>

      <Link
        href={"/all-sales-report"}
        className={linkClass("/all-sales-report")}
        onClick={closeSubmenu}
      >
        <div className={linkBar("/all-sales-report")}></div>
        <GiNotebook className="ml-[21px] text-[16px] mr-3 w-5" />
        All Sales Report
      </Link>

      <button
        onClick={() => toggleSection("settings")}
        className={`text-[13px] text-[#797c8b] hover:text-white font-[500] flex items-center justify-between pr-5 transition duration-300 group h-11 w-full border-t border-[#252D37] ${
          pathname.includes("/settings") ? "text-white bg-[#1E2639]" : ""
        }`}
      >
        <div className="flex items-center">
          <div
            className={`h-[23px] w-[3px] group-hover:bg-[#307DF1] transition duration-300 ${
              pathname.includes("/settings") ? "bg-[#307DF1]" : "bg-transparent"
            }`}
          ></div>
          <FaGear className="ml-[21px] text-[16px] mr-3 w-5" />
          Settings
        </div>
        <FaChevronDown />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 transform ${
          openSection == "settings"
            ? "max-h-[135px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="pl-[56px] bg-[#1D1B31] text-[13px]">
          <Link
            className={subLinkClass("/terms-conditions")}
            href="/terms-conditions"
            onClick={handleSubMenuClick}
          >
            Terms & Conditions
          </Link>

          <Link
            className={subLinkClass("/privacy-policy")}
            href="/privacy-policy"
            onClick={handleSubMenuClick}
          >
            Privacy Policy
          </Link>

          <Link
            className={subLinkClass("/refund-policy")}
            href="/refund-policy"
            onClick={handleSubMenuClick}
          >
            Refund Policy
          </Link>
        </div>
      </div>
    </main>
  );
};
