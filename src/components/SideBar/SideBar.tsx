"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/images/logo.png";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AiFillDashboard, AiFillProduct } from "react-icons/ai";
import {
  FaCubesStacked,
  FaGear,
  FaMoneyBillTrendUp,
  FaUsers,
} from "react-icons/fa6";
import { FaChevronDown, FaUserTie } from "react-icons/fa";
import { GiNotebook } from "react-icons/gi";
import { TbBlockquote } from "react-icons/tb";
import { useAuth } from "@/contexts/AuthContext";
import { useAccUserRedirect } from "@/hooks/useAccUser";

interface SideBarProps {
  closeSidebar?: () => void;
}

export const SideBar = ({ closeSidebar }: SideBarProps) => {
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const { user } = useAuth();
  useAccUserRedirect();
  if (!user) return null;

  const toggleSection = (section: string) => {
    setOpenSection(openSection == section ? null : section);
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768 && closeSidebar) {
      closeSidebar();
    }
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
    <main className="bg-[#131226] h-screen overflow-y-auto overflow-x-hidden scrollbar-hide">
      <Link
        className="text-white font-bold flex items-center text-[30px] px-8 py-[19.5px]"
        href={"/"}
        onClick={handleLinkClick}
      >
        <Image height={30} src={logo} alt={"Logo"} priority />
        <span className="text-white text-[18px] font-bold ml-2">
          Copa Business
        </span>
      </Link>
      <Link href={"/"} className={linkClass("/")} onClick={handleLinkClick}>
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
            onClick={handleLinkClick}
          >
            Add Customers
          </Link>

          <Link
            className={subLinkClass("/customers/customers-list")}
            href="/customers/customers-list"
            onClick={handleLinkClick}
          >
            Customers List
          </Link>
        </div>
      </div>

      <button
        onClick={() => toggleSection("invoices")}
        className={`text-[13px] text-[#797c8b] hover:text-white font-[500] flex items-center justify-between pr-5 transition duration-300 group h-11 w-full border-t border-[#252D37] ${
          pathname.includes("/invoices") ? "text-white bg-[#1E2639]" : ""
        }`}
      >
        <div className="flex items-center">
          <div
            className={`h-[23px] w-[3px] group-hover:bg-[#307DF1] transition duration-300 ${
              pathname.includes("/invoices") ? "bg-[#307DF1]" : "bg-transparent"
            }`}
          ></div>
          <FaMoneyBillTrendUp className="ml-[21px] text-[16px] mr-3 w-5" />
          Invoices
        </div>
        <FaChevronDown />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 transform ${
          openSection == "invoices"
            ? "max-h-[180px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="pl-[56px] bg-[#1D1B31] text-[13px]">
          <Link
            className={subLinkClass("/invoices/create-invoices")}
            href="/invoices/create-invoices"
            onClick={handleLinkClick}
          >
            Create Invoices
          </Link>

          <Link
            className={subLinkClass("/invoices/invoices-list")}
            href="/invoices/invoices-list"
            onClick={handleLinkClick}
          >
            Invoices List
          </Link>

          <Link
            className={subLinkClass("/invoices/open-invoices-list")}
            href="/invoices/open-invoices-list"
            onClick={handleLinkClick}
          >
            Open Invoices
          </Link>

          <Link
            className={subLinkClass("/invoices/closed-invoices-list")}
            href="/invoices/closed-invoices-list"
            onClick={handleLinkClick}
          >
            Closed Invoices
          </Link>
        </div>
      </div>

      <button
        onClick={() => toggleSection("quotes")}
        className={`text-[13px] text-[#797c8b] hover:text-white font-[500] flex items-center justify-between pr-5 transition duration-300 group h-11 w-full border-t border-[#252D37] ${
          pathname.includes("/quotes") ? "text-white bg-[#1E2639]" : ""
        }`}
      >
        <div className="flex items-center">
          <div
            className={`h-[23px] w-[3px] group-hover:bg-[#307DF1] transition duration-300 ${
              pathname.includes("/quotes") ? "bg-[#307DF1]" : "bg-transparent"
            }`}
          ></div>
          <TbBlockquote className="ml-[21px] text-[16px] mr-3 w-5" />
          Quotes
        </div>
        <FaChevronDown />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 transform ${
          openSection == "quotes"
            ? "max-h-[90px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="pl-[56px] bg-[#1D1B31] text-[13px]">
          <Link
            className={subLinkClass("/quotes/create-quotes")}
            href="/quotes/create-quotes"
            onClick={handleLinkClick}
          >
            Create Quotes
          </Link>

          <Link
            className={subLinkClass("/quotes/quotes-list")}
            href="/quotes/quotes-list"
            onClick={handleLinkClick}
          >
            Quotes List
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
            onClick={handleLinkClick}
          >
            Add Products
          </Link>

          <Link
            className={subLinkClass("/products/products-list")}
            href="/products/products-list"
            onClick={handleLinkClick}
          >
            Products List
          </Link>
        </div>
      </div>

      <button
        onClick={() => toggleSection("employees")}
        className={`text-[13px] text-[#797c8b] hover:text-white font-[500] flex items-center justify-between pr-5 transition duration-300 group h-11 w-full border-t border-[#252D37] ${
          pathname.includes("/employees") ? "text-white bg-[#1E2639]" : ""
        }`}
      >
        <div className="flex items-center">
          <div
            className={`h-[23px] w-[3px] group-hover:bg-[#307DF1] transition duration-300 ${
              pathname.includes("/employees")
                ? "bg-[#307DF1]"
                : "bg-transparent"
            }`}
          ></div>
          <FaUserTie className="ml-[21px] text-[16px] mr-3 w-5" />
          Employees
        </div>
        <FaChevronDown />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 transform ${
          openSection == "employees"
            ? "max-h-[90px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="pl-[56px] bg-[#1D1B31] text-[13px]">
          <Link
            className={subLinkClass("/employees/add-employees")}
            href="/employees/add-employees"
            onClick={handleLinkClick}
          >
            Add Employees
          </Link>

          <Link
            className={subLinkClass("/employees/employees-list")}
            href="/employees/employees-list"
            onClick={handleLinkClick}
          >
            Employees List
          </Link>
        </div>
      </div>

      <button
        onClick={() => toggleSection("sales-report")}
        className={`text-[13px] text-[#797c8b] hover:text-white font-[500] flex items-center justify-between pr-5 transition duration-300 group h-11 w-full border-t border-[#252D37] ${
          pathname.includes("/sales-report") ? "text-white bg-[#1E2639]" : ""
        }`}
      >
        <div className="flex items-center">
          <div
            className={`h-[23px] w-[3px] group-hover:bg-[#307DF1] transition duration-300 ${
              pathname.includes("/sales-report")
                ? "bg-[#307DF1]"
                : "bg-transparent"
            }`}
          ></div>
          <GiNotebook className="ml-[21px] text-[16px] mr-3 w-5" />
          Sales Report
        </div>
        <FaChevronDown />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 transform ${
          openSection == "sales-report"
            ? "max-h-[90px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="pl-[56px] bg-[#1D1B31] text-[13px]">
          <Link
            className={subLinkClass("/sales-report/all-sales-report")}
            href="/sales-report/all-sales-report"
            onClick={handleLinkClick}
          >
            All Sales Report
          </Link>
          <Link
            className={subLinkClass("/sales-report/customer-ledger")}
            href="/sales-report/customer-ledger"
            onClick={handleLinkClick}
          >
            Customer Ledger
          </Link>
        </div>
      </div>

      <button
        onClick={() => toggleSection("stock-manage")}
        className={`text-[13px] text-[#797c8b] hover:text-white font-[500] flex items-center justify-between pr-5 transition duration-300 group h-11 w-full border-t border-[#252D37] ${
          pathname.includes("/stock-manage") ? "text-white bg-[#1E2639]" : ""
        }`}
      >
        <div className="flex items-center">
          <div
            className={`h-[23px] w-[3px] group-hover:bg-[#307DF1] transition duration-300 ${
              pathname.includes("/stock-manage")
                ? "bg-[#307DF1]"
                : "bg-transparent"
            }`}
          ></div>
          <FaCubesStacked className="ml-[21px] text-[16px] mr-3 w-5" />
          Stock Manage
        </div>
        <FaChevronDown />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 transform ${
          openSection == "stock-manage"
            ? "max-h-[135px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="pl-[56px] bg-[#1D1B31] text-[13px]">
          <Link
            className={subLinkClass("/stock-manage/stock-in")}
            href="/stock-manage/stock-in"
            onClick={handleLinkClick}
          >
            Stock In
          </Link>

          <Link
            className={subLinkClass("/stock-manage/stock-out")}
            href="/stock-manage/stock-out"
            onClick={handleLinkClick}
          >
            Stock Out
          </Link>

          <Link
            className={subLinkClass("/stock-manage/stock-in-hand")}
            href="/stock-manage/stock-in-hand"
            onClick={handleLinkClick}
          >
            Stock In Hand
          </Link>
        </div>
      </div>

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
            ? "max-h-[225px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="pl-[56px] bg-[#1D1B31] text-[13px]">
          <Link
            className={subLinkClass("/settings/currency-settings")}
            href="/settings/currency-settings"
            onClick={handleLinkClick}
          >
            Currency Settings
          </Link>

          <Link
            className={subLinkClass("/settings/general-settings")}
            href="/settings/general-settings"
            onClick={handleLinkClick}
          >
            General Settings
          </Link>

          <Link
            className={subLinkClass("/settings/policy-settings")}
            href="/settings/policy-settings"
            onClick={handleLinkClick}
          >
            Policy Settings
          </Link>

          <Link
            className={subLinkClass("/settings/smtp-settings")}
            href="/settings/smtp-settings"
            onClick={handleLinkClick}
          >
            SMTP Settings
          </Link>

          <Link
            className={subLinkClass("/settings/roles-and-permissions")}
            href="/settings/roles-and-permissions"
            onClick={handleLinkClick}
          >
            Roles & Permissions
          </Link>
        </div>
      </div>
    </main>
  );
};
