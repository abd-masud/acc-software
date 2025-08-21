"use client";

import React, { useEffect, useState } from "react";
import { FaAngleRight } from "react-icons/fa";
import {
  Modal,
  Button,
  // Radio
} from "antd";
import { useAuth } from "@/contexts/AuthContext";
import { FaXmark } from "react-icons/fa6";
import Link from "next/link";

interface BreadcrumbProps {
  onWarehouseAdded?: () => void;
}

export const Breadcrumb = ({ onWarehouseAdded }: BreadcrumbProps) => {
  const { user } = useAuth();
  const [warehouse_id, setWarehouseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [warehouseOption, setWarehouseOption] = useState<string>("cabinet");
  const [storeId, setStoreId] = useState("");

  const [formValues, setFormValues] = useState({
    warehouse: "",
    address: "",
  });

  const showModal = () => {
    setIsModalVisible(true);
  };

  useEffect(() => {
    const generateWarehouseId = () => {
      const compPrefix = user?.company
        ? user.company.slice(0, 1).toUpperCase()
        : "C";
      const random = Math.floor(100000 + Math.random() * 900000);
      return `W${compPrefix}${random}`;
    };

    setWarehouseId(generateWarehouseId());
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
      user_id: user?.id,
      warehouse_id: warehouse_id,
      has_cabinet_system: warehouseOption === "cabinet",
      ...(warehouseOption === "store" && { connected_store_id: storeId }),
    };

    try {
      const res = await fetch("/api/warehouse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add warehouse");
      }
      setIsModalVisible(false);
      setFormValues({
        warehouse: "",
        address: "",
      });
      setWarehouseOption("cabinet");
      setStoreId("");

      const compPrefix = user?.company
        ? user.company.slice(0, 1).toUpperCase()
        : "C";
      const random = Math.floor(100000 + Math.random() * 900000);
      setWarehouseId(`W${compPrefix}${random}`);

      if (onWarehouseAdded) {
        onWarehouseAdded();
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
    setWarehouseOption("cabinet");
    setStoreId("");
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
          <p className="text-[16px] font-[600]">Warehouse</p>
          <div className="sm:block hidden">
            <div className="flex items-center">
              <Link className="text-[12px] text-[#797c8b]" href="/dashboard">
                Dashboard
              </Link>
              <FaAngleRight className="text-[12px] text-[#797c8b] mx-2" />
              <p className="text-[12px] text-[#797c8b]">Stock Master</p>
              <FaAngleRight className="text-[12px] text-[#797c8b] mx-2" />
              <p className="text-[12px] text-[#797c8b]">Warehouse</p>
            </div>
          </div>
        </div>
        <Button
          type="primary"
          className="text-[14px] font-[500] py-2 px-3 rounded cursor-pointer transition-all duration-300 text-white bg-[#307EF3] hover:bg-[#478cf3] focus:bg-[#307EF3]"
          onClick={showModal}
        >
          Add Warehouse
        </Button>
      </main>

      <Modal
        title={
          <div className="flex items-center">
            <div className="h-2 w-2 bg-[#307EF3] rounded-full mr-2"></div>
            <h2 className="text-[13px] font-[500]">Add Warehouse</h2>
          </div>
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText="Save"
        confirmLoading={loading}
        width={600}
      >
        <div className="mb-2">
          <label className="text-[14px]" htmlFor="warehouse_id">
            Warehouse ID
          </label>
          <input
            placeholder="Enter warehouse id"
            className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            type="text"
            id="warehouse_id"
            value={warehouse_id}
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="warehouse">
            Warehouse Name
          </label>
          <input
            placeholder="Enter warehouse name"
            maxLength={50}
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            type="text"
            id="warehouse"
            value={formValues.warehouse}
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

        {/* <div className="mb-4">
          <label className="text-[14px] block mb-2">Attribute</label>
          <Radio.Group
            onChange={(e) => setWarehouseOption(e.target.value)}
            value={warehouseOption}
            className="w-full"
          >
            <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-3">
              <Radio value="cabinet" className="w-full">
                <div className="flex flex-col">
                  <span className="">Have Cabinet System</span>
                </div>
              </Radio>
              <Radio value="store" className="w-full">
                <div className="flex flex-col">
                  <span className="">Haven&apos;t Cabinet System</span>
                </div>
              </Radio>
            </div>
          </Radio.Group>
        </div> */}
      </Modal>
    </>
  );
};
