"use client";

import { useCallback, useEffect, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { useAuth } from "@/contexts/AuthContext";
import { useAccUserRedirect } from "@/hooks/useAccUser";
import { Dropdown, MenuProps, Modal } from "antd";
import Link from "next/link";
import { FiEdit2, FiMoreVertical } from "react-icons/fi";
import { Cabinet } from "@/types/cabinet";

interface CabinetItemProps {
  cabinetId: string;
}

export const CabinetItemComponent = ({ cabinetId }: CabinetItemProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [cabinetsData, setCabinetsData] = useState<any[]>([]);
  const [editingCabinet, setEditingCabinet] = useState<Cabinet | null>(null);
  const [formData, setFormData] = useState({
    cabinet: "",
  });
  useAccUserRedirect();

  const fetchCabinets = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/cabinet?cabinet_id=${cabinetId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch cabinets");
      }
      setCabinetsData(json.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, cabinetId]);

  useEffect(() => {
    fetchCabinets();
  }, [fetchCabinets]);

  const handleEdit = (cabinet: Cabinet) => {
    setEditingCabinet(cabinet);
    setFormData({
      cabinet: cabinet.cabinet,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleEditSubmit = async () => {
    try {
      if (!formData.cabinet.trim()) {
        throw new Error("Cabinet name is required");
      }

      if (!editingCabinet) return;

      const response = await fetch(`/api/cabinet`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingCabinet.id,
          cabinet_id: editingCabinet.cabinet_id,
          cabinet: formData.cabinet,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to update cabinet");
      }

      setEditingCabinet(null);
      fetchCabinets();
    } catch (error) {
      console.error("Error:", error);
      Modal.error({
        title: "Failed to update cabinet",
        content:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  useEffect(() => {
    fetchCabinets();
  }, [fetchCabinets]);

  const createMenuItems = (cabinet: Cabinet): MenuProps["items"] => [
    {
      key: "edit",
      label: "Edit",
      icon: <FiEdit2 className="mr-2" />,
      onClick: (e) => {
        e.domEvent.stopPropagation();
        handleEdit(cabinet);
      },
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="mx-auto">
        <Breadcrumb onCabinetAdded={fetchCabinets} warehouseId={cabinetId} />

        <Modal
          title="Edit Cabinet"
          open={!!editingCabinet}
          onOk={handleEditSubmit}
          onCancel={() => setEditingCabinet(null)}
          okText="Save Changes"
          cancelText="Cancel"
        >
          <div className="mb-2">
            <label className="text-[14px]" htmlFor="cabinet_id">
              Cabinet ID
            </label>
            <input
              placeholder="Cabinet ID"
              className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="text"
              id="cabinet_id"
              value={editingCabinet?.cabinet_id || ""}
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="cabinet">
              Cabinet
            </label>
            <input
              placeholder="Enter cabinet"
              maxLength={50}
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="text"
              id="cabinet"
              value={formData.cabinet}
              onChange={handleInputChange}
              required
            />
          </div>
        </Modal>

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <span key={i} className="h-48 rounded-xl bg-gray-200" />
              ))}
            </div>
          ) : cabinetsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cabinetsData.map((cabinet) => (
                <div
                  key={cabinet.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group relative"
                >
                  <div className="absolute top-6 right-6 z-10">
                    <Dropdown
                      menu={{ items: createMenuItems(cabinet) }}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <button
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <FiMoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                    </Dropdown>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Cabinet ID: {cabinet.cabinet_id}
                        </span>
                        <h3 className="text-xl font-semibold text-gray-900 mt-1 group-hover:text-blue-600 transition-colors">
                          {cabinet.cabinet}
                        </h3>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <div>
                        <span className="text-xs text-gray-500">
                          Connected Stores
                        </span>
                        <p className="text-2xl font-bold text-gray-900">
                          {cabinet.warehouse_id}
                        </p>
                      </div>
                      <Link
                        className="text-blue-600 hover:text-blue-800 text-[12px] font-bold flex items-center transition-colors bg-gray-100 px-5 py-3 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        href={`/stock-master/warehouse/cabinet/${cabinetId}`}
                      >
                        Stores
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[calc(100vh-350px)]">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No cabinets found
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  You don&apos;t have any cabinets yet. Create your first
                  cabinet to get started.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
