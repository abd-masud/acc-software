"use client";

import { Table, TableColumnsType, Button, message, Input, Modal } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { Products, ProductsTableProps } from "@/types/products";
import { EditProductModal } from "./EditProductModal";
import { ProductsReportButton } from "./ProductsReport";
import { FaEdit } from "react-icons/fa";
import { MdOutlineDeleteSweep } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";

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
    const fetchCurrencies = async () => {
      try {
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (user?.id) {
          headers["user_id"] = user.id.toString();
        }
        const currencyRes = await fetch("/api/currencies", {
          method: "GET",
          headers: headers,
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

      message.success("Product updated successfully");
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      message.error("Update failed");
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

      message.success("Customer deleted successfully");
      setIsDeleteModalOpen(false);
      setDeleteConfirmationText("");
      fetchProducts();
    } catch {
      message.error("Delete failed");
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
      title: "Product Name",
      dataIndex: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
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
          <button
            className="text-white text-[14px] bg-blue-500 hover:bg-blue-600 h-6 w-6 rounded transition-colors duration-300 flex justify-center items-center"
            onClick={() => showEditModal(record)}
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            className="text-white text-[17px] bg-red-500 hover:bg-red-600 h-6 w-6 rounded transition-colors duration-300 flex justify-center items-center"
            onClick={() => showDeleteModal(record)}
            title="Delete"
          >
            <MdOutlineDeleteSweep />
          </button>
        </div>
      ),
    },
  ];

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
      <div className="flex sm:justify-between justify-end items-center mb-5">
        <div className="sm:flex items-center hidden">
          <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
          <h2 className="text-[13px] font-[500]">Products Info</h2>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Input
            type="text"
            placeholder="Search..."
            className="border text-[14px] w-32 py-1 px-[10px] bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <ProductsReportButton products={filteredProducts} />
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
          <Button key="back" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            onClick={handleDelete}
            disabled={deleteConfirmationText !== "DELETE-PRODUCT"}
          >
            Delete Product
          </Button>,
        ]}
        destroyOnClose
      >
        <div className="space-y-4">
          <p>
            To confirm, type{" "}
            <span className="font-bold">&quot;DELETE-PRODUCT&quot;</span> in the
            box below
          </p>
          <input
            placeholder="DELETE-PRODUCT"
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
