"use client";

import { useEffect, useRef, useState } from "react";
import { InvoiceData, InvoicesItemProps } from "@/types/invoices";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import logo from "../../../../public/images/logo.png";
import { Breadcrumb } from "./Breadcrumb";
import { QRCodeSVG } from "qrcode.react";
import { useAccUserRedirect } from "@/hooks/useAccUser";

export const InvoicesItemComponent = ({ InvoiceId }: InvoicesItemProps) => {
  const { user } = useAuth();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [terms, setTerms] = useState<string[]>([]);
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  useAccUserRedirect();

  useEffect(() => {
    if (!InvoiceId || !user?.id) return;

    const fetchInvoiceData = async () => {
      try {
        const response = await fetch(
          `/api/invoices/single-invoice?id=${InvoiceId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch invoice data");
        }

        const data = await response.json();
        setInvoiceData(data.data);
      } catch (err) {
        console.error("Invoice error:", err);
        setError((err as Error).message);
      }
    };

    const fetchTerms = async () => {
      try {
        const response = await fetch(`/api/terms?user_id=${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const terms = Array.isArray(data.data?.terms) ? data.data.terms : [];
          setTerms(terms);
        }
      } catch (err) {
        console.error("Terms error:", err);
        setError((err as Error).message);
      }
    };

    const initialize = async () => {
      setLoading(true);
      setError(null);

      await fetchInvoiceData();
      await fetchTerms();

      setLoading(false);
    };

    initialize();
  }, [InvoiceId, user?.id]);

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

  const paymentType = invoiceData?.pay_type || "";

  function formatDate(dateString: string | number | Date): string {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-GB", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  }

  // Generate QR code data string
  const generateQRData = () => {
    if (!invoiceData) return "";
    return [
      `Invoice ID: ${invoiceData.invoice_id}`,
      `Contact: ${invoiceData.customer.contact}`,
      `Inv Date: ${formatDate(invoiceData.date)}`,
    ].join("\n");
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    // Dynamically import html2pdf only on client side
    const html2pdf = (await import("html2pdf.js")).default;

    await document.fonts.ready;

    const opt = {
      margin: 0,
      filename: `invoice_${InvoiceId}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 1.5 },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    } as const;

    html2pdf().set(opt).from(invoiceRef.current).save();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="ml-4 text-gray-700">Loading invoice...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="text-center py-8">
        <p>No invoice data found</p>
        <p className="text-sm text-gray-500 mt-2">
          Please check if the invoice ID is correct
        </p>
      </div>
    );
  }

  return (
    <main className="bg-[#F2F4F7]">
      <Breadcrumb />
      <div className="flex justify-end px-10 pt-5">
        <button onClick={handleDownloadPDF}>Download PDF</button>
      </div>
      <div className="py-10">
        <div ref={invoiceRef}>
          <div className="max-w-4xl mx-auto bg-white border shadow-lg">
            {/* Header with logo and company info */}
            <div className="bg-[#0D213F] h-10 w-full"></div>
            <div className="grid grid-cols-2 gap-6 px-16 pt-5">
              <h1 className="text-[60px] font-bold text-[#010101]">INVOICE</h1>
              <div className="flex items-center justify-end gap-3">
                <div>
                  <Image
                    src={user?.logo || logo}
                    alt="Company Logo"
                    width={100}
                    height={100}
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <div>
                  <p className="font-bold truncate">
                    {user?.company || "Copa Business"}
                  </p>
                  <p className="text-xs">Company</p>
                </div>
              </div>
            </div>

            {/* Invoice To section */}
            <div className="grid grid-cols-2 mb-8 px-16 p-4 bg-gray-50">
              <div className="leading-normal">
                <h3 className="text-[16px] font-bold text-gray-800 mb-2">
                  Invoice To:
                </h3>
                <p className="text-gray-800 text-[12px]">
                  <span className="font-bold">Name:</span>{" "}
                  {invoiceData.customer?.name}
                </p>
                <p className="text-gray-800 text-[12px]">
                  <span className="font-bold">Address:</span>{" "}
                  {invoiceData.customer?.delivery}
                </p>
                <p className="text-gray-800 text-[12px]">
                  <span className="font-bold">Phone:</span>{" "}
                  {invoiceData.customer?.contact}
                </p>
                <p className="text-gray-800 text-[12px]">
                  <span className="font-bold">Email:</span>{" "}
                  {invoiceData.customer?.email}
                </p>
              </div>
              <div className="flex items-end justify-end gap-4">
                <div>
                  <QRCodeSVG value={generateQRData()} size={50} level="L" />
                </div>
                <div>
                  <div className="grid grid-cols-2">
                    <div>
                      <p className="font-bold text-[12px]">Invoice ID:</p>
                      <p className="font-bold text-[12px]">Date:</p>
                      <p className="font-bold text-[12px]">Due Date:</p>
                    </div>
                    <div>
                      <p className="text-gray-800 text-[12px]">
                        {invoiceData.invoice_id}
                      </p>
                      <p className="text-gray-800 text-[12px]">
                        {" "}
                        {formatDate(invoiceData.date)}
                      </p>
                      <p className="text-gray-800 text-[12px]">
                        {invoiceData.due_date && invoiceData.due_date !== "N/A"
                          ? formatDate(invoiceData.due_date)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8 px-16 overflow-x-auto">
              <h3 className="text-[16px] font-bold text-gray-800 mb-2">
                Service Details:
              </h3>
              <table className="min-w-full divide-y divide-gray-200 border">
                <thead className="bg-[#F7C650]">
                  <tr className="divide-x divide-yellow-500">
                    <th className="px-6 py-3 text-left text-[12px] font-bold uppercase">
                      SI No
                    </th>
                    <th className="px-6 py-3 text-left text-[12px] font-bold uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-[12px] font-bold uppercase">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-[12px] font-bold uppercase">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-[12px] font-bold uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoiceData.items?.map((item, index) => (
                    <tr className="divide-x divide-gray-200" key={index}>
                      <td className="px-6 py-2 whitespace-nowrap text-[12px] font-bold text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-[12px] text-gray-900">
                        {item.product}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-[12px] text-gray-900">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-[12px] text-gray-900">
                        {item.unit_price} {currencyCode}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-[12px] text-gray-900">
                        {item.amount} {currencyCode}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 px-16 gap-10">
              <div className="flex flex-col justify-end">
                <h3 className="text-[16px] font-bold text-gray-800 mb-2">
                  Terms & Conditions:
                </h3>
                <div className="text-[12px] leading-snug">
                  {Array.isArray(terms) && terms.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {terms.map((term, index) => (
                        <li key={index}>{term}</li>
                      ))}
                    </ul>
                  ) : (
                    "N/A"
                  )}
                </div>
              </div>
              <div>
                <div className="text-[12px] flex justify-between mb-2">
                  <span className="font-medium">Subtotal:</span>
                  <span>
                    {invoiceData.subtotal} {currencyCode}
                  </span>
                </div>
                <div className="text-[12px] flex justify-between mb-2">
                  <span className="font-medium">Discount:</span>
                  <span>
                    {invoiceData.discount} {currencyCode}
                  </span>
                </div>
                <div className="text-[12px] flex justify-between mb-2">
                  <span className="font-medium">Tax:</span>
                  <span>
                    {invoiceData.tax} {currencyCode}
                  </span>
                </div>
                <div className="text-[12px] flex justify-between mb-2 border-t pt-2">
                  <span className="font-bold">Total:</span>
                  <span className="font-medium">
                    {invoiceData.total} {currencyCode}
                  </span>
                </div>
                <div className="text-[12px] flex justify-between mb-2">
                  <span className="font-medium">Paid Amount:</span>
                  <span>
                    {invoiceData.paid_amount} {currencyCode}
                  </span>
                </div>
                <div className="text-[12px] flex justify-between border-t pt-2">
                  <span className="font-medium text-red-500">Due Amount:</span>
                  <span className="text-red-500">
                    {invoiceData.due_amount} {currencyCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-gray-50 mt-8 p-4 px-16 grid grid-cols-2 gap-10">
              <div>
                <div className="">
                  <h3 className="text-[16px] font-bold text-gray-800 mb-2">
                    Notes:
                  </h3>
                  <p className="text-[12px]">
                    {invoiceData.notes ? invoiceData.notes : "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-gray-800 mb-2">
                  Payment Method:
                </h3>
                <div className="flex items-center text-[12px] gap-5">
                  <div className="flex items-center gap-1">
                    <div
                      className={`h-3 w-3 border border-black rounded-sm flex items-center justify-center ${
                        paymentType == "cash" ? "bg-black" : ""
                      }`}
                    >
                      {paymentType == "cash" && (
                        <span className="text-white text-[10px]">✓</span>
                      )}
                    </div>
                    <span>Cash</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div
                      className={`h-3 w-3 border border-black rounded-sm flex items-center justify-center ${
                        paymentType == "wallet" ? "bg-black" : ""
                      }`}
                    >
                      {paymentType == "wallet" && (
                        <span className="text-white text-[10px]">✓</span>
                      )}
                    </div>
                    <span>Wallet</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div
                      className={`h-3 w-3 border border-black rounded-sm flex items-center justify-center ${
                        paymentType == "bank" ? "bg-black" : ""
                      }`}
                    >
                      {paymentType == "bank" && (
                        <span className="text-white text-[10px]">✓</span>
                      )}
                    </div>
                    <span>Bank</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div
                      className={`h-3 w-3 border border-black rounded-sm flex items-center justify-center ${
                        paymentType == "others" ? "bg-black" : ""
                      }`}
                    >
                      {paymentType == "others" && (
                        <span className="text-white text-[10px]">✓</span>
                      )}
                    </div>
                    <span>Others</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-16 py-5 mt-5 mb-5 border-t border-gray-200 grid grid-cols-3">
              <div className="col-span-2">
                <h3 className="text-[16px] font-bold text-gray-800 mb-2">
                  Contact Us:
                </h3>
                <p className="text-gray-800 text-[12px]">
                  <span className="font-bold">Email Address:</span>{" "}
                  {user?.email || "-"}
                </p>
                <p className="text-gray-800 text-[12px]">
                  <span className="font-bold">Phone Number:</span>{" "}
                  {user?.contact || "-"}
                </p>
                <p className="text-gray-800 text-[12px]">
                  <span className="font-bold">Address:</span>{" "}
                  {user?.address || "-"}
                </p>
              </div>
              <div className="flex flex-col justify-end items-end">
                <div className="flex flex-col justify-center items-center">
                  <span className="h-[1px] w-52 bg-black mb-1"></span>
                  <p className="text-[12px]">Authorized Sign</p>
                </div>
              </div>
            </div>
            <div className="bg-[#0D213F] h-6 w-full"></div>
          </div>
        </div>
      </div>
    </main>
  );
};
