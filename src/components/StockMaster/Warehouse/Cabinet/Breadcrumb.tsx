"use client";

import React, { useEffect, useState } from "react";
import { FaAngleRight } from "react-icons/fa";
import { Modal, Button } from "antd";
import { useAuth } from "@/contexts/AuthContext";
import { FaXmark } from "react-icons/fa6";
import Link from "next/link";

interface BreadcrumbProps {
  onCabinetAdded?: () => void;
  warehouseId?: string;
}

export const Breadcrumb = ({
  onCabinetAdded,
  warehouseId,
}: BreadcrumbProps) => {
  const { user } = useAuth();
  const [cabinet_id, setCabinetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userMessage, setUserMessage] = useState<string | null>(null);

  const [formValues, setFormValues] = useState({
    cabinet: "",
  });

  const showModal = () => {
    setIsModalVisible(true);
  };

  useEffect(() => {
    const generateCabinetId = () => {
      const compPrefix = user?.company
        ? user.company.slice(0, 1).toUpperCase()
        : "C";
      const random = Math.floor(100000 + Math.random() * 900000);
      return `K${compPrefix}${random}`;
    };

    setCabinetId(generateCabinetId());
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormValues({ ...formValues, [e.target.id]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setUserMessage(null);

    const payload = {
      ...formValues,
      warehouse_id: warehouseId,
      cabinet_id: cabinet_id,
    };
    try {
      const res = await fetch("/api/cabinet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add cabinet");
      }
      setIsModalVisible(false);
      setFormValues({
        cabinet: "",
      });
      const compPrefix = user?.company
        ? user.company.slice(0, 1).toUpperCase()
        : "C";
      const random = Math.floor(100000 + Math.random() * 900000);
      setCabinetId(`K${compPrefix}${random}`);
      if (onCabinetAdded) {
        onCabinetAdded();
      }
    } catch (error: any) {
      setUserMessage(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseMessage = () => {
    setUserMessage(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <main className="pb-4 border-b flex justify-between items-center">
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
        <div>
          <p className="text-[16px] font-[600]">Cabinet</p>
          <div className="sm:block hidden">
            <div className="flex items-center">
              <Link className="text-[12px] text-[#797c8b]" href="/dashboard">
                Dashboard
              </Link>
              <FaAngleRight className="text-[12px] text-[#797c8b] mx-2" />
              <p className="text-[12px] text-[#797c8b]">Stock Master</p>
              <FaAngleRight className="text-[12px] text-[#797c8b] mx-2" />
              <Link
                className="text-[12px] text-[#797c8b]"
                href={"/stock-master/cabinet"}
              >
                Warehouse
              </Link>
              <FaAngleRight className="text-[12px] text-[#797c8b] mx-2" />
              <p className="text-[12px] text-[#797c8b]">Cabinet</p>
            </div>
          </div>
        </div>
        <Button
          type="primary"
          className="text-[14px] font-[500] py-2 px-3 rounded cursor-pointer transition-all duration-300 text-white bg-[#307EF3] hover:bg-[#478cf3] focus:bg-[#307EF3]"
          onClick={showModal}
        >
          Add Cabinet
        </Button>
      </main>

      <Modal
        title={
          <div className="flex items-center">
            <div className="h-2 w-2 bg-[#307EF3] rounded-full mr-2"></div>
            <h2 className="text-[13px] font-[500]">Add Cabinet</h2>
          </div>
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText="Save"
        confirmLoading={loading}
      >
        <div className="mb-2">
          <label className="text-[14px]" htmlFor="cabinet_id">
            Cabinet ID
          </label>
          <input
            placeholder="Enter cabinet id"
            className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            type="text"
            id="cabinet_id"
            value={cabinet_id}
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="cabinet">
            Cabinet Name
          </label>
          <input
            placeholder="Enter cabinet name"
            maxLength={50}
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            type="text"
            id="cabinet"
            value={formValues.cabinet}
            onChange={handleChange}
            required
          />
        </div>
      </Modal>
    </>
  );
};
