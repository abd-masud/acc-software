"use client";

import { Modal, message } from "antd";
import { EditProductModalProps, SupplierOption } from "@/types/products";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Select, { StylesConfig } from "react-select";
import { FaXmark } from "react-icons/fa6";
import { Suppliers } from "@/types/suppliers";

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

export const EditProductModal: React.FC<EditProductModalProps> = ({
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
  const [suppliers, setSuppliers] = useState<Suppliers[]>([]);
  const [description, setDescription] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [isInHouseProduct, setIsInHouseProduct] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Suppliers | null>(
    null
  );
  const [attributes, setAttributes] = useState({
    size: "",
    color: "",
    material: "",
    weight: "",
  });
  const [generalOptions, setGeneralOptions] = useState<{
    category: string[];
    size: string[];
    color: string[];
    material: string[];
    weight: string[];
  }>({ category: [], size: [], color: [], material: [], weight: [] });

  const supplierOptions = useMemo(() => {
    return suppliers.map((supplier: Suppliers) => ({
      value: supplier.id,
      label: `${supplier.company} (${supplier.supplier_id})`,
      supplier: supplier,
    }));
  }, [suppliers]);

  const transformAttributes = (
    attributeArray: Array<{ name: string; value: string }> = []
  ) => {
    return attributeArray.reduce((acc: { [key: string]: string }, attr) => {
      acc[attr.name] = attr.value;
      return acc;
    }, {});
  };

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

      const parseArray = (value: any): string[] => {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      };

      const optionsData = json.data[0] || {};
      setGeneralOptions({
        category: parseArray(optionsData.category),
        size: parseArray(optionsData.size),
        color: parseArray(optionsData.color),
        material: parseArray(optionsData.material),
        weight: parseArray(optionsData.weight),
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
    if (!user?.id) return;
    const fetchCustomers = async () => {
      try {
        const suppliersRes = await fetch(`/api/suppliers?user_id=${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (suppliersRes.ok) {
          const suppliersData = await suppliersRes.json();
          setSuppliers(
            Array.isArray(suppliersData.data) ? suppliersData.data : []
          );
        }
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      }
    };

    fetchCustomers();
  }, [user?.id]);

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
      setBuyingPrice(currentProduct.buying_price || "");
      setSellingPrice(currentProduct.price || "");
      setCategory(currentProduct.category);
      setUnit(currentProduct.unit);
      setIsInHouseProduct(!currentProduct.supplier.id);

      const transformedAttributes = transformAttributes(
        currentProduct.attribute
      );
      setAttributes({
        size: transformedAttributes.size || "",
        color: transformedAttributes.color || "",
        material: transformedAttributes.material || "",
        weight: transformedAttributes.weight || "",
      });

      if (currentProduct.supplier.id && suppliers.length > 0) {
        const productSupplier = suppliers.find(
          (p) => p.id == currentProduct.supplier.id
        );
        setSelectedSupplier(productSupplier || null);
      }
    }
  }, [currentProduct, suppliers]);

  const handleSubmit = async () => {
    if (!currentProduct) return;

    setUserMessage(null);

    if (
      !productName.trim() ||
      !buyingPrice.trim() ||
      !sellingPrice.trim() ||
      !category.trim() ||
      !unit.trim()
    ) {
      setUserMessage("Fill in all fields");
      setTimeout(() => setUserMessage(null), 5000);
      return;
    }

    try {
      setLoading(true);

      const attribute = [
        { name: "size", value: attributes.size.trim() },
        { name: "color", value: attributes.color.trim() },
        { name: "material", value: attributes.material.trim() },
        { name: "weight", value: attributes.weight.trim() },
      ].filter((attr) => attr.value);

      const updatedProduct: any = {
        product_id: productId,
        name: productName,
        supplier: isInHouseProduct ? "In-house product" : selectedSupplier,
        description: description,
        buying_price: buyingPrice,
        price: sellingPrice,
        category: category,
        unit: unit,
        attribute,
      };

      await onSave(updatedProduct);
      message.success("Product updated successfully");
      onClose();
    } catch (err) {
      console.error(err);
      setUserMessage("Failed to update product. Please try again.");
      message.error("Failed to update product");
    } finally {
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

      <div className="mb-6 p-4 border rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-semibold">
            Supplier <span className="sm:inline hidden">Details</span>
          </h3>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            id="self"
            checked={isInHouseProduct}
            onChange={(e) => {
              setIsInHouseProduct(e.target.checked);
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
          <label className="text-[14px]" htmlFor="buying_price">
            Buying Price ({currencyCode})
          </label>
          <input
            id="buying_price"
            type="number"
            inputMode="numeric"
            pattern="[0-9]"
            placeholder="Enter buying price"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            value={buyingPrice}
            onChange={(e) => setBuyingPrice(e.target.value)}
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
              if (e.key == "." && buyingPrice.includes(".")) {
                e.preventDefault();
              }
            }}
          />
        </div>
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="price">
            Selling Price ({currencyCode})
          </label>
          <input
            id="price"
            type="number"
            inputMode="numeric"
            pattern="[0-9]"
            placeholder="Enter selling price"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
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
              if (e.key == "." && sellingPrice.includes(".")) {
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
      </div>
      <div className="mb-4">
        <label className="text-[14px]" htmlFor="category">
          Attributes
        </label>
        <div className="grid sm:grid-cols-2 gap-2">
          <Select
            instanceId={`${instanceId}-size`}
            inputId="size"
            className="mt-2"
            options={toSelectOptions(generalOptions.size)}
            value={toSelectOptions(generalOptions.size).find(
              (opt) => opt.value == attributes.size
            )}
            onChange={(selectedOption) =>
              setAttributes((prev) => ({
                ...prev,
                size: selectedOption?.value || "",
              }))
            }
            styles={generalSelectStyles}
            placeholder="Size"
            isClearable
            required
          />

          <Select
            instanceId={`${instanceId}-color`}
            inputId="color"
            className="mt-2"
            options={toSelectOptions(generalOptions.color)}
            value={toSelectOptions(generalOptions.color).find(
              (opt) => opt.value == attributes.color
            )}
            onChange={(selectedOption) =>
              setAttributes((prev) => ({
                ...prev,
                color: selectedOption?.value || "",
              }))
            }
            styles={generalSelectStyles}
            placeholder="Color"
            isClearable
            required
          />

          <Select
            instanceId={`${instanceId}-material`}
            inputId="material"
            className="mt-2"
            options={toSelectOptions(generalOptions.material)}
            value={toSelectOptions(generalOptions.material).find(
              (opt) => opt.value == attributes.material
            )}
            onChange={(selectedOption) =>
              setAttributes((prev) => ({
                ...prev,
                material: selectedOption?.value || "",
              }))
            }
            styles={generalSelectStyles}
            placeholder="Material"
            isClearable
            required
          />

          <Select
            instanceId={`${instanceId}-weight`}
            inputId="weight"
            className="mt-2"
            options={toSelectOptions(generalOptions.weight)}
            value={toSelectOptions(generalOptions.weight).find(
              (opt) => opt.value == attributes.weight
            )}
            onChange={(selectedOption) =>
              setAttributes((prev) => ({
                ...prev,
                weight: selectedOption?.value || "",
              }))
            }
            styles={generalSelectStyles}
            placeholder="weight"
            isClearable
            required
          />
        </div>
      </div>
    </Modal>
  );
};
