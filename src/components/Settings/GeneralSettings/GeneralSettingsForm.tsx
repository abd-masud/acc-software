"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";

type GeneralType = "department" | "role" | "status" | "currency" | "category";

interface GeneralItem {
  id?: string;
  name: string;
}

interface GeneralGeneralsData {
  department: GeneralItem[];
  role: GeneralItem[];
  status: GeneralItem[];
  currency: GeneralItem[];
  category: GeneralItem[];
}

export const GeneralSettingsForm = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<GeneralType>("department");
  const [data, setData] = useState<GeneralGeneralsData>({
    department: [],
    role: [],
    status: [],
    currency: [],
    category: [],
  });
  const [newItemName, setNewItemName] = useState("");
  const [editingItem, setEditingItem] = useState<GeneralItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGenerals = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/generals", {
        headers: {
          user_id: user?.id.toString() || "",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(
          result.data || {
            department: [],
            role: [],
            status: [],
            currency: [],
            category: [],
          }
        );
        console.log(result);
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

  const handleAddItem = () => {
    if (!newItemName.trim()) return;

    const newItem = { name: newItemName.trim() };
    const key = `${activeTab}s` as keyof GeneralGeneralsData;

    setData((prev) => ({
      ...prev,
      [key]: [...(prev[key] as GeneralItem[]), newItem],
    }));

    setNewItemName("");
  };

  const handleEditItem = (item: GeneralItem) => {
    setEditingItem(item);
    setNewItemName(item.name);
  };

  const handleUpdateItem = () => {
    if (!editingItem || !newItemName.trim()) return;

    const key = `${activeTab}s` as keyof GeneralGeneralsData;

    setData((prev) => ({
      ...prev,
      [key]: (prev[key] as GeneralItem[]).map((i) =>
        i == editingItem ? { ...i, name: newItemName.trim() } : i
      ),
    }));

    setEditingItem(null);
    setNewItemName("");
  };

  const handleDeleteItem = (item: GeneralItem) => {
    const key = `${activeTab}s` as keyof GeneralGeneralsData;

    setData((prev) => ({
      ...prev,
      [key]: (prev[key] as GeneralItem[]).filter((i) => i !== item),
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/generals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          user_id: user.id.toString(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save generals");
      }
    } catch (error) {
      console.error("Error saving generals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentItems = data[
    activeTab as keyof GeneralGeneralsData
  ] as GeneralItem[];

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
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
          Statuses
        </button>
        <button
          onClick={() => setActiveTab("currency")}
          className={`px-4 py-2 rounded-md text-[14px] transition-all duration-300 ${
            activeTab == "currency"
              ? "bg-[#307EF3] hover:bg-[#478cf3] text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Currencies
        </button>
        <button
          onClick={() => setActiveTab("category")}
          className={`px-4 py-2 rounded-md text-[14px] transition-all duration-300 ${
            activeTab == "category"
              ? "bg-[#307EF3] hover:bg-[#478cf3] text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Categories
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={`Add new ${activeTab}`}
            className="border text-[14px] py-2 px-4 w-full flex-1 bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300"
          />
          {editingItem ? (
            <>
              <button
                onClick={handleUpdateItem}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
              >
                Update
              </button>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setNewItemName("");
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleAddItem}
              className="bg-[#307EF3] hover:bg-[#478cf3] text-white px-4 py-2 rounded text-sm"
            >
              Add
            </button>
          )}
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
                    <button
                      onClick={() => handleEditItem(item)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-2 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="text-[14px] bg-[#307EF3] hover:bg-[#478cf3] w-40 py-2 rounded text-white cursor-pointer focus:bg-[#307EF3] transition-all duration-300"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </main>
  );
};
