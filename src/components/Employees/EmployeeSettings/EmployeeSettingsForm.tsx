"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Modal, Tooltip } from "antd";
import { useState, useEffect, useCallback } from "react";
import { FaEdit } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { MdOutlineDeleteSweep } from "react-icons/md";

type GeneralType = "department" | "role" | "status" | "category";

interface GeneralItem {
  id?: string;
  name: string;
}

interface GeneralGeneralsData {
  department: GeneralItem[];
  role: GeneralItem[];
  status: GeneralItem[];
  category: GeneralItem[];
}

export const EmployeeSettingsForm = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<GeneralType>("department");
  const [data, setData] = useState<GeneralGeneralsData>({
    department: [],
    role: [],
    status: [],
    category: [],
  });
  const [newItemName, setNewItemName] = useState("");
  const [editingItem, setEditingItem] = useState<GeneralItem | null>(null);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<GeneralItem | null>(null);

  const showDeleteModal = (item: GeneralItem) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const fetchGenerals = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/generals?user_id=${user.id}`);
      if (response.ok) {
        const result = await response.json();
        const apiData = result.data?.[0] || {};
        const transformedData = {
          department:
            apiData.department?.map((name: string) => ({ name })) || [],
          role: apiData.role?.map((name: string) => ({ name })) || [],
          status: apiData.status?.map((name: string) => ({ name })) || [],
          category: apiData.category?.map((name: string) => ({ name })) || [],
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
          status: updatedData.status.map((item) => item.name),
          category: updatedData.category.map((item) => item.name),
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

  const handleEditItem = (item: GeneralItem) => {
    setEditingItem(item);
    setNewItemName(item.name);
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !newItemName.trim()) return;

    const updatedData = {
      ...data,
      [activeTab]: data[activeTab].map((i) =>
        i.name === editingItem.name ? { ...i, name: newItemName.trim() } : i
      ),
    };

    setData(updatedData);
    setEditingItem(null);
    setNewItemName("");
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
        <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
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
        <button
          onClick={() => setActiveTab("status")}
          className={`px-4 py-2 rounded-md text-[14px] transition-all duration-300 ${
            activeTab == "status"
              ? "bg-[#307EF3] hover:bg-[#478cf3] text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Status
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
          {editingItem ? (
            <>
              <button
                onClick={handleUpdateItem}
                className="bg-[#307EF3] hover:bg-[#478cf3] text-white px-4 py-[9px] rounded text-sm"
                disabled={isLoading}
              >
                Update
              </button>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setNewItemName("");
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-[9px] rounded text-sm"
                disabled={isLoading}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleAddItem}
              className="bg-[#307EF3] hover:bg-[#478cf3] text-white px-4 py-[9px] rounded text-sm"
              disabled={isLoading}
            >
              Add
            </button>
          )}
        </div>

        <div className="border rounded-md overflow-hidden">
          {currentItems.length === 0 ? (
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
                        onClick={() => handleEditItem(item)}
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
    </main>
  );
};
