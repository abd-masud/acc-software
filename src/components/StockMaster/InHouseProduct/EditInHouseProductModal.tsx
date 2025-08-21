"use client";

import { Modal, message } from "antd";
import { EditProductModalProps } from "@/types/products";
import { useCallback, useEffect, useId, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { StylesConfig } from "react-select";
import dynamic from "next/dynamic";
import { FaXmark } from "react-icons/fa6";

const Select = dynamic(() => import("react-select"), {
  ssr: false,
  loading: () => <div className="h-[38px] w-full rounded border" />,
});

const UNITS = [
  "Pieces",
  "Kilograms",
  "Grams",
  "Liters",
  "Meters",
  "Box",
  "Set",
  "Pack",
  "Pair",
  "Dozen",
  "Bottle",
  "Can",
  "Carton",
  "Bag",
  "Roll",
  "Sheet",
];

export const EditInHouseProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  currentProduct,
  onSave,
}) => {
  const instanceId = useId();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("");
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [currencyCode, setCurrencyCode] = useState("USD");

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
    const fetchCurrencies = async () => {
      if (!user?.id) return;
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

  useEffect(() => {
    if (currentProduct) {
      setProductId(currentProduct.product_id);
      setProductName(currentProduct.name);
      setDescription(currentProduct.description);
      setPrice(currentProduct.price || "");
      setCategory(currentProduct.category);
      setStock(currentProduct.stock || "");
      setUnit(currentProduct.unit);
    }
  }, [currentProduct]);

  const handleSubmit = async () => {
    if (!currentProduct) return;

    if (
      !productName.trim() ||
      !price.trim() ||
      !category.trim() ||
      !unit.trim() ||
      !stock.trim()
    ) {
      setUserMessage("Fill in all fields");
      setTimeout(() => setUserMessage(null), 5000);
      return;
    }

    try {
      const updatedProduct = {
        ...currentProduct,
        name: productName,
        description,
        price: String(price),
        category,
        stock: String(stock),
        unit,
      };

      await onSave(updatedProduct);
    } catch (err) {
      console.error(err);
      message.error("Failed to update product");
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

  const toSelectOptions = (arr: string[] | undefined) => {
    return (arr || []).map((item) => ({ label: item, value: item }));
  };

  const handleCategoryChange = (selected: any) => {
    setCategory(selected?.value || "");
  };

  const handleUnitChange = (selected: any) => {
    setUnit(selected?.value || "");
  };

  const handleCloseMessage = () => {
    setUserMessage(null);
  };

  if (loading) {
    return <div>Loading form...</div>;
  }

  return (
    <Modal open={isOpen} onOk={handleSubmit} onCancel={onClose} okText="Save">
      {userMessage && (
        <div className="left-1/2 top-10 transform -translate-x-1/2 fixed z-50">
          <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800 text-red-400 border-2 border-red-400 mx-auto">
            <div className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              {userMessage}
            </div>
            <button
              onClick={handleCloseMessage}
              className="ml-3 focus:outline-none hover:text-red-300"
            >
              <FaXmark className="text-[14px]" />
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center pb-3">
        <div className="h-2 w-2 bg-[#307EF3] rounded-full mr-2"></div>
        <h2 className="text-[13px] font-[500]">Edit Product</h2>
      </div>

      <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-4">
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="productId">
            Product ID
          </label>
          <input
            id="productId"
            placeholder="Enter product name"
            className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            value={productId}
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="productName">
            Product Name
          </label>
          <input
            id="productName"
            maxLength={50}
            placeholder="Enter product name"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="text-[14px]" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          maxLength={250}
          placeholder="Enter product description"
          className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-4">
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="price">
            Price ({currencyCode})
          </label>
          <input
            id="price"
            type="number"
            inputMode="numeric"
            pattern="[0-9]"
            placeholder="Enter price"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onKeyDown={(e) => {
              if (
                !/[0-9.]/.test(e.key) &&
                e.key !== "Backspace" &&
                e.key !== "Delete" &&
                e.key !== "Tab" &&
                e.key !== "ArrowLeft" &&
                e.key !== "ArrowRight"
              ) {
                e.preventDefault();
              }
              if (e.key == "." && price.includes(".")) {
                e.preventDefault();
              }
            }}
          />
        </div>
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="category">
            Category
          </label>
          <Select
            instanceId={`${instanceId}-category`}
            inputId="category"
            className="mt-2"
            options={toSelectOptions(generalOptions.category)}
            value={toSelectOptions(generalOptions.category).find(
              (opt) => opt.value == category
            )}
            onChange={handleCategoryChange}
            placeholder="Select Category"
            styles={generalSelectStyles}
            isClearable
            required
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-4">
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="unit">
            Unit
          </label>
          <Select
            instanceId={`${instanceId}-unit`}
            inputId="unit"
            className="mt-2"
            options={toSelectOptions(UNITS)}
            value={toSelectOptions(UNITS).find((opt) => opt.value == unit)}
            onChange={handleUnitChange}
            placeholder="Select Unit"
            styles={generalSelectStyles}
            isClearable
            required
          />
        </div>
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="stock">
            Stock
          </label>
          <input
            id="stock"
            type="number"
            inputMode="numeric"
            pattern="[0-9]"
            placeholder="Enter stock quantity"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            onKeyDown={(e) => {
              if (
                !/[0-9.]/.test(e.key) &&
                e.key !== "Backspace" &&
                e.key !== "Delete" &&
                e.key !== "Tab" &&
                e.key !== "ArrowLeft" &&
                e.key !== "ArrowRight"
              ) {
                e.preventDefault();
              }
              if (e.key == "." && price.includes(".")) {
                e.preventDefault();
              }
            }}
          />
        </div>
      </div>
    </Modal>
  );
};
