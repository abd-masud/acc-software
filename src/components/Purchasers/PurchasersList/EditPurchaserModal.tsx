"use client";

import { Modal } from "antd";
import { EditPurchaserModalProps } from "@/types/purchasers";
import { useEffect, useState } from "react";
import { FaXmark } from "react-icons/fa6";

export const EditPurchaserModal: React.FC<EditPurchaserModalProps> = ({
  isOpen,
  onClose,
  currentPurchaser,
  onSave,
}) => {
  const [purchaserId, setPurchaserId] = useState("");
  const [purchaserName, setPurchaserName] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [userMessage, setUserMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentPurchaser) {
      setPurchaserId(currentPurchaser.purchaser_id);
      setPurchaserName(currentPurchaser.name);
      setCompany(currentPurchaser.company);
      setAddress(currentPurchaser.address);
      setEmail(currentPurchaser.email);
      setContact(currentPurchaser.contact);
    }
  }, [currentPurchaser]);

  const handleSubmit = async () => {
    if (!currentPurchaser) return;

    if (
      !purchaserName.trim() ||
      !company.trim() ||
      !address.trim() ||
      !email.trim() ||
      !contact.trim()
    ) {
      setUserMessage("Fill in all fields");
      setTimeout(() => setUserMessage(null), 5000);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setUserMessage("Invalid email address");
      setTimeout(() => setUserMessage(null), 5000);
      return;
    }
    if (contact.length !== 11) {
      setUserMessage("Contact number must be 11 digits");
      setTimeout(() => setUserMessage(null), 5000);
      return;
    }

    try {
      const updatedPurchaser = {
        ...currentPurchaser,
        purchaserId,
        name: purchaserName,
        company,
        address,
        email,
        contact,
      };

      await onSave(updatedPurchaser);
    } catch (err) {
      console.error(err);
      setUserMessage("Failed to update purchaser");
    } finally {
      setTimeout(() => setUserMessage(null), 5000);
    }
  };

  const handleCloseMessage = () => {
    setUserMessage(null);
  };

  return (
    <Modal open={isOpen} onOk={handleSubmit} onCancel={onClose} okText="Save">
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
      <div className="flex items-center pb-3">
        <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
        <h2 className="text-[13px] font-[500]">Edit Purchaser</h2>
      </div>
      <div className="mb-2">
        <label className="text-[14px]" htmlFor="purchaser_id">
          Purchaser ID
        </label>
        <input
          placeholder="Enter purchaser id"
          className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
          type="text"
          id="purchaser_id"
          value={purchaserId}
          readOnly
        />
      </div>
      <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-4 gap-0">
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="name">
            Purchaser Name
          </label>
          <input
            placeholder="Enter purchaser name"
            maxLength={50}
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            type="text"
            id="name"
            value={purchaserName}
            onChange={(e) => setPurchaserName(e.target.value)}
            required
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
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
        </div>
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
          value={address}
          onChange={(e) => setAddress(e.target.value)}
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
            maxLength={50}
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={contact}
            minLength={11}
            maxLength={11}
            onChange={(e) => setContact(e.target.value)}
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
            required
          />
        </div>
      </div>
    </Modal>
  );
};
