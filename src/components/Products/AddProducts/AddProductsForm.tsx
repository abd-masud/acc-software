"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Products } from "@/types/products";
import { Modal } from "antd";
import dynamic from "next/dynamic";
import Image from "next/image";
import success from "../../../../public/images/success.png";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useId, useState } from "react";
import { StylesConfig } from "react-select";
import { FaXmark } from "react-icons/fa6";

const Select = dynamic(() => import("react-select"), {
  ssr: false,
  loading: () => <div className="h-[38px] w-full rounded border" />,
});

export const AddProductsForm = () => {
  const instanceId = useId();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [product_id, setProductId] = useState("");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Omit<Products, "id">>({
    key: "",
    product_id: "",
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    unit: "",
  });

  const [generalOptions, setGeneralOptions] = useState<{
    category: string[];
  }>({ category: [] });

  const fetchGenerals = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/generals?user_id=${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json: any = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch customers");
      }

      const optionsData = json.data[0] || {};
      setGeneralOptions({
        category: optionsData.category || [],
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchGenerals();
  }, [fetchGenerals]);

  useEffect(() => {
    const generateProductId = () => {
      const compPrefix = user?.company
        ? user.company.slice(0, 2).toUpperCase()
        : "CO";
      const random = Math.floor(10000 + Math.random() * 90000);
      return `P${compPrefix}${random}`;
    };

    setProductId(generateProductId());
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchCurrencies = async () => {
      try {
        const currencyRes = await fetch(`/api/currencies?user_id=${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const currencyJson = await currencyRes.json();

        if (currencyRes.status == 404 || !currencyJson.success) {
          setCurrencyCode("USD");
        } else if (currencyJson.data && currencyJson.data.length > 0) {
          setCurrencyCode(currencyJson.data[0].currency || "USD");
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setCurrencyCode("USD");
      }
    };

    fetchCurrencies();
  }, [user?.id]);

  const toSelectOptions = (arr: string[] | undefined) => {
    return (arr || []).map((item) => ({ label: item, value: item }));
  };

  const handleSelectChange =
    (field: keyof typeof formValues) => (selected: any) => {
      setFormValues((prev) => ({
        ...prev,
        [field]: selected?.value || "",
      }));
    };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;
    setFormValues({
      ...formValues,
      [id]:
        id == "price" || id == "tax_rate" || id == "stock"
          ? Number(value)
          : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formValues,
      user_id: user?.id,
      product_id: product_id,
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add customer");
      }
      setShowSuccessModal(true);
    } catch (error: any) {
      setUserMessage(error || "An unexpected error occurred");
    } finally {
      setTimeout(() => setUserMessage(null), 5000);
      setLoading(false);
    }
  };

  const generalSelectStyles: StylesConfig<any, boolean> = {
    control: (base) => ({
      ...base,
      borderColor: "#E5E7EB",
      "&:hover": {
        borderColor: "#E5E7EB",
      },
      minHeight: "48px",
      fontSize: "14px",
      boxShadow: "none",
      backgroundColor: "#F2F4F7",
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "14px",
      backgroundColor: state.isSelected ? "#F2F4F7" : "white",
      color: "black",
      "&:hover": {
        backgroundColor: "#F2F4F7",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  const handleAddMore = () => {
    setFormValues({
      key: "",
      product_id: "",
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      unit: "",
    });

    const compPrefix = user?.company
      ? user.company.slice(0, 2).toUpperCase()
      : "CO";
    const random = Math.floor(10000 + Math.random() * 90000);
    setProductId(`C${compPrefix}${random}`);

    setShowSuccessModal(false);
  };

  const handleOkay = () => {
    setShowSuccessModal(false);
    router.push("/products/products-list");
  };

  const handleCloseMessage = () => {
    setUserMessage(null);
  };

  if (loading) {
    return <div>Loading form...</div>;
  }

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
      {userMessage && (
        <div className="left-1/2 top-10 transform -translate-x-1/2 fixed z-50">
          <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800 text-green-600 border-2 border-green-600 mx-auto">
            <div className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              {userMessage}
            </div>
            <button
              onClick={handleCloseMessage}
              className="ml-3 focus:outline-none hover:text-green-600"
            >
              <FaXmark className="text-[14px]" />
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center pb-5">
        <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
        <h2 className="text-[13px] font-[500]">Add Product Form</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-4 gap-0">
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="product_id">
              Product ID
            </label>
            <input
              placeholder="Enter product id"
              className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="text"
              id="product_id"
              value={product_id}
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="name">
              Product Name
            </label>
            <input
              placeholder="Enter product name"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="text"
              id="name"
              value={formValues.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-[14px]" htmlFor="description">
            Description (Optional)
          </label>
          <textarea
            placeholder="Enter product description"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            id="description"
            value={formValues.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="price">
              Price ({currencyCode})
            </label>
            <input
              placeholder="Enter price"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="number"
              id="price"
              min="0"
              value={formValues.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="unit">
              Unit
            </label>
            <select
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              id="unit"
              value={formValues.unit}
              onChange={handleChange}
            >
              <option value="Pieces">Pieces</option>
              <option value="Kilograms">Kilograms</option>
              <option value="Grams">Grams</option>
              <option value="Liters">Liters</option>
              <option value="Meters">Meters</option>
              <option value="Box">Box</option>
              <option value="Set">Set</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <label className="text-[14px]" htmlFor="category">
                Category
              </label>
              <Link
                className="text-[12px] text-blue-600"
                href={"/product/product-settings"}
              >
                Add Category
              </Link>
            </div>
            <Select
              instanceId={`${instanceId}-category`}
              inputId="category"
              className="mt-2"
              options={toSelectOptions(generalOptions.category)}
              value={toSelectOptions(generalOptions.category).find(
                (opt) => opt.value == formValues.category
              )}
              onChange={handleSelectChange("category")}
              placeholder="Select Department"
              styles={generalSelectStyles}
              isClearable
              required
            />
          </div>

          <div className="mb-4">
            <label className="text-[14px]" htmlFor="stock">
              Stock Quantity
            </label>
            <input
              placeholder="Enter Stock Quantity"
              className="border text-[14px] py-[13px] px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
              type="number"
              id="stock"
              min="0"
              value={formValues.stock}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="text-[14px] font-[500] py-2 w-40 rounded cursor-pointer transition-all duration-300 mt-4 text-white bg-[#307EF3] hover:bg-[#478cf3] focus:bg-[#307EF3] disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </form>
      <Modal
        open={showSuccessModal}
        onCancel={handleOkay}
        footer={[
          <button
            key="addMore"
            onClick={handleAddMore}
            className="text-[14px] font-[500] py-2 w-28 rounded cursor-pointer transition-all duration-300 mt-2 mr-2 text-white bg-[#307EF3] hover:bg-[#478cf3] focus:bg-[#307EF3]"
          >
            Add More
          </button>,
          <button
            key="okay"
            onClick={handleOkay}
            className="text-[14px] font-[500] py-2 w-20 rounded cursor-pointer transition-all duration-300 mt-2 text-white bg-[#307EF3] hover:bg-[#478cf3] focus:bg-[#307EF3]"
          >
            Okay
          </button>,
        ]}
        centered
        width={400}
      >
        <div className="flex flex-col items-center pt-5">
          <Image src={success} alt="Success" width={80} height={80} />
          <h3 className="text-xl font-semibold mt-2">Success!</h3>
          <p className="text-gray-600 text-center">
            Product has been added successfully.
          </p>
        </div>
      </Modal>
    </main>
  );
};
