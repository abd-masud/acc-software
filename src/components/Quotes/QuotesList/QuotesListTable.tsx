"use client";

import {
  Table,
  TableColumnsType,
  Button,
  Input,
  Modal,
  Tooltip,
  DatePicker,
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { QuoteData, QuoteItem, QuotesTableProps } from "@/types/quotes";
import Link from "next/link";
import {
  MdMoveUp,
  MdOutlineDeleteSweep,
  MdOutlinePictureAsPdf,
} from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";
import dayjs from "dayjs";
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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuoteData | null>(null);
  const [payNow, setPayNow] = useState("");
  const [dueDate, setDueDate] = useState(dayjs().add(7, "days"));
  const [paymentType, setPaymentType] = useState("cash");

  const dateFormat = "DD MMMM YYYY";

  const showDeleteModal = (quote: QuoteData) => {
    setQuoteToDelete(quote);
    setDeleteConfirmationText("");
    setIsDeleteModalOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
    setSelectedQuote(null);
  };

  const handleInvoiceClick = (quote: QuoteData) => {
    setSelectedQuote(quote);
    setIsOpen(true);
  };

  const handlePayNowChange = (value: string) => {
    setPayNow(value);
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) setDueDate(date);
  };

  const filteredQuotes = useMemo(() => {
    const sortedQuotes = [...quotes].sort((a, b) => {
      return b.id - a.id;
    });
    if (!searchText) return sortedQuotes;

    return sortedQuotes.filter((quote) =>
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedQuote) return;

    if (payNow > selectedQuote.total) return;

    const due_amount = Number(selectedQuote.total) - Number(payNow);

    const sub_invoice = [
      {
        paid_amount: payNow || 0,
        due_amount: due_amount,
        date: dayjs(),
      },
    ];

    const invoiceData = {
      customer: selectedQuote.customer,
      items: selectedQuote.items,
      invoice_id: selectedQuote.quote_id,
      date: dayjs().format("YYYY-MM-DD"),
      due_date: due_amount == 0 ? "N/A" : dueDate.format("YYYY-MM-DD"),
      subtotal: selectedQuote.subtotal,
      tax: selectedQuote.tax,
      discount: selectedQuote.discount,
      total: selectedQuote.total,
      paid_amount: payNow || 0,
      due_amount,
      pay_type: paymentType,
      notes: selectedQuote.notes,
      sub_invoice,
      user_id: user?.id as number,
    };

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      if (res.ok) {
        await fetch("/api/quotes", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: selectedQuote.id }),
        });

        onClose();
        setUserMessage("Transferred quote to invoice");
        fetchQuotes();
      } else {
        setUserMessage("Failed to transfer");
      }
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setTimeout(() => setUserMessage(null), 5000);
    }
  };

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
      setIsDeleteModalOpen(false);
      setDeleteConfirmationText("");
      fetchQuotes();
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
      title: "Customer Info",
      children: [
        {
          title: "Customer ID",
          dataIndex: ["customer", "customer_id"],
          render: (text: string) => text || "-",
        },
        {
          title: "Name",
          dataIndex: ["customer", "name"],
          render: (text: string) => text || "-",
        },
        {
          title: "Email",
          dataIndex: ["customer", "email"],
          render: (text: string) => text || "-",
        },
        {
          title: "Phone",
          dataIndex: ["customer", "contact"],
          render: (text: string) => text || "-",
        },
        {
          title: "Address",
          dataIndex: ["customer", "delivery"],
          render: (text: string) => text || "-",
        },
      ],
    },
    {
      title: "Items",
      dataIndex: "items",
      render: (items: QuoteItem[]) => (
        <Tooltip
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
          <div className="cursor-default border px-1 rounded">
            {Array.isArray(items)
              ? `${items.length} ${items.length == 1 ? "item" : "items"}`
              : "N/A"}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Quote Date",
      dataIndex: "date",
      render: (date: string) =>
        date
          ? new Date(date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-",
    },
    {
      title: "Financial Info",
      children: [
        {
          title: "Subtotal",
          dataIndex: "subtotal",
          render: (value: number) =>
            value > 0 ? `${value} ${currencyCode}` : "-",
        },
        {
          title: "Tax",
          dataIndex: "tax",
          render: (value: number) =>
            value > 0 ? `${value} ${currencyCode}` : "-",
        },
        {
          title: "Discount",
          dataIndex: "discount",
          render: (value: number) =>
            value > 0 ? `${value} ${currencyCode}` : "-",
        },
        {
          title: "Total",
          dataIndex: "total",
          render: (value: number) =>
            value > 0 ? `${value} ${currencyCode}` : "-",
        },
      ],
    },
    {
      title: "Action",
      render: (_, record) => (
        <div className="flex justify-center items-center gap-2">
          <Tooltip title="Invoice It">
            <button
              onClick={() => handleInvoiceClick(record)}
              className="text-white hover:text-white text-[16px] bg-green-600 hover:bg-green-700 h-6 w-6 rounded transition-colors duration-300 flex justify-center items-center"
            >
              <MdMoveUp />
            </button>
          </Tooltip>
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
        open={isOpen}
        onOk={() =>
          handleSubmit({
            preventDefault: () => {},
          } as React.FormEvent<HTMLFormElement>)
        }
        onCancel={onClose}
        okText="Add to Invoice"
      >
        <form id="invoiceForm" onSubmit={handleSubmit}>
          <div className="flex items-center pb-3">
            <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
            <h2 className="text-[13px] font-[500]">Invoice</h2>
          </div>
          <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
            <div className="mb-4">
              <label className="text-[14px]" htmlFor="invoiceId">
                Invoice ID
              </label>
              <input
                placeholder="Enter Invoice ID"
                className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                type="text"
                id="invoiceId"
                value={selectedQuote?.quote_id || ""}
                readOnly
              />
            </div>
            <div className="mb-4">
              <label className="text-[14px]" htmlFor="name">
                Customer
              </label>
              <input
                className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                type="text"
                id="name"
                value={`${selectedQuote?.customer?.name || ""}  (${
                  selectedQuote?.customer?.customer_id || ""
                })`}
                readOnly
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
            <div className="mb-4">
              <label className="text-[14px]" htmlFor="email">
                Email Address
              </label>
              <input
                className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                type="text"
                id="email"
                value={selectedQuote?.customer?.email}
                readOnly
              />
            </div>
            <div className="mb-4">
              <label className="text-[14px]" htmlFor="contact">
                Phone Number
              </label>
              <input
                className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                type="text"
                id="contact"
                value={selectedQuote?.customer?.contact}
                readOnly
              />
            </div>
          </div>

          <div className="grid md:grid-cols-4 grid-cols-1 gap-3">
            <div className="mb-4">
              <label className="text-[14px]" htmlFor="total">
                Subtotal
              </label>
              <input
                className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                id="total"
                value={Number(selectedQuote?.subtotal)}
                readOnly
              />
            </div>
            <div className="mb-4">
              <label className="text-[14px]" htmlFor="total">
                Tax
              </label>
              <input
                className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                id="total"
                value={Number(selectedQuote?.tax)}
                readOnly
              />
            </div>
            <div className="mb-4">
              <label className="text-[14px]" htmlFor="total">
                Discount
              </label>
              <input
                className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                id="total"
                value={Number(selectedQuote?.discount)}
                readOnly
              />
            </div>
            <div className="mb-4">
              <label className="text-[14px]" htmlFor="total">
                Total Amount
              </label>
              <input
                className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                id="total"
                value={Number(selectedQuote?.total)}
                readOnly
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
            <div className="mb-4">
              <label className="text-[14px]" htmlFor="paid">
                Pay Now
              </label>
              <input
                type="number"
                placeholder="0.00"
                className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                min={0}
                max={Number(selectedQuote?.total)}
                id="paid"
                value={payNow}
                onChange={(e) => handlePayNowChange(e.target.value)}
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
                  if (e.key == "." && payNow.includes(".")) {
                    e.preventDefault();
                  }
                }}
                required
              />
            </div>

            <div>
              <label className="text-[14px]" htmlFor="date">
                Due Date
              </label>
              <DatePicker
                className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                type="date"
                id="date"
                format={dateFormat}
                value={dueDate}
                onChange={handleDateChange}
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-[14px]">Payment Method</label>
            <div className="flex sm:flex-row flex-col sm:gap-5 gap-1">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  className="text-blue-500 focus:ring-blue-500"
                  name="paymentType"
                  value="cash"
                  checked={paymentType == "cash"}
                  onChange={() => setPaymentType("cash")}
                />
                <span className="text-[14px]">Cash</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  className="text-blue-500 focus:ring-blue-500"
                  name="paymentType"
                  value="wallet"
                  checked={paymentType == "wallet"}
                  onChange={() => setPaymentType("wallet")}
                />
                <span className="text-[14px]">Wallet</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  className="text-blue-500 focus:ring-blue-500"
                  name="paymentType"
                  value="bank"
                  checked={paymentType == "bank"}
                  onChange={() => setPaymentType("bank")}
                />
                <span className="text-[14px]">Bank</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  className="text-blue-500 focus:ring-blue-500"
                  name="paymentType"
                  value="others"
                  checked={paymentType == "others"}
                  onChange={() => setPaymentType("others")}
                />
                <span className="text-[14px]">Others</span>
              </label>
            </div>
          </div>
        </form>
      </Modal>
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
