"use client";

import { Table, TableColumnsType, Button, Input, Modal, Tooltip } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { Products, ProductsTableProps } from "@/types/products";
import { FaEdit } from "react-icons/fa";
import { MdOutlineDeleteSweep } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";
import { FaXmark } from "react-icons/fa6";
import { EditStockInHandModal } from "./EditStockInHandModal";

export const StockInHandListTable: React.FC<ProductsTableProps> = ({
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
    const sortedProducts = [...products].sort((a, b) => {
      return b.id - a.id;
    });
    if (!searchText) return sortedProducts;

    return sortedProducts.filter((product) =>
      Object.values(product).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [products, searchText]);

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

  const handleEditSubmit = async (updatedProduct: Products) => {
    try {
      const response = await fetch("/api/products", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      setUserMessage("Product updated");
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setTimeout(() => setUserMessage(null), 5000);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch("/api/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: productToDelete.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setUserMessage("Product deleted");
      setIsDeleteModalOpen(false);
      setDeleteConfirmationText("");
      fetchProducts();
    } catch {
      setUserMessage("Delete failed");
    } finally {
      setTimeout(() => setUserMessage(null), 5000);
    }
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
      title: "Type",
      dataIndex: "type",
    },
    {
      title: "SKU ID",
      dataIndex: "sku_id",
    },
    {
      title: "Product Name",
      dataIndex: "name",
    },
    {
      title: "Purchaser",
      dataIndex: "purchaser",
    },
    {
      title: "Attribute",
      dataIndex: "attribute",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Buying Price",
      dataIndex: "buying_price",
      render: (price) => `${price} ${currencyCode}`,
    },
    {
      title: "Price",
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
              className="text-white text-[14px] bg-blue-500 hover:bg-blue-600 h-6 w-6 rounded transition-colors duration-300 flex justify-center items-center"
              onClick={() => showEditModal(record)}
            >
              <FaEdit />
            </button>
          </Tooltip>
          <Tooltip title="Delete">
            <button
              className="text-white text-[17px] bg-red-500 hover:bg-red-600 h-6 w-6 rounded transition-colors duration-300 flex justify-center items-center"
              onClick={() => showDeleteModal(record)}
            >
              <MdOutlineDeleteSweep />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

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
      <div className="flex sm:justify-between justify-end items-center mb-5">
        <div className="sm:flex items-center hidden">
          <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
          <h2 className="text-[13px] font-[500]">Stock In Hand Info</h2>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Input
            type="text"
            placeholder="Search..."
            className="border text-[14px] sm:w-40 w-32 py-1 px-[10px] bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>
      <Table
        scroll={{ x: "max-content" }}
        columns={columns}
        dataSource={filteredProducts}
        loading={loading}
        bordered
        rowKey="id"
      />

      <EditStockInHandModal
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
          <Button key="back" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
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
            below
          </p>
          <input
            placeholder="DELETE"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
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
