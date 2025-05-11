"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { MdAdd, MdRemove } from "react-icons/md";

export const PolicySettingsForm = () => {
  const { user } = useAuth();
  const [terms, setTerms] = useState<string[]>([]);
  const [newTerm, setNewTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const MAX_TERMS = 5;

  const fetchTerms = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/policy?user_id=${user.id}`, {});

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const { data } = await response.json();
      const fetchedTerms = Array.isArray(data?.terms) ? data.terms : [];
      setTerms(fetchedTerms.slice(0, MAX_TERMS));
    } catch (error) {
      console.error("Error fetching terms:", error);
      setTerms([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchTerms();
    }
  }, [user?.id, fetchTerms]);

  const handleSave = async () => {
    if (!user?.id) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/policy", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          user_id: user.id.toString(),
        },
        body: JSON.stringify({ terms }),
      });

      if (!response.ok) {
        throw new Error("Failed to save terms");
      }
    } catch (error) {
      console.error("Error saving terms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTerm = () => {
    if (newTerm.trim() && terms.length < MAX_TERMS) {
      setTerms([...terms, newTerm]);
      setNewTerm("");
    }
  };

  const removeTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  const updateTerm = (index: number, newText: string) => {
    const updatedTerms = [...terms];
    updatedTerms[index] = newText;
    setTerms(updatedTerms);
  };

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
      <div className="sm:flex items-center hidden mb-5">
        <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
        <h2 className="text-[13px] font-[500]">Terms & Conditions</h2>
      </div>

      <div className="space-y-3">
        {terms.map((term, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              maxLength={80}
              className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300"
              value={term}
              onChange={(e) => updateTerm(index, e.target.value)}
              disabled={isLoading}
              placeholder={`Term ${index + 1}`}
            />
            <button
              onClick={() => removeTerm(index)}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 px-3 py-3 rounded-full text-white cursor-pointer transition-all duration-300"
            >
              <MdRemove />
            </button>
          </div>
        ))}
      </div>

      {terms.length < MAX_TERMS && (
        <div className="flex items-center gap-2 mt-4">
          <input
            type="text"
            className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300"
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            placeholder={`Add term ${terms.length + 1}`}
            disabled={isLoading}
            onKeyDown={(e) => e.key == "Enter" && addTerm()}
          />
          <button
            onClick={addTerm}
            disabled={isLoading || !newTerm.trim()}
            className="bg-green-600 hover:bg-green-700 px-3 py-3 rounded-full text-white cursor-pointer transition-all duration-300"
          >
            <MdAdd />
          </button>
        </div>
      )}

      {terms.length >= MAX_TERMS && (
        <p className="text-sm text-gray-500 mt-4">
          Maximum of {MAX_TERMS} terms reached.
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="text-[14px] bg-[#307EF3] hover:bg-[#478cf3] w-40 py-2 rounded text-white cursor-pointer focus:bg-[#307EF3] transition-all duration-300"
        >
          {isLoading ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </main>
  );
};
