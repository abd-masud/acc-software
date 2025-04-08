import Image from "next/image";
import logo from "../../../public/images/logo.png";
import Link from "next/link";
import { Header } from "../Header/Header";
import { FaUserPlus } from "react-icons/fa6";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { BsCalendar2DateFill } from "react-icons/bs";
import { FaBookBookmark } from "react-icons/fa6";
import { GiNotebook } from "react-icons/gi";
import { FaUsers } from "react-icons/fa6";

export const HomeComponent = () => {
  return (
    <main className="bg-auth_bg bg-cover bg-center bg-fixed h-screen">
      <div className="sticky top-0 z-50">
        <Header />
      </div>
      <div className="flex items-center justify-center sm:my-10 my-0 mt-10">
        <Image
          className="mr-3"
          priority
          src={logo}
          height={40}
          width={40}
          alt={"Logo"}
        />
        <p className="text-black font-[700] sm:text-[26px] text-[20px]">
          Copa Accounting 1.0
        </p>
      </div>
      <div className="max-w-screen-lg mx-auto grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 p-5">
        <Link
          className="group flex justify-between items-center border-4 border-double border-gray-400 hover:border-[#307DF1] h-[120px] px-5 hover:shadow-xl bg-white transition-all duration-300  relative overflow-hidden"
          href={"/add-customer"}
        >
          <span className="text-[18px] font-[700] text-[#363636] border-l-4 border-[#307DF1] px-2 relative z-10">
            Add Customer
          </span>
          <FaUserPlus className="border-2 border-[#307DF1] h-8 w-8 p-1 bg-[#E7EFFB] text-[#307DF1] rounded-md" />
          <span className="absolute left-[-90px] top-[-50px] h-[200px] w-[50px] bg-[#E8B904] opacity-20 rotate-[35deg] transition-all duration-[550ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:left-[120%]"></span>
        </Link>

        <Link
          className="group flex justify-between items-center border-4 border-double border-gray-400 hover:border-[#307DF1] h-[120px] px-5 hover:shadow-xl bg-white transition-all duration-300  relative overflow-hidden"
          href={"/create-bill"}
        >
          <span className="text-[18px] font-[700] text-[#363636] border-l-4 border-[#307DF1] px-2 relative z-10">
            Create Bill
          </span>
          <FaMoneyBillTrendUp className="border-2 border-[#307DF1] h-8 w-8 p-1 bg-[#E7EFFB] text-[#307DF1] rounded-md" />
          <span className="absolute left-[-90px] top-[-50px] h-[200px] w-[50px] bg-[#E8B904] opacity-20 rotate-[35deg] transition-all duration-[550ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:left-[120%]"></span>
        </Link>

        <Link
          className="group flex justify-between items-center border-4 border-double border-gray-400 hover:border-[#307DF1] h-[120px] px-5 hover:shadow-xl bg-white transition-all duration-300  relative overflow-hidden"
          href={"/date-to-date-sales"}
        >
          <span className="text-[18px] font-[700] text-[#363636] border-l-4 border-[#307DF1] px-2 relative z-10">
            Date to Date Sales
          </span>
          <BsCalendar2DateFill className="border-2 border-[#307DF1] h-8 w-8 p-1 bg-[#E7EFFB] text-[#307DF1] rounded-md" />
          <span className="absolute left-[-90px] top-[-50px] h-[200px] w-[50px] bg-[#E8B904] opacity-20 rotate-[35deg] transition-all duration-[550ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:left-[120%]"></span>
        </Link>

        <Link
          className="group flex justify-between items-center border-4 border-double border-gray-400 hover:border-[#307DF1] h-[120px] px-5 hover:shadow-xl bg-white transition-all duration-300  relative overflow-hidden"
          href={"/party-ledger"}
        >
          <span className="text-[18px] font-[700] text-[#363636] border-l-4 border-[#307DF1] px-2 relative z-10">
            Party Ledger
          </span>
          <FaBookBookmark className="border-2 border-[#307DF1] h-8 w-8 p-1 bg-[#E7EFFB] text-[#307DF1] rounded-md" />
          <span className="absolute left-[-90px] top-[-50px] h-[200px] w-[50px] bg-[#E8B904] opacity-20 rotate-[35deg] transition-all duration-[550ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:left-[120%]"></span>
        </Link>

        <Link
          className="group flex justify-between items-center border-4 border-double border-gray-400 hover:border-[#307DF1] h-[120px] px-5 hover:shadow-xl bg-white transition-all duration-300  relative overflow-hidden"
          href={"/all-sales-report"}
        >
          <span className="text-[18px] font-[700] text-[#363636] border-l-4 border-[#307DF1] px-2 relative z-10">
            All Sales Report
          </span>
          <GiNotebook className="border-2 border-[#307DF1] h-8 w-8 p-1 bg-[#E7EFFB] text-[#307DF1] rounded-md" />
          <span className="absolute left-[-90px] top-[-50px] h-[200px] w-[50px] bg-[#E8B904] opacity-20 rotate-[35deg] transition-all duration-[550ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:left-[120%]"></span>
        </Link>

        <Link
          className="group flex justify-between items-center border-4 border-double border-gray-400 hover:border-[#307DF1] h-[120px] px-5 hover:shadow-xl bg-white transition-all duration-300  relative overflow-hidden"
          href={"/customer-list"}
        >
          <span className="text-[18px] font-[700] text-[#363636] border-l-4 border-[#307DF1] px-2 relative z-10">
            Customer List
          </span>
          <FaUsers className="border-2 border-[#307DF1] h-8 w-8 p-1 bg-[#E7EFFB] text-[#307DF1] rounded-md" />
          <span className="absolute left-[-90px] top-[-50px] h-[200px] w-[50px] bg-[#E8B904] opacity-20 rotate-[35deg] transition-all duration-[550ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:left-[120%]"></span>
        </Link>
      </div>
    </main>
  );
};
