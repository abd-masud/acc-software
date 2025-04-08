"use client";

import Image from "next/image";
import logo from "../../../public/images/logo.png";
import google from "../../../public/images/google.svg";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaXmark } from "react-icons/fa6";
import { useAuth } from "@/contexts/AuthContext";
import { signIn, useSession } from "next-auth/react";

export const LoginComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setUser } = useAuth();
  const { data: session, status } = useSession();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [signLoading, setSignLoading] = useState(false);

  const handleSignIn = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/auth/login",
      });

      if (result?.error) {
        setError(result.error || "Failed to sign in with Google");
      } else if (result?.url) {
        router.push(result.url || "/auth/login");
      }
    } catch {
      setError("Failed to sign in with Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (status == "authenticated" && session?.user?.accessToken) {
      localStorage.setItem("acc_user", session.user.accessToken);
      router.push("/");
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignLoading(true);
    setError(null);
    const payload = {
      email,
      password,
    };

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const { token, user: userData } = await response.json();
        setUser(userData);
        localStorage.setItem("acc_user", token);
        router.push("/");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || "Invalid email or password");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setTimeout(() => setError(null), 5000);
      setSignLoading(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <main className="bg-auth_bg bg-cover bg-center bg-fixed h-screen flex justify-center items-center relative">
      {error && (
        <div className="flex items-center px-4 py-2 mb-4 rounded-lg bg-gray-800 text-red-400 border-2 border-red-400 absolute top-5 right-5">
          <div className="text-sm font-medium">{error}</div>
          <button onClick={handleCloseError}>
            <FaXmark className="ml-3 text-[14px]" />
          </button>
        </div>
      )}
      <div className="bg-white rounded-md border shadow-lg sm:p-10 p-5 w-[450px] mx-5">
        <div className="flex justify-center mb-5">
          <Link href={"/"}>
            <div className="flex items-center justify-center">
              <Image
                className="mr-3"
                priority
                src={logo}
                height={40}
                width={40}
                alt={"Logo"}
              />
              <p className="text-black font-[600] sm:text-[24px] text-[22px]">
                Copa Accounting
              </p>
            </div>
          </Link>
        </div>
        <h2 className="text-[18px] font-[600] text-[#363636] mb-2">
          Sign in to account
        </h2>

        <button
          className="flex items-center justify-center w-full py-2 text-[14px] font-[500] border bg-gray-100 hover:bg-gray-200 text-black rounded transition-all duration-300"
          onClick={handleSignIn}
          disabled={googleLoading}
        >
          {!googleLoading ? (
            <>
              <Image src={google} alt="Google icon" className="w-5 h-5 mr-2" />
              Sign in with Google
            </>
          ) : (
            "Signing in..."
          )}
        </button>

        <div>
          <p className="text-[#131226] text-[14px] font-[600] my-2 text-center">
            Or continue with email
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="email">
              Email Address
            </label>
            <input
              placeholder="Enter email address"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#EAF2FE] hover:border-[#B9C1CC] focus:outline-none focus:right-0 focus:border-[#B9C1CC] rounded-md transition-all duration-300  mt-2"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="password">
              Password
            </label>
            <input
              placeholder="Enter password"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#EAF2FE] hover:border-[#B9C1CC] focus:outline-none focus:right-0 focus:border-[#B9C1CC] rounded-md transition-all duration-300  mt-2"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <input className="mr-3" type="checkbox" id="remember" />
              <label className="text-[14px]" htmlFor="remember">
                Remember Me
              </label>
            </div>
            <Link
              className="text-[14px] text-[#307EF3] tracking-wide"
              href={"/auth/forgot-password"}
            >
              Forgot password?
            </Link>
          </div>
          <button
            className="text-[14px] bg-[#307EF3] hover:bg-[#478cf3] w-full py-2 rounded text-white cursor-pointer focus:bg-[#307EF3] transition-all duration-300 "
            disabled={signLoading}
          >
            {!signLoading ? "Sign in" : "Signing in..."}
          </button>
          <p className="text-[14px] text-[#9B9B9B] mt-4 tracking-wide">
            Don&apos;t have account?{" "}
            <Link className="text-[#307EF3]" href={"/auth/sign-up"}>
              Create account
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
};
