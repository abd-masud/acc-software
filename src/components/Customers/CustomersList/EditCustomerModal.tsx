"use client";

import { Modal } from "antd";
import { EditCustomerModalProps } from "@/types/customers";
import { useEffect, useState } from "react";
import { FaXmark } from "react-icons/fa6";

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  isOpen,
  onClose,
  currentCustomer,
  onSave,
}) => {
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [delivery, setDelivery] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [userMessage, setUserMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentCustomer) {
      setCustomerId(currentCustomer.customer_id);
      setCustomerName(currentCustomer.name);
      setDelivery(currentCustomer.delivery);
      setEmail(currentCustomer.email);
      setContact(currentCustomer.contact);
    }
  }, [currentCustomer]);

  const handleSubmit = async () => {
    if (!currentCustomer) return;

    if (
      !customerName.trim() ||
      !delivery.trim() ||
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
      const updatedCustomer = {
        ...currentCustomer,
        customerId,
        name: customerName,
        delivery,
        email,
        contact,
      };

      await onSave(updatedCustomer);
    } catch (err) {
      console.error(err);
      setUserMessage("Failed to update customer");
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
        <h2 className="text-[13px] font-[500]">Edit Customer</h2>
      </div>
      <div className="mb-2">
        <label className="text-[14px]" htmlFor="customer_id">
          Customer ID
        </label>
        <input
          placeholder="Enter customer id"
          className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
          type="text"
          id="customer_id"
          value={customerId}
          readOnly
        />
      </div>
      <div className="mb-4">
        <label className="text-[14px]" htmlFor="name">
          Customer Name
        </label>
        <input
          placeholder="Enter customer name"
          maxLength={50}
          className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
          type="text"
          id="name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="text-[14px]" htmlFor="delivery">
          Delivery Address
        </label>
        <input
          placeholder="Enter delivery address"
          maxLength={100}
          className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
          type="text"
          id="delivery"
          value={delivery}
          onChange={(e) => setDelivery(e.target.value)}
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
