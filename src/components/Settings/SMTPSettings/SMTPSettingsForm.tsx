"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

interface SMTPSettings {
  id?: string;
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: "none" | "ssl" | "tls";
  fromEmail: string;
  fromName: string;
}

export const SMTPSettingsForm = () => {
  const [settings, setSettings] = useState<SMTPSettings[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { handleSubmit, reset } = useForm<SMTPSettings>();

  // Load settings from localStorage (or API in a real app)
  useEffect(() => {
    const savedSettings = localStorage.getItem("smtpSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("smtpSettings", JSON.stringify(settings));
  }, [settings]);

  const onSubmit = (data: SMTPSettings) => {
    if (editingId) {
      // Update existing
      setSettings(
        settings.map((item) =>
          item.id === editingId ? { ...data, id: editingId } : item
        )
      );
      setEditingId(null);
    } else {
      // Create new
      const newSetting = {
        ...data,
        id: Date.now().toString(),
      };
      setSettings([...settings, newSetting]);
    }
    reset();
  };

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
      <h2 className="text-xl font-semibold mb-4">SMTP Settings</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              SMTP Host
            </label>
            <input
              type="text"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              placeholder="Enter SMTP host"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Port
            </label>
            <input
              type="number"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              placeholder="Enter port"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              placeholder="Enter password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Encryption
            </label>
            <select className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2">
              <option value="none">None</option>
              <option value="ssl">SSL</option>
              <option value="tls">TLS</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              From Email
            </label>
            <input
              type="email"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              placeholder="Enter form email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              From Name
            </label>
            <input
              type="text"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              placeholder="Enter company name"
              required
            />
          </div>

          <div className="flex justify-end items-center">
            <div>
              <button
                type="submit"
                className="text-[14px] font-[500] py-2 w-40 rounded cursor-pointer transition-all duration-300 mt-4 text-white bg-[#307EF3] hover:bg-[#478cf3] focus:bg-[#307EF3] disabled:opacity-50"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
};
