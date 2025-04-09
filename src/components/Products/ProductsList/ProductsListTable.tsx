"use client";

import {
  Table,
  TableColumnsType,
  Button,
  Dropdown,
  MenuProps,
  Popconfirm,
  message,
} from "antd";
import React, { useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import { Products, ProductsTableProps } from "@/types/products";
import { EditProductModal } from "./EditProductModal";

export const ProductsListTable: React.FC<ProductsTableProps> = ({
  products,
  fetchProducts,
  loading,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Products | null>(null);
  const showEditModal = (product: Products) => {
    setCurrentProduct(product);
    setIsEditModalOpen(true);
  };

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

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch("/api/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      fetchProducts();
    } catch {
      message.error("Delete failed");
    }
  };

  const getMenuItems = (record: Products): MenuProps["items"] => [
    {
      key: "edit",
      label: (
        <Button
          icon={<MdEdit />}
          onClick={() => showEditModal(record)}
          type="link"
        >
          Edit
        </Button>
      ),
    },
    {
      key: "delete",
      label: (
        <Popconfirm
          title={`Delete ${record.name}?`}
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="link" danger>
            <MdDelete />
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const columns: TableColumnsType<Products> = [
    {
      title: "#",
      width: "40px",
      render: (_, __, index) => index + 1,
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
      render: (price) => `${price.toFixed(2)} BDT`,
    },
    {
      title: "Tax Rate",
      dataIndex: "tax_rate",
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
      title: "Unit",
      dataIndex: "unit",
    },
    {
      title: "Action",
      render: (_, record) => (
        <Dropdown menu={{ items: getMenuItems(record) }} trigger={["click"]}>
          <Button>Options</Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center">
          <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
          <h2 className="text-[13px] font-[500]">Products Info</h2>
        </div>
      </div>
      <Table
        scroll={{ x: "max-content" }}
        columns={columns}
        dataSource={products}
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
    </main>
  );
};
