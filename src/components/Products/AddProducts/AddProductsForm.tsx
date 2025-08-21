"use client";

import { useAuth } from "@/contexts/AuthContext";
import { SupplierOption } from "@/types/products";
import Image from "next/image";
import success from "../../../../public/images/success.webp";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useId, useState } from "react";
import Select, { StylesConfig } from "react-select";
import { FaXmark } from "react-icons/fa6";
import { Suppliers } from "@/types/suppliers";
import { Button, Modal } from "antd";
import warning from "../../../../public/images/warning.webp";
import { Warehouse } from "@/types/warehouse";
import { Cabinet } from "@/types/cabinet";

const TYPES = [
  "Single (Only Single product)",
  "Bulk (Auto SKU for each product)",
];

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

interface FormValues {
  type: string;
  name: string;
  description: string;
  buying_price: string;
  price: string;
  unit: string;
  stock: string;
  category: string;
  size: string;
  color: string;
  material: string;
  weight: string;
}

export const AddProductsForm = () => {
  const instanceId = useId();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [product_id, setProductId] = useState("");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [suppliers, setSuppliers] = useState<Suppliers[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [isSuppliersModalVisible, setIsSuppliersModalVisible] = useState(false);
  const [isCategoriesModalVisible, setIsCategoriesModalVisible] =
    useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Suppliers | null>(
    null
  );
  const [generalsLoaded, setGeneralsLoaded] = useState(false);
  const [isInHouseProduct, setIsInHouseProduct] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(
    null
  );
  const [selectedCabinet, setSelectedCabinet] = useState<Cabinet | null>(null);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);
  const [isLoadingCabinets, setIsLoadingCabinets] = useState(false);
  const [supplierProducts, setSupplierProducts] = useState<string[]>([]);
  const [formValues, setFormValues] = useState<FormValues>({
    type: "",
    name: "",
    description: "",
    buying_price: "",
    price: "",
    unit: "",
    stock: "",
    category: "",
    size: "",
    color: "",
    material: "",
    weight: "",
  });

  const parseOptionsString = (input: string | null | undefined): string[] => {
    if (!input) return [];
    if (input.startsWith("[") && input.endsWith("]")) {
      try {
        const content = input.slice(1, -1);
        return content
          .split(/[,\n]/)
          .map((item) => item.trim().replace(/^"|"$/g, ""))
          .filter((item) => item.length > 0);
      } catch {
        return [];
      }
    }
    return input.trim() ? [input.trim()] : [];
  };

  const [generalOptions, setGeneralOptions] = useState<{
    category: string[];
    size: string[];
    color: string[];
    material: string[];
    weight: string[];
  }>({ category: [], size: [], color: [], material: [], weight: [] });

  const supplierOptions = suppliers.map((supplier: Suppliers) => ({
    value: supplier.id,
    label: `${supplier.company} (${supplier.supplier_id})`,
    supplier: supplier,
  }));

  const warehouseOptions = warehouses.map((warehouse: Warehouse) => ({
    value: warehouse.id,
    label: `${warehouse.warehouse} (${warehouse.warehouse_id})`,
    warehouse: warehouse,
  }));

  const cabinetOptions = cabinets
    .filter((cabinet) => Number(cabinet.warehouse_id) === selectedWarehouse?.id)
    .map((cabinet: Cabinet) => ({
      value: cabinet.id,
      label: `${cabinet.cabinet} (${cabinet.cabinet_id})`,
      cabinet: cabinet,
    }));

  const showNoSuppliersModal = () => {
    setIsSuppliersModalVisible(true);
  };

  const showNoCategoryModal = () => {
    setIsCategoriesModalVisible(true);
  };

  const handleSuppliersModalClose = () => {
    setIsSuppliersModalVisible(false);
    checkEmptyCategories();
  };

  const handleCategoriesModalClose = () => {
    setIsCategoriesModalVisible(false);
  };

  const checkEmptyCategories = () => {
    if (generalOptions?.category?.length == 0) {
      showNoCategoryModal();
    }
  };

  const fetchGenerals = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/generals?user_id=${user.id}`);
      const json = await response.json();

      if (response.ok && json.success) {
        const optionsData = json.data[0] || {};

        setGeneralOptions({
          category: parseOptionsString(optionsData.category),
          size: parseOptionsString(optionsData.size),
          color: parseOptionsString(optionsData.color),
          material: parseOptionsString(optionsData.material),
          weight: parseOptionsString(optionsData.weight),
        });
      }
      setGeneralsLoaded(true);
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
    if (!user?.id) return;

    const fetchSuppliers = async () => {
      try {
        const suppliersRes = await fetch(`/api/suppliers?user_id=${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (suppliersRes.ok) {
          const suppliersData = await suppliersRes.json();
          const suppliersList = Array.isArray(suppliersData.data)
            ? suppliersData.data
            : [];
          setSuppliers(suppliersList);

          if (suppliersList.length == 0) {
            showNoSuppliersModal();
          }
        } else if (suppliersRes.status == 404) {
          showNoSuppliersModal();
        }
      } catch (error) {
        console.error("Failed to fetch suppliers:", error);
      }
    };

    fetchSuppliers();
  }, [user?.id]);

  useEffect(() => {
    if (selectedSupplier) {
      try {
        const products = JSON.parse(selectedSupplier.products || "[]");
        setSupplierProducts(Array.isArray(products) ? products : []);
      } catch (error) {
        console.error("Failed to parse supplier products:", error);
        setSupplierProducts([]);
      }
    } else {
      setSupplierProducts([]);
    }
  }, [selectedSupplier]);

  const isCategoryEmpty = (cat: any) => !Array.isArray(cat) || cat.length === 0;

  useEffect(() => {
    if (generalsLoaded && isCategoryEmpty(generalOptions.category)) {
      showNoCategoryModal();
    }
  }, [generalsLoaded, generalOptions.category]);

  useEffect(() => {
    const generateProductId = () => {
      const compPrefix = user?.company
        ? user.company.slice(0, 1).toUpperCase()
        : "C";
      const random = Math.floor(100000 + Math.random() * 900000);
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

  useEffect(() => {
    if (!user?.id) return;

    const fetchWarehouses = async () => {
      setIsLoadingWarehouses(true);
      try {
        const response = await fetch(`/api/warehouse?user_id=${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setWarehouses(Array.isArray(data.data) ? data.data : []);
        }
      } catch (error) {
        console.error("Failed to fetch warehouses:", error);
      } finally {
        setIsLoadingWarehouses(false);
      }
    };

    fetchWarehouses();
  }, [user?.id]);

  useEffect(() => {
    if (!selectedWarehouse?.id) {
      setCabinets([]);
      setSelectedCabinet(null);
      return;
    }

    const fetchCabinets = async () => {
      setIsLoadingCabinets(true);
      try {
        const response = await fetch(
          `/api/cabinet?warehouse_id=${selectedWarehouse.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCabinets(Array.isArray(data.data) ? data.data : []);
        }
      } catch (error) {
        console.error("Failed to fetch cabinets:", error);
      } finally {
        setIsLoadingCabinets(false);
      }
    };

    fetchCabinets();
  }, [selectedWarehouse]);

  const toSelectOptions = (arr: string[]) =>
    Array.isArray(arr) ? arr.map((item) => ({ label: item, value: item })) : [];

  const handleSelectChange = (field: keyof FormValues) => (selected: any) => {
    const value = selected?.value || "";

    if (field == "type") {
      setFormValues((prev) => ({
        ...prev,
        type: value,
        stock: value == "Single (Only Single product)" ? "1" : "",
      }));
    } else {
      setFormValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
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
        id == "price" || id == "tax" || id == "stock"
          ? value == ""
            ? ""
            : Number(value)
          : value,
    });
  };

  const generateSKU = () => {
    const now = new Date();
    const pad = (num: number) => num.toString().padStart(2, "0");
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hour = pad(now.getHours());
    const minute = pad(now.getMinutes());
    const second = pad(now.getSeconds());
    const random = Math.floor(100 + Math.random() * 900);
    const companyPrefix = user?.company
      ? user.company.replace(/\s+/g, "CO").toUpperCase().slice(0, 2)
      : "CO";
    return `P${companyPrefix}${year}${month}${day}${hour}${minute}${second}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const { size, color, material, weight, stock, type, ...restFormValues } =
      formValues;

    const stockQty = Number(stock) || 1;
    const attribute = [
      { name: "size", value: size },
      { name: "color", value: color },
      { name: "material", value: material },
      { name: "weight", value: weight },
    ].filter((attr) => attr.value);

    const skuList = Array.from({ length: stockQty }, () => generateSKU());

    const payloads = skuList.map((sku) => ({
      ...restFormValues,
      stock: 1,
      type,
      user_id: user?.id,
      product_id,
      supplier: isInHouseProduct ? "In-house product" : selectedSupplier,
      attribute,
      sku,
      warehouse_id: selectedWarehouse?.id,
      warehouse: selectedWarehouse?.warehouse,
      cabinet_id: selectedCabinet?.id,
      cabinet: selectedCabinet?.cabinet,
    }));

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ products: payloads }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to add product(s)");
      }

      setShowSuccessModal(true);
    } catch (error: any) {
      setUserMessage(error.message || "An unexpected error occurred");
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
      width: "full",
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

  const supplierSelectStyles: StylesConfig<SupplierOption, boolean> = {
    control: (base) => ({
      ...base,
      borderColor: "#E5E7EB",
      "&:hover": {
        borderColor: "#E5E7EB",
      },
      minHeight: "48px",
      fontSize: "14px",
      boxShadow: "none",
      backgroundColor: isInHouseProduct ? "#D1D5DB" : "#F2F4F7",
      color: isInHouseProduct ? "#6b7280" : "#111827",
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

  const handleOkay = () => {
    setShowSuccessModal(false);
    router.push("/products/products-list");
  };

  const handleCloseMessage = () => {
    setUserMessage(null);
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
              onClick={handleCloseMessage}
              className="ml-3 focus:outline-none hover:text-green-600"
            >
              <FaXmark className="text-[14px]" />
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center pb-5">
        <div className="h-2 w-2 bg-[#307EF3] rounded-full mr-2"></div>
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
              className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="text"
              id="product_id"
              value={product_id}
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="type">
              Single / Bulk Product
            </label>
            <Select
              instanceId={`${instanceId}-type`}
              inputId="type"
              className="mt-2"
              options={toSelectOptions(TYPES)}
              value={toSelectOptions(TYPES).find(
                (opt) => opt.value == formValues.type
              )}
              onChange={handleSelectChange("type")}
              placeholder="Select Type"
              styles={generalSelectStyles}
              isClearable
              required
            />
          </div>
        </div>

        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-[15px] font-semibold mb-3">Supplier Details</h3>
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              id="self"
              checked={isInHouseProduct}
              onChange={(e) => {
                setIsInHouseProduct(e.target.checked);
                setFormValues((prev) => ({ ...prev, name: "" }));
                if (e.target.checked) {
                  setSelectedSupplier(null);
                }
              }}
            />
            <label className="text-sm" htmlFor="self">
              In-House Product
            </label>
          </div>
          <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-4 gap-0">
            <div className="mb-4">
              <label className="text-[14px]" htmlFor="company">
                Company Name
              </label>
              <Select<{
                value: number;
                label: string;
                supplier: Suppliers;
              }>
                id="company"
                className="text-[14px] mt-2"
                options={supplierOptions}
                value={supplierOptions.find(
                  (option) => option.value == selectedSupplier?.id
                )}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    setSelectedSupplier(selectedOption.supplier);
                  } else {
                    setSelectedSupplier(null);
                  }
                  setFormValues((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="Select supplier"
                isClearable
                isSearchable
                isDisabled={isInHouseProduct}
                styles={supplierSelectStyles}
              />
            </div>
            <div className="mb-4">
              <label className="text-[14px]" htmlFor="owner">
                Company Owner
              </label>
              <input
                placeholder="Enter company owner"
                className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                type="text"
                id="owner"
                value={selectedSupplier?.owner || ""}
                readOnly
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="address">
              Address
            </label>
            <input
              placeholder="Enter address"
              className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="text"
              id="address"
              value={selectedSupplier?.address || ""}
              readOnly
            />
          </div>
          <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-4 gap-0">
            <div className="mb-4">
              <label className="text-[14px]" htmlFor="email">
                Email Address
              </label>
              <input
                placeholder="Enter email address"
                className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                type="email"
                id="email"
                value={selectedSupplier?.email || ""}
                readOnly
              />
            </div>
            <div className="mb-4">
              <label className="text-[14px]" htmlFor="contact">
                Contact Number
              </label>
              <input
                placeholder="Enter contact number"
                className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                type="text"
                id="contact"
                value={selectedSupplier?.contact || ""}
                readOnly
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="name">
              Product Name
            </label>
            {isInHouseProduct ? (
              <input
                placeholder="Enter product name"
                className="border text-[14px] py-3 px-[10px] w-full hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                type="text"
                id="name"
                value={formValues.name}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            ) : (
              <Select
                id="name"
                className="text-[14px] mt-2"
                options={supplierProducts.map((product) => ({
                  value: product,
                  label: product,
                }))}
                value={
                  formValues.name
                    ? { value: formValues.name, label: formValues.name }
                    : null
                }
                onChange={(selectedOption) => {
                  setFormValues((prev) => ({
                    ...prev,
                    name: selectedOption?.value || "",
                  }));
                }}
                placeholder="Select product"
                isClearable
                isSearchable
                isDisabled={!selectedSupplier}
                styles={generalSelectStyles}
                required
              />
            )}
          </div>
        </div>

        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-[15px] font-semibold mb-3">Product Storage</h3>
          <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-4 gap-0">
            <div className="mb-4">
              <label className="text-[14px]" htmlFor="warehouse">
                Warehouse
              </label>
              <Select<{
                value: number;
                label: string;
                warehouse: Warehouse;
              }>
                id="warehouse"
                className="text-[14px] mt-2"
                options={warehouseOptions}
                value={warehouseOptions.find(
                  (option) => option.value === selectedWarehouse?.id
                )}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    setSelectedWarehouse(selectedOption.warehouse);
                  } else {
                    setSelectedWarehouse(null);
                  }
                  setSelectedCabinet(null);
                }}
                placeholder={
                  isLoadingWarehouses
                    ? "Loading warehouses..."
                    : "Select warehouse"
                }
                isClearable
                isSearchable
                isLoading={isLoadingWarehouses}
                isDisabled={isLoadingWarehouses}
                styles={generalSelectStyles}
                required
              />
            </div>
            <div className="mb-4">
              <label className="text-[14px]" htmlFor="cabinet">
                Cabinet
              </label>
              <Select<{
                value: number;
                label: string;
                cabinet: Cabinet;
              }>
                id="cabinet"
                className="text-[14px] mt-2"
                options={cabinetOptions}
                value={cabinetOptions.find(
                  (option) => option.value === selectedCabinet?.id
                )}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    setSelectedCabinet(selectedOption.cabinet);
                  } else {
                    setSelectedCabinet(null);
                  }
                }}
                placeholder={
                  !selectedWarehouse
                    ? "Select a warehouse first"
                    : isLoadingCabinets
                    ? "Loading cabinets..."
                    : cabinetOptions.length === 0
                    ? "No cabinets available"
                    : "Select cabinet"
                }
                isClearable
                isSearchable
                isLoading={isLoadingCabinets}
                isDisabled={
                  !selectedWarehouse ||
                  isLoadingCabinets ||
                  cabinetOptions.length === 0
                }
                styles={generalSelectStyles}
                required
              />
            </div>
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
            maxLength={250}
            value={formValues.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 sm:gap-4">
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="buying_price">
              Buying Price ({currencyCode})
            </label>
            <input
              placeholder="Enter buying price"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              id="buying_price"
              min="0"
              step="0.01"
              value={formValues.buying_price}
              onChange={handleChange}
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
                if (
                  e.key == "." &&
                  formValues.buying_price.toString().includes(".")
                ) {
                  e.preventDefault();
                }
              }}
              required
            />
          </div>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="price">
              Selling Price ({currencyCode})
            </label>
            <input
              placeholder="Enter selling price"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              id="price"
              min="0"
              step="0.01"
              value={formValues.price}
              onChange={handleChange}
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
                if (e.key == "." && formValues.price.toString().includes(".")) {
                  e.preventDefault();
                }
              }}
              required
            />
          </div>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="unit">
              Unit
            </label>
            <Select
              instanceId={`${instanceId}-unit`}
              inputId="unit"
              className="mt-2"
              options={toSelectOptions(UNITS)}
              value={toSelectOptions(UNITS).find(
                (opt) => opt.value == formValues.unit
              )}
              onChange={handleSelectChange("unit")}
              placeholder="Select Unit"
              styles={generalSelectStyles}
              isClearable
              required
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
              options={generalOptions.category.map((option) => ({
                label: option,
                value: option,
              }))}
              value={
                generalOptions.category.find(
                  (opt) => opt === formValues.category
                )
                  ? {
                      label: formValues.category,
                      value: formValues.category,
                    }
                  : null
              }
              onChange={handleSelectChange("category")}
              placeholder="Category"
              styles={generalSelectStyles}
              isClearable
              required
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-5 md:grid-cols-2 grid-cols-1 sm:gap-4">
          <div className="mb-4 col-span-4">
            <div className="flex justify-between items-center">
              <label className="text-[14px]" htmlFor="category">
                Attributes
              </label>
            </div>
            <div className="grid sm:grid-cols-4 gap-4">
              <Select
                instanceId={`${instanceId}-size`}
                inputId="size"
                className="mt-2"
                options={generalOptions.size.map((option) => ({
                  label: option,
                  value: option,
                }))}
                value={
                  generalOptions.size.find((opt) => opt === formValues.size)
                    ? {
                        label: formValues.size,
                        value: formValues.size,
                      }
                    : null
                }
                onChange={handleSelectChange("size")}
                placeholder="Size"
                styles={generalSelectStyles}
                isClearable
                required
              />
              <Select
                instanceId={`${instanceId}-color`}
                inputId="color"
                className="mt-2"
                options={generalOptions.color.map((option) => ({
                  label: option,
                  value: option,
                }))}
                value={
                  generalOptions.color.find((opt) => opt === formValues.color)
                    ? {
                        label: formValues.color,
                        value: formValues.color,
                      }
                    : null
                }
                onChange={handleSelectChange("color")}
                placeholder="Color"
                styles={generalSelectStyles}
                isClearable
                required
              />
              <Select
                instanceId={`${instanceId}-material`}
                inputId="material"
                className="mt-2"
                options={generalOptions.material.map((option) => ({
                  label: option,
                  value: option,
                }))}
                value={
                  generalOptions.material.find(
                    (opt) => opt === formValues.material
                  )
                    ? {
                        label: formValues.material,
                        value: formValues.material,
                      }
                    : null
                }
                onChange={handleSelectChange("material")}
                placeholder="Material"
                styles={generalSelectStyles}
                isClearable
                required
              />
              <Select
                instanceId={`${instanceId}-weight`}
                inputId="weight"
                className="mt-2"
                options={generalOptions.weight.map((option) => ({
                  label: option,
                  value: option,
                }))}
                value={
                  generalOptions.weight.find((opt) => opt === formValues.weight)
                    ? {
                        label: formValues.weight,
                        value: formValues.weight,
                      }
                    : null
                }
                onChange={handleSelectChange("weight")}
                placeholder="Weight"
                styles={generalSelectStyles}
                isClearable
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="stock">
              Stock Quantity
            </label>
            <input
              placeholder="Enter Stock Quantity"
              className={`border text-[14px] py-[13px] px-[10px] w-full ${
                formValues.type == "Bulk (Auto SKU for each product)"
                  ? "bg-[#F2F4F7]"
                  : "bg-gray-300"
              } hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1`}
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              id="stock"
              min="0"
              value={formValues.stock}
              onChange={handleChange}
              disabled={formValues.type !== "Bulk (Auto SKU for each product)"}
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
                if (e.key == "." && formValues.stock.toString().includes(".")) {
                  e.preventDefault();
                }
              }}
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="text-[14px] font-[500] py-2 w-40 rounded cursor-pointer transition-all duration-300 mt-4 text-white bg-[#307EF3] hover:bg-[#478cf3] focus:bg-[#307EF3] disabled:opacity-50"
            disabled={loading}
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

      <Modal
        open={isSuppliersModalVisible}
        onCancel={handleSuppliersModalClose}
        closable={false}
        footer={[
          <Button
            key="continue"
            onClick={handleSuppliersModalClose}
            className="mr-1"
          >
            Continue
          </Button>,
          <Button
            key="add"
            type="primary"
            onClick={() => {
              router.push("/suppliers/add-suppliers");
              handleSuppliersModalClose();
            }}
          >
            Add Suppliers
          </Button>,
        ]}
      >
        <div className="flex justify-center">
          <Image
            height={150}
            width={150}
            src={warning}
            alt="Warning"
            priority
          />
        </div>
        <h2 className="text-xl font-bold text-center mb-4">
          No Suppliers Available
        </h2>
        <p className="text-center">
          There are no suppliers available. Please add suppliers first or just
          continue with in-house products.
        </p>
      </Modal>

      <Modal
        open={isCategoriesModalVisible}
        closable={false}
        maskClosable={false}
        keyboard={false}
        footer={[
          <Button
            key="add"
            type="primary"
            onClick={() => {
              router.push("/products/product-settings");
              handleCategoriesModalClose();
            }}
          >
            Add Categories
          </Button>,
        ]}
      >
        <div className="flex justify-center">
          <Image
            height={150}
            width={150}
            src={warning}
            alt="Warning"
            priority
          />
        </div>
        <h2 className="text-xl font-bold text-center mb-4">
          No Categories Available
        </h2>
        <p className="text-center">
          There are no product categories available. Please add categories
          first.
        </p>
      </Modal>
    </main>
  );
};
