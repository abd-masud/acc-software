"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import success from "../../../../public/images/success.png";
import { Modal } from "antd";
import { FaXmark } from "react-icons/fa6";

export const AddPurchasersForm = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [purchaser_id, setPurchaserId] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userMessage, setUserMessage] = useState<string | null>(null);

  const [formValues, setFormValues] = useState({
    purchaser_id: "",
    company: "",
    owner: "",
    address: "",
    email: "",
    contact: "",
  });

  useEffect(() => {
    const generatePurchaserId = () => {
      const compPrefix = user?.company
        ? user.company.slice(0, 2).toUpperCase()
        : "CO";
      const random = Math.floor(10000 + Math.random() * 90000);
      return `B${compPrefix}${random}`;
    };

    setPurchaserId(generatePurchaserId());
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormValues({ ...formValues, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setUserMessage(null);

    const payload = {
      ...formValues,
      user_id: user?.id,
      purchaser_id: purchaser_id,
    };

    try {
      const res = await fetch("/api/purchasers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add purchaser");
      }
      setShowSuccessModal(true);
    } catch (error: any) {
      setUserMessage(error || "An unexpected error occurred");
    } finally {
      setTimeout(() => setUserMessage(null), 5000);
      setLoading(false);
    }
  };

  const handleAddMore = () => {
    setFormValues({
      purchaser_id: "",
      company: "",
      owner: "",
      address: "",
      email: "",
      contact: "",
    });

    const compPrefix = user?.company
      ? user.company.slice(0, 2).toUpperCase()
      : "CO";
    const random = Math.floor(10000 + Math.random() * 90000);
    setPurchaserId(`B${compPrefix}${random}`);

    setShowSuccessModal(false);
  };

  const handleOkay = () => {
    setShowSuccessModal(false);
    router.push("/purchasers/purchasers-list");
  };

  const handleCloseMessage = () => {
    setUserMessage(null);
  };

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
      {userMessage && (
        <div className="left-1/2 top-10 transform -translate-x-1/2 fixed z-50">
          <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800 text-red-400 border-2 border-red-400 mx-auto">
            <div className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              {userMessage}
            </div>
            <button
              onClick={handleCloseMessage}
              className="ml-3 focus:outline-none hover:text-red-300"
            >
              <FaXmark className="text-[14px]" />
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center pb-5">
        <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
        <h2 className="text-[13px] font-[500]">Add Purchaser Form</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-4 gap-0">
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="purchaser_id">
              Purchaser ID
            </label>
            <input
              placeholder="Enter purchaser id"
              className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="text"
              id="purchaser_id"
              value={purchaser_id}
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="company">
              Company Name
            </label>
            <input
              placeholder="Enter company name"
              maxLength={50}
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="text"
              id="company"
              value={formValues.company}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-4 gap-0">
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="owner">
              Company owner
            </label>
            <input
              placeholder="Enter company owner"
              maxLength={50}
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="text"
              id="owner"
              value={formValues.owner}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="address">
              Address
            </label>
            <input
              placeholder="Enter address"
              maxLength={100}
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="text"
              id="address"
              value={formValues.address}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-4 gap-0">
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="email">
              Email Address
            </label>
            <input
              placeholder="Enter email address"
              maxLength={50}
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
        <div className="flex justify-end">
          <input
            className="text-[14px] font-[500] py-2 w-40 rounded cursor-pointer transition-all duration-300 mt-4 text-white bg-[#307EF3] hover:bg-[#478cf3] focus:bg-[#307EF3]"
            type="submit"
            value={`${loading ? "Submitting..." : "Submit"}`}
          />
        </div>
      </form>

      <Modal
        open={showSuccessModal}
        onCancel={handleOkay}
        footer={[
          <button
            key="addMore"
            onClick={handleAddMore}
            className="text-[14px] font-[500] py-2 w-28 rounded cursor-pointer transition-all duration-300 mt-2 mr-2 text-white bg-[#307EF3] hover:bg-[#478cf3] focus:bg-[#307EF3]"
          >
            Add More
          </button>,
          <button
            key="okay"
            onClick={handleOkay}
            className="text-[14px] font-[500] py-2 w-20 rounded cursor-pointer transition-all duration-300 mt-2 text-white bg-[#307EF3] hover:bg-[#478cf3] focus:bg-[#307EF3]"
          >
            Okay
          </button>,
        ]}
        centered
        width={400}
      >
        <div className="flex flex-col items-center pt-5">
          <Image src={success} alt="Success" width={80} height={80} />
          <h3 className="text-xl font-semibold mt-2">Success!</h3>
          <p className="text-gray-600 text-center">
            Purchaser has been added successfully.
          </p>
        </div>
      </Modal>
    </main>
  );
};
