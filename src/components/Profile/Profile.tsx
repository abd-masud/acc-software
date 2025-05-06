"use client";

import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import Image from "next/image";
import dummy from "../../../public/images/dummy.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { FaEdit, FaSave, FaTimes, FaUpload } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { useAccUserRedirect } from "@/hooks/useAccUser";

export const ProfileCompound = () => {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    email: "",
    contact: "",
    company: "",
    address: "",
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  useAccUserRedirect();
  if (!user) return null;

  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name || "",
        last_name: user?.last_name || "",
        email: user?.email || "",
        contact: user?.contact || "",
        company: user?.company || "",
        address: user?.address || "",
      });
      setPreviewLogo(user?.logo || null);
    }
  }, [user]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedLogo(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerLogoInput = () => {
    logoInputRef.current?.click();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    const data = {
      id: user?.id,
      name: formData.name,
      last_name: formData.last_name,
      company: formData.company,
      contact: formData.contact,
      address: formData.address,
    };

    const formDataToSend = new FormData();

    const generateFileName = (file: File) => {
      const date = new Date();
      const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
      const formattedTime = `${date
        .getHours()
        .toString()
        .padStart(2, "0")}${date.getMinutes().toString().padStart(2, "0")}${date
        .getSeconds()
        .toString()
        .padStart(2, "0")}${date
        .getMilliseconds()
        .toString()
        .padStart(3, "0")}`;
      const fileExtension = file.name.slice(file.name.lastIndexOf("."));
      return `${formattedDate}.${formattedTime}${fileExtension}`;
    };

    if (selectedImage) {
      const newImageName = generateFileName(selectedImage);
      const renamedImage = new File([selectedImage], newImageName, {
        type: selectedImage.type,
      });
      formDataToSend.append("image", renamedImage);
    }

    if (selectedLogo) {
      const newLogoName = generateFileName(selectedLogo);
      const renamedLogo = new File([selectedLogo], newLogoName, {
        type: selectedLogo.type,
      });
      formDataToSend.append("logo", renamedLogo);
    }

    formDataToSend.append("data", JSON.stringify(data));

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          localStorage.setItem("acc_user", result.token);
          setIsEditMode(false);
          window.location.href = "/profile";
        } else {
          setError(result.message || "Failed to update profile");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update profile");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      contact: user?.contact || "",
      company: user?.company || "",
      address: user?.address || "",
    });
    setPreviewImage(null);
    setPreviewLogo(null);
    setSelectedImage(null);
    setSelectedLogo(null);
    setIsEditMode(false);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <main className="min-h-[calc(100vh-70px)] bg-gradient-to-br from-gray-50 to-gray-100">
      {error && (
        <div className="flex items-center px-4 py-3 mb-4 rounded-lg bg-red-50 text-red-600 border border-red-200 absolute top-5 right-5 shadow-md animate-fade-in">
          <div className="text-sm font-medium">{error}</div>
          <button
            onClick={handleCloseError}
            className="ml-3 text-red-600 hover:text-red-800"
          >
            <FaXmark />
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Header Section */}
          <div className="flex justify-between items-center bg-gradient-to-r from-[#307DF1] to-[#307DF1]/90 text-white p-6">
            <h1 className="text-2xl font-bold">Profile Information</h1>
            {!isEditMode ? (
              <button
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-2 bg-white hover:bg-gray-100 text-[#307DF1] px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
              >
                <FaEdit className="text-sm" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm"
                >
                  <FaTimes className="text-sm" />
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-[#307DF1] hover:bg-[#2a6fd8] text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm"
                >
                  <FaSave className="text-sm" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 bg-[#307DF1]/10">
            {/* Profile Image */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden relative">
                <Image
                  src={previewImage || user?.image || dummy}
                  alt="Profile"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              {isEditMode && (
                <>
                  <button
                    onClick={triggerFileInput}
                    className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 bg-[#307DF1] text-white py-2 text-sm font-medium hover:bg-[#2a6fd8] transition-colors"
                  >
                    <FaUpload className="text-xs" />
                    {previewImage ? "Change" : "Upload"}
                  </button>
                  <input
                    type="file"
                    id="image"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </>
              )}
            </div>

            {/* Profile Info */}
            <div className="text-center sm:text-left space-y-3 w-full">
              {isEditMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm text-[#307DF1] font-medium">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                      required
                      className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm text-[#307DF1] font-medium">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      id="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                      required
                      className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm text-[#307DF1] font-medium">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      id="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Enter company name"
                      className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm text-[#307DF1] font-medium">
                      Company Logo
                    </label>
                    <div className="flex items-center gap-3">
                      {previewLogo && (
                        <div className="w-10 h-10 relative rounded-md overflow-hidden border border-gray-200">
                          <Image
                            src={previewLogo}
                            alt="Company Logo"
                            fill
                            className="object-contain bg-white"
                          />
                        </div>
                      )}
                      <button
                        onClick={triggerLogoInput}
                        className="flex items-center gap-2 bg-[#307DF1] hover:bg-[#2a6fd8] text-white px-3 py-[13px] rounded-lg text-sm shadow-sm"
                      >
                        <FaUpload className="text-xs" />
                        {previewLogo ? "Change Logo" : "Upload Logo"}
                      </button>
                      <input
                        type="file"
                        id="logo"
                        ref={logoInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-800">
                    {user?.name} {user?.last_name}
                  </h1>
                  {user?.company && (
                    <div className="flex items-center gap-4">
                      <p className="text-[#307DF1] font-medium">
                        {user?.company}
                      </p>
                      {user?.logo && (
                        <div className="w-10 h-10 relative rounded-md overflow-hidden border border-gray-200">
                          <Image
                            src={user.logo}
                            alt="Company Logo"
                            fill
                            className="object-contain bg-white"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="p-6">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                Contact Information
              </h2>
              <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm text-gray-600 font-medium">
                    Email
                  </label>
                  {isEditMode ? (
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      disabled
                      className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {user?.email || "-"}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-gray-600 font-medium">
                    Contact Number
                  </label>
                  {isEditMode ? (
                    <input
                      type="tel"
                      name="contact"
                      id="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      placeholder="Enter contact number"
                      className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {user?.contact || "-"}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <label className="block text-sm text-gray-600 font-medium">
                  Address
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">
                    {user?.address || "-"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
