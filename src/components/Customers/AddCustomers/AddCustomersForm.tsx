"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

export const AddCustomersForm = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customer_id, setCustomerId] = useState("");

  const [formValues, setFormValues] = useState({
    customer_id: "",
    name: "",
    delivery: "",
    email: "",
    contact: "",
    remarks: "",
  });

  useEffect(() => {
    const generateCustomerId = () => {
      const compPrefix = user?.company
        ? user.company.slice(0, 2).toUpperCase()
        : "COM";
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const random = Math.floor(1000 + Math.random() * 9000);
      return `C${compPrefix}${year}${month}${day}${random}`;
    };

    setCustomerId(generateCustomerId());
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormValues({ ...formValues, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formValues,
      user_id: user?.id,
      customer_id: customer_id,
    };

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFormValues({
          customer_id: "",
          name: "",
          delivery: "",
          email: "",
          contact: "",
          remarks: "",
        });
        router.push("/customers/customers-list");
      } else {
        // Handle error
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
      <div className="flex items-center pb-5">
        <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
        <h2 className="text-[13px] font-[500]">Add Customer Form</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-4 gap-0">
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="customer_id">
              Customer ID
            </label>
            <input
              placeholder="Enter customer id"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="text"
              id="customer_id"
              value={customer_id}
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="name">
              Customer Name
            </label>
            <input
              placeholder="Enter customer name"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="text"
              id="name"
              value={formValues.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="delivery">
            Delivery Address
          </label>
          <input
            placeholder="Enter delivery address"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            type="text"
            id="delivery"
            value={formValues.delivery}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-4 gap-0">
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="email">
              Email Address
            </label>
            <input
              placeholder="Enter email address"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="email"
              id="email"
              value={formValues.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="contact">
              Contact Number
            </label>
            <input
              placeholder="Enter contact number"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              id="contact"
              value={formValues.contact}
              onChange={handleChange}
              minLength={11}
              maxLength={11}
              required
              onKeyDown={(e) => {
                if (
                  !/[0-9]/.test(e.key) &&
                  e.key !== "Backspace" &&
                  e.key !== "Delete" &&
                  e.key !== "Tab" &&
                  e.key !== "ArrowLeft" &&
                  e.key !== "ArrowRight"
                ) {
                  e.preventDefault();
                }
              }}
            />
          </div>
        </div>
        <div className="">
          <label className="text-[14px]" htmlFor="remarks">
            Remarks
          </label>
          <textarea
            placeholder="Enter remarks"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            id="remarks"
            value={formValues.remarks}
            onChange={handleChange}
          />
        </div>
        <div className="flex justify-end">
          <input
            className="text-[14px] font-[500] py-2 w-40 rounded cursor-pointer transition-all duration-300 mt-4 text-white bg-[#307EF3] hover:bg-[#478cf3] focus:bg-[#307EF3]"
            type="submit"
            value={`${loading ? "Submitting..." : "Submit"}`}
          />
        </div>
      </form>
    </main>
  );
};
