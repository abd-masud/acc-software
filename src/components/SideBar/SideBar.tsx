"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/images/logo.png";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AiFillDashboard, AiFillProduct } from "react-icons/ai";
import { FaGear, FaMoneyBillTrendUp, FaUsers } from "react-icons/fa6";
import { FaChevronDown, FaUserTie } from "react-icons/fa";
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
          Copa Business
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
            ? "max-h-[90px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="pl-[56px] bg-[#1D1B31] text-[13px]">
          <Link
            className={subLinkClass("/invoices/create-invoices")}
            href="/invoices/create-invoices"
            onClick={handleSubMenuClick}
          >
            Create Invoices
          </Link>

          <Link
            className={subLinkClass("/invoices/invoices-list")}
            href="/invoices/invoices-list"
            onClick={handleSubMenuClick}
          >
            Invoices List
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
          <FaMoneyBillTrendUp className="ml-[21px] text-[16px] mr-3 w-5" />
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
            onClick={handleSubMenuClick}
          >
            Create Quotes
          </Link>

          <Link
            className={subLinkClass("/quotes/quotes-list")}
            href="/quotes/quotes-list"
            onClick={handleSubMenuClick}
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
            onClick={handleSubMenuClick}
          >
            Add Employees
          </Link>

          <Link
            className={subLinkClass("/employees/employees-list")}
            href="/employees/employees-list"
            onClick={handleSubMenuClick}
          >
            Employees List
          </Link>
        </div>
      </div>

      <Link
        href={"/sales-report"}
        className={linkClass("/sales-report")}
        onClick={closeSubmenu}
      >
        <div className={linkBar("/sales-report")}></div>
        <GiNotebook className="ml-[21px] text-[16px] mr-3 w-5" />
        Sales Report
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
            ? "max-h-[225px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="pl-[56px] bg-[#1D1B31] text-[13px]">
          <Link
            className={subLinkClass("/settings/currency-settings")}
            href="/settings/currency-settings"
            onClick={handleSubMenuClick}
          >
            Currency Settings
          </Link>

          <Link
            className={subLinkClass("/settings/general-settings")}
            href="/settings/general-settings"
            onClick={handleSubMenuClick}
          >
            General Settings
          </Link>

          <Link
            className={subLinkClass("/settings/policy-settings")}
            href="/settings/policy-settings"
            onClick={handleSubMenuClick}
          >
            Policy Settings
          </Link>

          <Link
            className={subLinkClass("/settings/smtp-settings")}
            href="/settings/smtp-settings"
            onClick={handleSubMenuClick}
          >
            SMTP Settings
          </Link>

          <Link
            className={subLinkClass("/settings/roles-and-permissions")}
            href="/settings/roles-and-permissions"
            onClick={handleSubMenuClick}
          >
            Roles & Permissions
          </Link>
        </div>
      </div>
    </main>
  );
};
