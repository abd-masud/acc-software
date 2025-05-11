"use client";

import { Modal, message } from "antd";
import { EditProductModalProps } from "@/types/products";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  currentProduct,
  onSave,
}) => {
  const { user } = useAuth();
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState(0);
  const [unit, setUnit] = useState("");
  const [currencyCode, setCurrencyCode] = useState("USD");

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
      setPrice(Number(currentProduct.price));
      setCategory(currentProduct.category);
      setStock(Number(currentProduct.stock));
      setUnit(currentProduct.unit);
    }
  }, [currentProduct]);

  const handleSubmit = async () => {
    if (!currentProduct) return;

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

  return (
    <Modal open={isOpen} onOk={handleSubmit} onCancel={onClose} okText="Save">
      <div className="flex items-center pb-3">
        <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
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
            className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
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
            placeholder="Enter price"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="category">
            Category
          </label>
          <input
            id="category"
            placeholder="Enter category"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-4">
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="unit">
            Unit
          </label>
          <select
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
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
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="stock">
            Stock
          </label>
          <input
            id="stock"
            type="number"
            placeholder="Enter stock quantity"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
          />
        </div>
      </div>
    </Modal>
  );
};
