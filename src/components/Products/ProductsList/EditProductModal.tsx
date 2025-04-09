"use client";

import { Modal, message } from "antd";
import { EditProductModalProps } from "@/types/products";
import { useEffect, useState } from "react";

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  currentProduct,
  onSave,
}) => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [tax_rate, setTax_rate] = useState(0);
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState(0);
  const [unit, setUnit] = useState("");

  useEffect(() => {
    if (currentProduct) {
      setProductName(currentProduct.name);
      setDescription(currentProduct.description || "");
      setPrice(currentProduct.price || 0);
      setTax_rate(currentProduct.tax_rate || 0);
      setCategory(currentProduct.category || "");
      setStock(currentProduct.stock || 0);
      setUnit(currentProduct.unit || "");
    }
  }, [currentProduct]);

  const handleSubmit = async () => {
    if (!currentProduct) return;

    try {
      const updatedProduct = {
        ...currentProduct,
        name: productName,
        description,
        price,
        tax_rate,
        category,
        stock,
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
            Price
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
          <label className="text-[14px]" htmlFor="tax_rate">
            Tax Rate (%)
          </label>
          <input
            id="tax_rate"
            type="number"
            placeholder="Enter tax rate"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            value={tax_rate}
            onChange={(e) => setTax_rate(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-4">
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

        <div className="mb-4">
          <label className="text-[14px]" htmlFor="unit">
            Unit
          </label>
          <select
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            id="unit"
            value={unit}
            onChange={(e) => setCategory(e.target.value)}
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
    </Modal>
  );
};
