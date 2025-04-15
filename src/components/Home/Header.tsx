import Image from "next/image";
import { FiCalendar } from "react-icons/fi";
import logo from "../../../public/images/logo.png";

export const HomeHeader = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div className="flex items-center mb-4 md:mb-0">
        <Image
          className="mr-3"
          priority
          src={logo}
          height={40}
          width={40}
          alt="Copa Accounting Logo"
        />
        <h1 className="text-2xl font-bold text-gray-800">
          Copa Accounting 1.0
        </h1>
      </div>
      <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
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
  );
};
