"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Products } from "@/types/products";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export const AddProductsForm = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formValues, setFormValues] = useState<Omit<Products, "id">>({
    key: "",
    name: "",
    description: "",
    price: 0,
    tax_rate: 10,
    category: "",
    stock: 0,
    unit: "pcs",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;
    setFormValues({
      ...formValues,
      [id]:
        id === "price" || id === "tax_rate" || id === "stock"
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
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFormValues({
          key: "",
          name: "",
          description: "",
          price: 0,
          tax_rate: 10,
          category: "",
          stock: 0,
          unit: "pcs",
        });
        router.push("/products/products-list");
      } else {
        console.error("Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
      <div className="flex items-center pb-5">
        <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
        <h2 className="text-[13px] font-[500]">Add Product Form</h2>
      </div>
      <form onSubmit={handleSubmit}>
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

        <div className="mb-4">
          <label className="text-[14px]" htmlFor="description">
            Description
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

        <div className="grid sm:grid-cols-3 grid-cols-1 gap-4">
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="price">
              Price
            </label>
            <input
              placeholder="0.00"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="number"
              id="price"
              min="0"
              step="0.01"
              value={formValues.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="text-[14px]" htmlFor="tax_rate">
              Tax Rate (%)
            </label>
            <input
              placeholder="10"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="number"
              id="tax_rate"
              min="0"
              max="100"
              step="0.1"
              value={formValues.tax_rate}
              onChange={handleChange}
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
            <label className="text-[14px]" htmlFor="category">
              Category
            </label>
            <input
              placeholder="Electronics, Furniture, etc."
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="text"
              id="category"
              value={formValues.category}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label className="text-[14px]" htmlFor="stock">
              Stock Quantity
            </label>
            <input
              placeholder="0"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="number"
              id="stock"
              min="0"
              value={formValues.stock}
              onChange={handleChange}
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
    </main>
  );
};
