"use client";

import { Modal, message } from "antd";
import { EditCustomerModalProps } from "@/types/customers";
import { useEffect, useState } from "react";

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  isOpen,
  onClose,
  currentCustomer,
  onSave,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [delivery, setDelivery] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (currentCustomer) {
      setCustomerName(currentCustomer.name);
      setDelivery(currentCustomer.delivery);
      setEmail(currentCustomer.email);
      setContact(currentCustomer.contact);
      setRemarks(currentCustomer.remarks);
    }
  }, [currentCustomer]);

  const handleSubmit = async () => {
    if (!currentCustomer) return;

    try {
      const updatedCustomer = {
        ...currentCustomer,
        name: customerName,
        delivery,
        email,
        contact,
        remarks,
      };

      await onSave(updatedCustomer);
    } catch (err) {
      console.error(err);
      message.error("Failed to update customer");
    }
  };

  return (
    <Modal open={isOpen} onOk={handleSubmit} onCancel={onClose} okText="Save">
      <div className="flex items-center pb-3">
        <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
        <h2 className="text-[13px] font-[500]">Edit Customer</h2>
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
            required
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
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="text-[14px]" htmlFor="remarks">
          Remarks
        </label>
        <textarea
          placeholder="Enter remarks"
          className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
          id="remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </div>
    </Modal>
  );
};
