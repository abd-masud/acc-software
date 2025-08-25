"use client";

import { useCallback, useEffect, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { useAuth } from "@/contexts/AuthContext";
import { useAccUserRedirect } from "@/hooks/useAccUser";
import { Warehouse, WarehouseApiResponse } from "@/types/warehouse";
import { Modal } from "antd";
import { FiMoreVertical, FiEdit2 } from "react-icons/fi";
import { Dropdown } from "antd";
import Link from "next/link";
import type { MenuProps } from "antd";

export const WarehouseListComponent = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [warehouseData, setWarehouseData] = useState<Warehouse[]>([]);
  const [storeCounts, setStoreCounts] = useState<Record<string, number>>({});
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null
  );
  const [formData, setFormData] = useState({
    warehouse: "",
    address: "",
  });
  useAccUserRedirect();

  const fetchStoreCounts = useCallback(
    async (warehouse_id: string) => {
      if (!user?.id) return;
      setLoading(true);

      try {
        const response = await fetch(
          `/api/store?warehouse_id=${warehouse_id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(json.message || "Failed to fetch stores");
        }

        return json.data.length || 0;
      } catch (error) {
        console.error("Error fetching stores:", error);
        return 0;
      }
    },
    [user?.id]
  );

  const fetchWarehouses = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/warehouse?user_id=${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json: WarehouseApiResponse = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch warehouse");
      }

      setWarehouseData(json.data);

      const counts: Record<string, number> = {};
      for (const warehouse of json.data) {
        counts[warehouse.warehouse_id] = await fetchStoreCounts(
          warehouse.warehouse_id
        );
      }
      setStoreCounts(counts);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchStoreCounts]);

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({
      warehouse: warehouse.warehouse,
      address: warehouse.address || "",
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
      if (!formData.warehouse.trim()) {
        throw new Error("Warehouse name is required");
      }

      if (!editingWarehouse) return;

      const response = await fetch(`/api/warehouse`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingWarehouse.id,
          warehouse_id: editingWarehouse.warehouse_id,
          warehouse: formData.warehouse,
          address: formData.address,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to update warehouse");
      }

      setEditingWarehouse(null);
      fetchWarehouses();
    } catch (error) {
      console.error("Error:", error);
      Modal.error({
        title: "Failed to update warehouse",
        content:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const createMenuItems = (warehouse: Warehouse): MenuProps["items"] => [
    {
      key: "edit",
      label: "Edit",
      icon: <FiEdit2 className="mr-2" />,
      onClick: (e) => {
        e.domEvent.stopPropagation();
        handleEdit(warehouse);
      },
    },
  ];

  return (
    <main className="bg-[#f8fafc] min-h-screen p-6">
      <div className="mx-auto">
        <Breadcrumb onWarehouseAdded={fetchWarehouses} />

        <Modal
          title="Edit Warehouse"
          open={!!editingWarehouse}
          onOk={handleEditSubmit}
          onCancel={() => setEditingWarehouse(null)}
          okText="Save Changes"
          cancelText="Cancel"
        >
          <div className="mb-2">
            <label className="text-[14px]" htmlFor="warehouse_id">
              Warehouse ID
            </label>
            <input
              placeholder="Warehouse ID"
              className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="text"
              id="warehouse_id"
              value={editingWarehouse?.warehouse_id || ""}
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="warehouse">
              Warehouse
            </label>
            <input
              placeholder="Enter warehouse"
              maxLength={50}
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="text"
              id="warehouse"
              value={formData.warehouse}
              onChange={handleInputChange}
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
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>
        </Modal>

        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <span key={i} className="h-48 rounded-xl bg-gray-200" />
              ))}
            </div>
          ) : warehouseData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {warehouseData.map((warehouse) => (
                <div
                  key={warehouse.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group relative"
                >
                  <div className="absolute top-6 right-6 z-10">
                    <Dropdown
                      menu={{ items: createMenuItems(warehouse) }}
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
                          WH ID: {warehouse.warehouse_id}
                        </span>
                        <h3 className="text-xl font-semibold text-gray-900 mt-1 group-hover:text-blue-600 transition-colors truncate">
                          {warehouse.warehouse}
                        </h3>
                      </div>
                    </div>

                    {warehouse.address && (
                      <div className="mt-4 flex items-center text-gray-600">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-sm truncate">
                          {warehouse.address}
                        </span>
                      </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <div>
                        <span className="text-xs text-gray-500">
                          Warehouse Cabinets
                        </span>
                        <p className="text-2xl font-bold text-gray-900">
                          {storeCounts[warehouse.warehouse_id] || 0}
                        </p>
                      </div>
                      <Link
                        className="text-blue-600 hover:text-blue-800 text-[12px] font-bold flex items-center transition-colors bg-gray-100 px-5 py-3 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        href={`/stock-master/warehouse/${warehouse.id}`}
                      >
                        Cabinets
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
                  No warehouses found
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  You don&apos;t have any warehouses yet. Create your first
                  warehouse to get started.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
