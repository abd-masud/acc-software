"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Modal, Tooltip } from "antd";
import { useState, useEffect, useCallback } from "react";
import { FaEdit } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { MdOutlineDeleteSweep } from "react-icons/md";

type GeneralType =
  | "department"
  | "role"
  | "category"
  | "size"
  | "color"
  | "material"
  | "weight";

interface GeneralItem {
  id?: string;
  name: string;
}

interface GeneralGeneralsData {
  department: GeneralItem[];
  role: GeneralItem[];
  category: GeneralItem[];
  size: GeneralItem[];
  color: GeneralItem[];
  material: GeneralItem[];
  weight: GeneralItem[];
}

export const EmployeeSettingsForm = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<GeneralType>("department");
  const [data, setData] = useState<GeneralGeneralsData>({
    department: [],
    role: [],
    category: [],
    size: [],
    color: [],
    material: [],
    weight: [],
  });
  const [newItemName, setNewItemName] = useState("");
  const [editingItem, setEditingItem] = useState<GeneralItem | null>(null);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<GeneralItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const showDeleteModal = (item: GeneralItem) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const showEditModal = (item: GeneralItem) => {
    setEditingItem(item);
    setNewItemName(item.name);
    setIsEditModalOpen(true);
  };

  const fetchGenerals = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/generals?user_id=${user.id}`);
      if (response.ok) {
        const result = await response.json();
        const apiData = result.data?.[0] || {};
        const parseNestedArray = (value: any): string[] => {
          try {
            if (Array.isArray(value)) {
              return value;
            }
            if (typeof value === "string") {
              const parsed = JSON.parse(value);
              if (Array.isArray(parsed)) {
                return parsed;
              }
              if (typeof parsed === "string") {
                const doubleParsed = JSON.parse(parsed);
                if (Array.isArray(doubleParsed)) {
                  return doubleParsed;
                }
              }
            }
            return [];
          } catch (e) {
            console.error("Error parsing array:", e);
            return [];
          }
        };
        const transformedData = {
          department: parseNestedArray(apiData.department).map(
            (name: string) => ({ name })
          ),
          role: parseNestedArray(apiData.role).map((name: string) => ({
            name,
          })),
          category: parseNestedArray(apiData.category).map((name: string) => ({
            name,
          })),
          size: parseNestedArray(apiData.size).map((name: string) => ({
            name,
          })),
          color: parseNestedArray(apiData.color).map((name: string) => ({
            name,
          })),
          material: parseNestedArray(apiData.material).map((name: string) => ({
            name,
          })),
          weight: parseNestedArray(apiData.weight).map((name: string) => ({
            name,
          })),
        };
        setData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching generals:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchGenerals();
    }
  }, [user?.id, fetchGenerals]);

  const handleSave = async (updatedData: GeneralGeneralsData) => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/generals", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          user_id: user.id.toString(),
        },
        body: JSON.stringify({
          user_id: user.id,
          department: updatedData.department.map((item) => item.name),
          role: updatedData.role.map((item) => item.name),
          category: updatedData.category.map((item) => item.name),
          size: updatedData.size.map((item) => item.name),
          color: updatedData.color.map((item) => item.name),
          material: updatedData.material.map((item) => item.name),
          weight: updatedData.weight.map((item) => item.name),
        }),
      });

      if (!response.ok) throw new Error(await response.text());

      await fetchGenerals();
    } catch (error) {
      console.error("Error saving generals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;

    const newItem = { name: newItemName.trim() };
    const updatedData = {
      ...data,
      [activeTab]: [...data[activeTab], newItem],
    };

    setData(updatedData);
    setNewItemName("");
    await handleSave(updatedData);
    setUserMessage(
      `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Added`
    );
    setTimeout(() => setUserMessage(null), 5000);
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !newItemName.trim()) return;

    const updatedData = {
      ...data,
      [activeTab]: data[activeTab].map((i) =>
        i.name == editingItem.name ? { ...i, name: newItemName.trim() } : i
      ),
    };

    setData(updatedData);
    setEditingItem(null);
    setNewItemName("");
    setIsEditModalOpen(false);
    await handleSave(updatedData);
    setUserMessage(
      `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Updated`
    );
    setTimeout(() => setUserMessage(null), 5000);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    const updatedData = {
      ...data,
      [activeTab]: data[activeTab].filter((i) => i.name !== itemToDelete.name),
    };

    setData(updatedData);
    await handleSave(updatedData);
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    setUserMessage(
      `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Deleted`
    );
    setTimeout(() => setUserMessage(null), 5000);
  };

  const currentItems = data[activeTab] || [];

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
      {userMessage && (
        <div className="left-1/2 top-10 transform -translate-x-1/2 fixed z-50">
          <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800 text-green-600 border-2 border-green-600 mx-auto">
            <div className="text-sm font-medium">{userMessage}</div>
            <button onClick={() => setUserMessage(null)} className="ml-3">
              <FaXmark className="text-[14px]" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center pb-5">
        <div className="h-2 w-2 bg-[#307EF3] rounded-full mr-2"></div>
        <h2 className="text-[13px] font-[500]">Employee Settings</h2>
      </div>

      <div className="flex space-x-4 mb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("department")}
          className={`px-4 py-2 rounded-md text-[14px] transition-all duration-300 ${
            activeTab == "department"
              ? "bg-[#307EF3] hover:bg-[#478cf3] text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Departments
        </button>
        <button
          onClick={() => setActiveTab("role")}
          className={`px-4 py-2 rounded-md text-[14px] transition-all duration-300 ${
            activeTab == "role"
              ? "bg-[#307EF3] hover:bg-[#478cf3] text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Roles
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-4 mt-2">
          <input
            type="text"
            id="category"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={`Add new ${activeTab}`}
            className="border text-[14px] py-2 px-4 w-full flex-1 bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md"
          />
          <button
            onClick={handleAddItem}
            className="bg-[#307EF3] hover:bg-[#478cf3] text-white px-4 py-[9px] rounded text-sm"
            disabled={isLoading}
          >
            Add
          </button>
        </div>

        <div className="border rounded-md overflow-hidden">
          {currentItems.length == 0 ? (
            <div className="p-4 text-center text-gray-500">
              No {activeTab} added yet
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {currentItems.map((item, index) => (
                <li
                  key={index}
                  className="p-3 flex justify-between items-center"
                >
                  <span>{item.name}</span>
                  <div className="flex gap-2">
                    <Tooltip title="Edit">
                      <button
                        onClick={() => showEditModal(item)}
                        className="text-white text-[14px] bg-blue-500 hover:bg-blue-600 h-6 w-6 rounded flex justify-center items-center"
                        disabled={isLoading}
                      >
                        <FaEdit />
                      </button>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <button
                        onClick={() => showDeleteModal(item)}
                        className="text-white text-[17px] bg-red-500 hover:bg-red-600 h-6 w-6 rounded flex justify-center items-center"
                        disabled={isLoading}
                      >
                        <MdOutlineDeleteSweep />
                      </button>
                    </Tooltip>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Modal
        title={`Confirm Delete ${
          activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
        }`}
        open={isDeleteModalOpen}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onOk={handleDeleteItem}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete <strong>{itemToDelete?.name}</strong>?
        </p>
      </Modal>

      <Modal
        title={`Edit ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
          setNewItemName("");
        }}
        onOk={handleUpdateItem}
        okText="Update"
        okButtonProps={{ className: "bg-blue-500 hover:bg-blue-600" }}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Name
          </label>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="border text-[14px] py-2 px-4 w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md"
          />
        </div>
      </Modal>
    </main>
  );
};
