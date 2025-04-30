"use client";

import { Table, TableColumnsType } from "antd";
import React, { useEffect, useState } from "react";
import { FlattenedInvoice, PartialInvoicesTableProps } from "@/types/invoices";
import { useAuth } from "@/contexts/AuthContext";
import dayjs from "dayjs";
import Link from "next/link";
import { MdOutlinePictureAsPdf } from "react-icons/md";

export const PartialInvoicesListTable: React.FC<PartialInvoicesTableProps> = ({
  invoices,
  loading,
}) => {
  const { user } = useAuth();
  const [currencyCode, setCurrencyCode] = useState<string>("USD");
  const [flattenedData, setFlattenedData] = useState<FlattenedInvoice[]>([]);

  useEffect(() => {
    const flatData: FlattenedInvoice[] = invoices.flatMap((invoice) => {
      if (!invoice.sub_invoice || invoice.sub_invoice.length == 0) {
        return [{ ...invoice, sub_item: null }] as FlattenedInvoice[];
      }
      return invoice.sub_invoice.map((sub) => ({
        ...invoice,
        sub_item: sub,
      })) as FlattenedInvoice[];
    });
    setFlattenedData(flatData);
  }, [invoices]);

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
          headers,
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

  const getInvoiceSuffix = (index: number): string => {
    if (index == 0) return "";
    const suffix = String.fromCharCode(65 + index - 1);
    return suffix;
  };

  const columns: TableColumnsType<FlattenedInvoice> = [
    {
      title: "#",
      render: (_: FlattenedInvoice, __: FlattenedInvoice, index: number) =>
        index + 1,
      align: "center",
    },
    {
      title: "Partial Type",
      render: (__, _, index: number) => {
        if (index == 0) {
          return "Main Invoice";
        }
        const nth = (n: number) => {
          const s = ["th", "st", "nd", "rd"],
            v = n % 100;
          return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };
        return nth(index);
      },
    },
    {
      title: "Invoice ID",
      dataIndex: "invoice_id",
      render: (text: string, record: FlattenedInvoice, index: number) => {
        const suffix = getInvoiceSuffix(index);
        return suffix ? `${text}${suffix}` : text;
      },
    },
    {
      title: "Customer",
      dataIndex: ["customer", "name"],
      render: (name?: string) => name || "-",
    },
    {
      title: "Payment Date",
      render: (record: FlattenedInvoice) =>
        record.sub_item?.date
          ? dayjs(record.sub_item.date).format("DD MMM YYYY")
          : "-",
    },
    {
      title: "Paid Amount",
      render: (record: FlattenedInvoice) =>
        record.sub_item?.paid_amount && record.sub_item.paid_amount > 0
          ? `${record.sub_item.paid_amount.toFixed(2)} ${currencyCode}`
          : "-",
    },
    {
      title: "Due Amount",
      render: (record: FlattenedInvoice) =>
        record.sub_item?.due_amount && record.sub_item.due_amount > 0
          ? `${record.sub_item.due_amount.toFixed(2)} ${currencyCode}`
          : "-",
    },
    {
      title: "Status",
      render: (record: FlattenedInvoice) => {
        const dueAmount = record.sub_item?.due_amount || 0;
        const status = dueAmount > 0 ? "Due" : "Paid";

        return (
          <span
            className={`font-semibold ${
              status == "Paid" ? "text-green-600" : "text-red-500"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      title: "Action",
      render: (record: FlattenedInvoice) => {
        return (
          <div className="flex justify-center">
            <Link
              className="text-white hover:text-white text-[16px] bg-yellow-500 hover:bg-yellow-600 h-6 w-6 rounded transition-colors duration-300 flex justify-center items-center"
              href={`/invoices/partial-invoices-report/${record.id}`}
              title="Invoice"
            >
              <MdOutlinePictureAsPdf />
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
      <div className="flex sm:justify-between justify-end items-center mb-5">
        <div className="sm:flex items-center hidden">
          <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
          <h2 className="text-[13px] font-[500]">Partial Invoices Info</h2>
        </div>
        <Link
          className="text-[12px] font-[500] py-[7px] px-3 rounded cursor-pointer transition-all duration-300 text-white bg-[#307EF3] hover:bg-[#478cf3] focus:bg-[#307EF3]"
          href={`/invoices/partial-invoices-report/${invoices[0]?.id}`}
        >
          Report
        </Link>
      </div>
      <Table
        scroll={{ x: "max-content" }}
        columns={columns}
        dataSource={flattenedData}
        loading={loading}
        bordered
        rowKey={(record) => `${record.id}-${record.sub_item?.id || "main"}`}
      />
    </main>
  );
};
