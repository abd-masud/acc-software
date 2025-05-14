"use client";

import { useAuth } from "@/contexts/AuthContext";
import { PolicyItem } from "@/types/policy";
import {
  Modal,
  // Tooltip
} from "antd";
import { useState, useEffect, useCallback } from "react";
// import { FaEdit } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
// import { MdOutlineDeleteSweep } from "react-icons/md";

export const StockSettingsForm = () => {
  const { user } = useAuth();
  const [terms, setTerms] = useState<PolicyItem[]>([]);
  // const [newTerm, setNewTerm] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDeleteIndex, setItemToDeleteIndex] = useState<number | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTermValue, setEditTermValue] = useState("");
  const MAX_TERMS = 5;

  const fetchPolicyTerms = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/policy?user_id=${user.id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const termsData = result.data?.terms || [];
          const formattedTerms = termsData
            .map((term: string | PolicyItem) =>
              typeof term == "string" ? { name: term } : term
            )
            .slice(0, MAX_TERMS);
          setTerms(formattedTerms);
        }
      } else {
        console.error("Failed to fetch terms:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching policy terms:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchPolicyTerms();
    }
  }, [user?.id, fetchPolicyTerms]);

  const handleSave = async (termsToSave: PolicyItem[]) => {
    if (!user?.id) return false;
    setIsLoading(true);
    try {
      const response = await fetch("/api/policy", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          user_id: user.id.toString(),
        },
        body: JSON.stringify({
          user_id: user.id,
          terms: termsToSave.map((item) => item.name),
        }),
      });

      if (!response.ok) throw new Error(await response.text());

      await fetchPolicyTerms();
      return true;
    } catch (error) {
      console.error("Error saving policy terms:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // const handleAddTerm = async () => {
  //   if (!newTerm.trim()) return;

  //   if (terms.length >= MAX_TERMS) {
  //     setUserMessage(`Maximum ${MAX_TERMS} terms allowed`);
  //     setTimeout(() => setUserMessage(null), 5000);
  //     return;
  //   }

  //   const newItem = { name: newTerm.trim() };
  //   const updatedTerms = [...terms, newItem];

  //   const success = await handleSave(updatedTerms);
  //   if (success) {
  //     setTerms(updatedTerms);
  //     setNewTerm("");
  //     setUserMessage("Term added");
  //     setTimeout(() => setUserMessage(null), 5000);
  //   }
  // };

  // const handleEditTerm = (index: number) => {
  //   setEditingIndex(index);
  //   setEditTermValue(terms[index].name);
  //   setIsEditModalOpen(true);
  // };

  const handleUpdateTerm = async () => {
    if (editingIndex == null || !editTermValue.trim()) return;

    const updatedTerms = [...terms];
    updatedTerms[editingIndex] = { name: editTermValue.trim() };

    const success = await handleSave(updatedTerms);
    if (success) {
      setTerms(updatedTerms);
      setEditingIndex(null);
      setEditTermValue("");
      setIsEditModalOpen(false);
      setUserMessage("Term updated");
      setTimeout(() => setUserMessage(null), 5000);
    }
  };

  const handleDeleteTerm = async () => {
    if (itemToDeleteIndex == null) return;

    const updatedTerms = terms.filter(
      (_, index) => index !== itemToDeleteIndex
    );

    const success = await handleSave(updatedTerms);
    if (success) {
      setTerms(updatedTerms);
      setIsDeleteModalOpen(false);
      setItemToDeleteIndex(null);
      setUserMessage("Term deleted");
      setTimeout(() => setUserMessage(null), 5000);
    }
  };

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
      {userMessage && (
        <div className="left-1/2 top-10 transform -translate-x-1/2 fixed z-50">
          <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800 text-green-600 border-2 border-green-600 mx-auto">
            <div className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              {userMessage}
            </div>
            <button
              onClick={() => setUserMessage(null)}
              className="ml-3 hover:text-green-400"
            >
              <FaXmark className="text-[14px]" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center pb-5">
        <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
        <h2 className="text-[13px] font-[500]">Policy Settings</h2>
      </div>

      <div className="mb-4">
        <p className="text-center">Coming Soon...</p>
      </div>

      <Modal
        title="Confirm Delete Term"
        open={isDeleteModalOpen}
        onOk={handleDeleteTerm}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setItemToDeleteIndex(null);
        }}
        okText="Delete"
        okButtonProps={{ danger: true }}
        confirmLoading={isLoading}
      >
        <p>Are you sure you want to delete this term?</p>
      </Modal>

      <Modal
        title="Edit Term"
        open={isEditModalOpen}
        onOk={handleUpdateTerm}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingIndex(null);
          setEditTermValue("");
        }}
        okText="Update"
        confirmLoading={isLoading}
      >
        <input
          type="text"
          maxLength={100}
          value={editTermValue}
          onChange={(e) => setEditTermValue(e.target.value)}
          className="border text-[14px] py-2 px-4 w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md"
          placeholder="Update term"
        />
      </Modal>
    </main>
  );
};
