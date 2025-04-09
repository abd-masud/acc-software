import Image from "next/image";
import logo from "../../../public/images/logo.png";

export const HomeComponent = () => {
  return (
    <main className="bg-auth_bg bg-cover bg-center bg-fixed h-[calc(100vh-70px)]">
      <div className="flex items-center justify-center pt-10">
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
    </main>
  );
};
