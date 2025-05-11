"use client";

import { Table, TableColumnsType, Button, Input, Modal, Tooltip } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { QuoteData, QuoteItem, QuotesTableProps } from "@/types/quotes";
import Link from "next/link";
import { MdOutlineDeleteSweep, MdOutlinePictureAsPdf } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";
import { FaXmark } from "react-icons/fa6";

export const QuotesListTable: React.FC<QuotesTableProps> = ({
  quotes,
  fetchQuotes,
  loading,
}) => {
  const { user } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<QuoteData | null>(null);
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [searchText, setSearchText] = useState("");
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [userMessage, setUserMessage] = useState<string | null>(null);

  const showDeleteModal = (quote: QuoteData) => {
    setQuoteToDelete(quote);
    setDeleteConfirmationText("");
    setIsDeleteModalOpen(true);
  };

  const filteredQuotes = useMemo(() => {
    if (!searchText) return quotes;

    return quotes.filter((quote) =>
      Object.values(quote).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [quotes, searchText]);

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

  const handleDelete = async () => {
    if (!quoteToDelete) return;

    try {
      const response = await fetch("/api/quotes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: quoteToDelete.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      setUserMessage("Quote deleted");
      fetchQuotes();
      setIsDeleteModalOpen(false);
      setDeleteConfirmationText("");
    } catch {
      setUserMessage("Delete failed");
    } finally {
      setTimeout(() => setUserMessage(null), 5000);
    }
  };

  const columns: TableColumnsType<QuoteData> = [
    {
      title: "#",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Quote ID",
      dataIndex: "quote_id",
    },
    {
      title: "Customer",
      render: (record: QuoteData) => (
        <span>{record.customer?.name || "-"}</span>
      ),
    },
    {
      title: "Items",
      dataIndex: "items",
      render: (items: QuoteItem[]) => (
        <div
          className="cursor-default"
          title={
            Array.isArray(items)
              ? items
                  .map(
                    (item) =>
                      `${item.product || "-"} - ${item.quantity} ${item.unit}`
                  )
                  .join("\n")
              : "N/A"
          }
        >
          {Array.isArray(items)
            ? `${items.length} ${items.length == 1 ? "item" : "items"}`
            : "N/A"}
        </div>
      ),
    },
    {
      title: "Financials",
      children: [
        {
          title: "Subtotal",
          dataIndex: "subtotal",
          render: (value: number) =>
            value > 0 ? `${value.toFixed(2)} ${currencyCode}` : "-",
        },
        {
          title: "Tax",
          dataIndex: "tax",
          render: (value: number) =>
            value > 0 ? `${value.toFixed(2)} ${currencyCode}` : "-",
        },
        {
          title: "Discount",
          dataIndex: "discount",
          render: (value: number) =>
            value > 0 ? `${value.toFixed(2)} ${currencyCode}` : "-",
        },
        {
          title: "Total",
          dataIndex: "total",
          render: (value: number) =>
            value > 0 ? `${value.toFixed(2)} ${currencyCode}` : "-",
        },
      ],
    },
    {
      title: "Action",
      render: (_, record) => (
        <div className="flex justify-center items-center gap-2">
          <Tooltip title="Quote">
            <Link
              className="text-white hover:text-white text-[16px] bg-yellow-500 hover:bg-yellow-600 h-6 w-6 rounded transition-colors duration-300 flex justify-center items-center"
              href={`/quotes/${record.id}`}
            >
              <MdOutlinePictureAsPdf />
            </Link>
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
          <h2 className="text-[13px] font-[500]">Quotes Info</h2>
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
        dataSource={filteredQuotes}
        loading={loading}
        bordered
        rowKey="id"
      />

      <Modal
        title="Confirm Delete Quote"
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
            Delete Quote
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
            Warning: This action will permanently delete the quote record.
          </p>
        </div>
      </Modal>
    </main>
  );
};
