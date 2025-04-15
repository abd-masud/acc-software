"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";

export const PolicySettingsForm = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string | null>("terms");
  const [content, setContent] = useState<Record<string, string>>({
    terms: "",
    privacy: "",
    refund: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("User ID in effect:", user?.id);
    if (activeTab && user?.id) {
      const fetchAllContent = async () => {
        setIsLoading(true);
        try {
          const response = await fetch("/api/policy", {
            headers: {
              user_id: user.id.toString(),
            },
          });

          if (response.ok) {
            const data = await response.json();
            const firstRecord = data.data?.[0];
            if (firstRecord) {
              setContent({
                terms: firstRecord.terms || "",
                privacy: firstRecord.privacy || "",
                refund: firstRecord.refund || "",
              });
            }
          }
        } catch (error) {
          console.error("Error fetching content:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchAllContent();
    }
  }, [user?.id, activeTab]);

  const fetchAllContent = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/policy", {
        headers: {
          user_id: user.id.toString(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        const firstRecord = data.data?.[0];
        if (firstRecord) {
          setContent({
            terms: firstRecord.terms || "",
            privacy: firstRecord.privacy || "",
            refund: firstRecord.refund || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (activeTab && user?.id) {
      fetchAllContent();
    }
  }, [user?.id, activeTab, fetchAllContent]);

  const handleSave = async () => {
    if (!user?.id) return;

    setIsLoading(true);

    try {
      const getResponse = await fetch("/api/policy", {
        headers: {
          user_id: user.id.toString(),
        },
      });

      let method = "POST";

      if (getResponse.status === 200) {
        method = "PUT";
      } else if (getResponse.status === 404) {
        method = "POST";
      } else {
        throw new Error(
          `Unexpected GET response status: ${getResponse.status}`
        );
      }

      const saveResponse = await fetch("/api/policy", {
        method,
        headers: {
          "Content-Type": "application/json",
          user_id: user.id.toString(),
        },
        body: JSON.stringify(content),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save content");
      }
    } catch (error) {
      console.error("Error saving content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
      <div className="flex space-x-4 mb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("terms")}
          className={`px-4 py-2 rounded-md text-[14px] transition-all duration-300 ${
            activeTab == "terms"
              ? "bg-[#307EF3] hover:bg-[#478cf3] text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Terms&nbsp;&&nbsp;Conditions
        </button>
        <button
          onClick={() => setActiveTab("privacy")}
          className={`px-4 py-2 rounded-md text-[14px] transition-all duration-300 ${
            activeTab == "privacy"
              ? "bg-[#307EF3] hover:bg-[#478cf3] text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Privacy&nbsp;Policy
        </button>
        <button
          onClick={() => setActiveTab("refund")}
          className={`px-4 py-2 rounded-md text-[14px] transition-all duration-300 ${
            activeTab == "refund"
              ? "bg-[#307EF3] hover:bg-[#478cf3] text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Refund&nbsp;Policy
        </button>
      </div>

      {activeTab && (
        <div>
          <textarea
            className="border text-[14px] py-2 px-[10px] w-full h-64 bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
            value={content[activeTab]}
            onChange={(e) =>
              setContent((prev) => ({ ...prev, [activeTab]: e.target.value }))
            }
            placeholder={`Enter ${activeTab.replace(/^./, (c) =>
              c.toUpperCase()
            )} content...`}
            disabled={isLoading}
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="text-[14px] bg-[#307EF3] hover:bg-[#478cf3] w-40 py-2 rounded text-white cursor-pointer focus:bg-[#307EF3] transition-all duration-300 "
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
};
