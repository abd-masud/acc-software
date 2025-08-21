"use client";

import { Table, TableColumnsType, Input, Button, Modal, Tooltip } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { Products, ProductsTableProps } from "@/types/products";
import { EditProductModal } from "./EditProductModal";
import { FaEdit } from "react-icons/fa";
import { MdOutlineDeleteSweep } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";
import { FaXmark } from "react-icons/fa6";
import styled from "styled-components";

const StyledTable = styled(Table)`
  .ant-table-thead > tr:nth-child(1) > th {
    background-color: #478cf3;
    color: white;
  }
  .ant-table-thead > tr:nth-child(2) > th {
    background-color: #6aa2f5;
    color: white;
  }
`;

export const ProductsListTable: React.FC<ProductsTableProps> = ({
  products,
  fetchProducts,
  loading,
}) => {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Products | null>(null);
  const [productToDelete, setProductToDelete] = useState<Products | null>(null);
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [searchText, setSearchText] = useState("");
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [userMessage, setUserMessage] = useState<string | null>(null);

  const showEditModal = (product: Products) => {
    setCurrentProduct(product);
    setIsEditModalOpen(true);
  };

  const showDeleteModal = (product: Products) => {
    setProductToDelete(product);
    setDeleteConfirmationText("");
    setIsDeleteModalOpen(true);
  };

  const filteredProducts = useMemo(() => {
    const grouped = new Map<string, Products>();

    [...products]
      .sort((a, b) => b.id - a.id)
      .forEach((product) => {
        const key = product.product_id;
        if (!grouped.has(key)) {
          grouped.set(key, { ...product });
        } else {
          const existing = grouped.get(key)!;
          grouped.set(key, {
            ...existing,
            stock: String(
              (Number(existing.stock) || 0) + (Number(product.stock) || 0)
            ),
          });
        }
      });

    const groupedArray = Array.from(grouped.values());

    if (!searchText) return groupedArray;

    return groupedArray.filter((product) =>
      Object.values(product).some((value) =>
        value?.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [products, searchText]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchCurrencies = async () => {
      try {
        const currencyRes = await fetch(`/api/currencies?user_id=${user.id}`);
        const currencyJson = await currencyRes.json();

        if (currencyRes.status == 404 || !currencyJson.success) {
          setCurrencyCode("USD");
        } else if (currencyJson.data?.length > 0) {
          setCurrencyCode(currencyJson.data[0].currency || "USD");
        }
      } catch (error) {
        console.error("Failed to fetch currency:", error);
        setCurrencyCode("USD");
      }
    };

    fetchCurrencies();
  }, [user?.id]);

  const handleEditSubmit = async (updatedProduct: Products) => {
    try {
      const response = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) throw new Error("Failed to update product");

      setUserMessage("Product updated");
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
      setUserMessage("Update failed");
    } finally {
      setTimeout(() => setUserMessage(null), 5000);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      const payload = { product_id: productToDelete.product_id };

      const response = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Backend error:", result);
        throw new Error(result.message || "Failed to delete product(s)");
      }

      setUserMessage("Product deleted");
      setIsDeleteModalOpen(false);
      setDeleteConfirmationText("");
      fetchProducts();
    } catch (error) {
      console.error("Delete failed:", error);
      setUserMessage("Delete failed");
    } finally {
      setTimeout(() => setUserMessage(null), 5000);
    }
  };

  const handleCloseMessage = () => {
    setUserMessage(null);
  };

  const columns: TableColumnsType<Products> = [
    {
      title: "#",
      width: "40px",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Product ID",
      dataIndex: "product_id",
    },
    {
      title: "Product Name",
      dataIndex: "name",
    },
    {
      title: "Supplier",
      dataIndex: "supplier",
      render: (value: any) => {
        if (value == null) return "-";
        if (typeof value === "object") {
          return value.company || "-";
        }
        if (typeof value === "string") {
          if (value.trim() === '"In-house product"') {
            return "In-house product";
          }
          try {
            const parsed = JSON.parse(value);
            if (parsed?.company) {
              return parsed.company;
            }
          } catch {}
          return value;
        }
        return "-";
      },
    },
    {
      title: "Attribute",
      dataIndex: "attribute",
      render: (value: any) => {
        if (typeof value === "string") {
          try {
            value = JSON.parse(value);
          } catch {
            return value;
          }
        }
        if (Array.isArray(value) && value.length === 0) {
          return "-";
        }
        if (typeof value === "object" && value !== null) {
          const values = Object.values(value)
            .map((val: any) => {
              if (val && typeof val === "object") {
                return val.value ?? "[object]";
              }
              return val;
            })
            .filter((val) => val !== undefined && val !== null && val !== "");
          return values.length > 0 ? values.join(", ") : "-";
        }
        return value !== undefined && value !== null && value !== ""
          ? value
          : "-";
      },
    },
    {
      title: "Warehouse",
      dataIndex: "warehouse",
    },
    {
      title: "Cabinet",
      dataIndex: "cabinet",
    },
    {
      title: "Description",
      dataIndex: "description",
      render: (text: string) => (text ? text : "-"),
    },
    {
      title: "Buying Price",
      dataIndex: "buying_price",
      render: (buying_price) => `${buying_price} ${currencyCode}`,
    },
    {
      title: "Selling Price",
      dataIndex: "price",
      render: (price) => `${price} ${currencyCode}`,
    },
    {
      title: "Unit",
      dataIndex: "unit",
    },
    {
      title: "Category",
      dataIndex: "category",
    },
    {
      title: "Stock",
      dataIndex: "stock",
    },
    {
      title: "Action",
      render: (_, record) => (
        <div className="flex justify-center items-center gap-2">
          <Tooltip title="Edit">
            <button
              className="text-white text-[14px] bg-blue-500 hover:bg-blue-600 h-6 w-6 rounded flex justify-center items-center"
              onClick={() => showEditModal(record)}
            >
              <FaEdit />
            </button>
          </Tooltip>
          <Tooltip title="Delete">
            <button
              className="text-white text-[17px] bg-red-500 hover:bg-red-600 h-6 w-6 rounded flex justify-center items-center"
              onClick={() => showDeleteModal(record)}
            >
              <MdOutlineDeleteSweep />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
      {userMessage && (
        <div className="fixed left-1/2 top-10 transform -translate-x-1/2 z-50">
          <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800 text-green-600 border-2 border-green-600">
            <div className="text-sm font-medium truncate">{userMessage}</div>
            <button
              onClick={handleCloseMessage}
              className="ml-3 hover:text-green-600"
            >
              <FaXmark className="text-[14px]" />
            </button>
          </div>
        </div>
      )}

      <div className="flex sm:justify-between justify-end items-center mb-5">
        <div className="sm:flex items-center hidden">
          <div className="h-2 w-2 bg-[#307EF3] rounded-full mr-2"></div>
          <h2 className="text-[13px] font-[500]">Products Info</h2>
        </div>
        <Input
          type="text"
          placeholder="Search..."
          className="border text-[14px] sm:w-40 w-32 py-1 px-[10px] bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <StyledTable<any>
        scroll={{ x: "max-content" }}
        columns={columns}
        dataSource={filteredProducts}
        loading={loading}
        bordered
        rowKey="id"
      />

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentProduct={currentProduct}
        onSave={handleEditSubmit}
      />

      <Modal
        title="Confirm Delete Product"
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            onClick={handleDelete}
            disabled={deleteConfirmationText !== "DELETE"}
          >
            Delete Product
          </Button>,
        ]}
        destroyOnClose
      >
        <div className="space-y-4">
          <p>
            To confirm, type{" "}
            <span className="font-bold">&quot;DELETE&quot;</span> in the box
            below.
          </p>
          <input
            placeholder="DELETE"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md"
            value={deleteConfirmationText}
            onChange={(e) => setDeleteConfirmationText(e.target.value)}
          />
          <p className="text-red-500 text-[12px] font-bold">
            Warning: This action will permanently delete the product record.
          </p>
        </div>
      </Modal>
    </main>
  );
};
