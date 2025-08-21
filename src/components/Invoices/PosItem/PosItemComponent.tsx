"use client";

import { useEffect, useRef, useState } from "react";
import { InvoiceData, InvoiceItem, InvoicesItemProps } from "@/types/invoices";
import { useAuth } from "@/contexts/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import { useAccUserRedirect } from "@/hooks/useAccUser";
import Image from "next/image";
import logo from "../../../../public/images/logo.webp";
import { Breadcrumb } from "./Breadcrumb";

export const PosItemComponent = ({ InvoiceId }: InvoicesItemProps) => {
  const { user } = useAuth();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [receiptWidth, setReceiptWidth] = useState<"58mm" | "80mm">("58mm");
  const receiptRef = useRef<HTMLDivElement>(null);
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
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
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

  const formatDate = (dateString: string | number | Date): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const tryParse = (value: string) => {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  const generateQRData = () => {
    if (!invoiceData) return "";
    let contactNumber = "N/A";
    if (typeof invoiceData.customer === "string") {
      const parsedCustomer = tryParse(invoiceData.customer);
      contactNumber =
        typeof parsedCustomer === "object" && parsedCustomer !== null
          ? parsedCustomer.contact || "N/A"
          : parsedCustomer;
    } else {
      contactNumber = invoiceData.customer.contact;
    }
    return [
      `Invoice ID: ${invoiceData.invoice_id}`,
      `Contact: ${contactNumber}`,
      `Inv Date: ${formatDate(invoiceData.date)}`,
    ].join("\n");
  };

  const handlePrint = () => {
    if (!receiptRef.current) return;
    const printWindow = window.open("", "");
    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            @media print {
              body { 
                font-family: 'Courier New', monospace;
                font-size: ${receiptWidth === "58mm" ? "12px" : "14px"};
                width: ${receiptWidth};
                margin: 0;
                padding: 0;
                line-height: 1.2;
                -webkit-print-color-adjust: exact;
              }
              * {
                box-sizing: border-box;
              }
              .receipt-container {
                width: 100%;
                padding: 1mm 2mm;
              }
              .logo-container img {
                width: auto;
                height: auto;
                max-width: 100%;
                max-height: ${receiptWidth === "58mm" ? "40px" : "50px"};
                object-fit: contain;
                filter: contrast(120%);
              }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .font-bold { 
                font-weight: bold;
                font-size: ${receiptWidth === "58mm" ? "13px" : "15px"};
              }
              .border-top { border-top: 1px solid #000 !important; }
              .border-bottom { border-bottom: 1px solid #000 !important; }
              .my-1 { margin: 2px 0; }
              .items-header, .items-row {
                display: flex;
                justify-content: space-between;
                margin: 3px 0;
              }
              .items-header span, .items-row span {
                flex: 1;
                padding: 0 1px;
              }
              .dashed-line {
                border-top: 1px dashed #000;
                margin: 3px 0;
              }
              .truncate {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              .qrcode {
                width: ${receiptWidth === "58mm" ? "90px" : "110px"};
                height: auto;
                margin: 2px auto;
                filter: contrast(130%);
              }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${receiptRef.current.innerHTML}
          <script>
            setTimeout(function() {
              window.print();
              window.close();
            }, 200);
          </script>
        </body>
      </html>
    `);
      printWindow.document.close();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="ml-4 text-gray-700">Loading receipt...</span>
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
      </div>
    );
  }

  return (
    <main className="bg-[#F2F4F7]">
      <Breadcrumb />
      <div className="flex justify-end items-center gap-4 px-10 pt-5">
        <select
          value={receiptWidth}
          onChange={(e) => setReceiptWidth(e.target.value as "58mm" | "80mm")}
          className="px-3 py-2 border rounded text-sm"
        >
          <option value="58mm">58mm Receipt</option>
          <option value="80mm">80mm Receipt</option>
        </select>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Print Receipt
        </button>
      </div>

      {/* Receipt container with dynamic width */}
      <div className="flex justify-center px-4 mx-auto pb-10">
        <div
          ref={receiptRef}
          className="receipt-container bg-white p-2 shadow-lg border"
          style={{
            width: receiptWidth,
            maxWidth: receiptWidth,
            fontSize: receiptWidth === "58mm" ? "12px" : "14px",
          }}
        >
          <style jsx>{`
            .receipt-container {
              font-family: "Courier New", monospace;
            }
            .text-center {
              text-align: center;
            }
            .text-right {
              text-align: right;
            }
            .font-bold {
              font-weight: bold;
            }
            .border-top {
              border-top: 1px dashed #000;
            }
            .border-bottom {
              border-bottom: 1px dashed #000;
            }
            .my-1 {
              margin-top: 0.25rem;
              margin-bottom: 0.25rem;
            }
            .items-header,
            .items-row {
              display: flex;
              justify-content: space-between;
            }
            .dashed-line {
              border-top: 1px dashed #000;
              margin: 0.5rem 0;
            }
            .truncate {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          <div className="text-center my-1">
            <div
              className="logo-container mx-auto"
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                marginBottom: "10px",
              }}
            >
              <Image
                src={user?.logo || logo}
                width={200}
                height={200}
                alt="Logo"
                className="grayscale"
                style={{
                  height: receiptWidth === "58mm" ? "40px" : "50px",
                  width: "auto",
                  filter: "contrast(120%)",
                }}
              />
            </div>

            <div
              className="font-bold"
              style={{ fontSize: receiptWidth === "58mm" ? "14px" : "16px" }}
            >
              {user?.company || "Copa Business"}
            </div>
            <div>{user?.address || "-"}</div>
            <div>Tel: {user?.contact || "-"}</div>
          </div>

          <div className="dashed-line"></div>

          <div className="text-center my-1">
            <div
              className="font-bold"
              style={{ fontSize: receiptWidth === "58mm" ? "14px" : "16px" }}
            >
              INVOICE
            </div>
            <div>Inv ID: {invoiceData?.invoice_id}</div>
            <div>Date: {formatDate(invoiceData.date)}</div>
          </div>

          <div className="dashed-line"></div>

          <div className="my-1 text-xs">
            <div className="items-header font-bold">
              <span>Item</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Total</span>
            </div>

            {(() => {
              try {
                const items = invoiceData?.items
                  ? Array.isArray(invoiceData.items)
                    ? invoiceData.items
                    : JSON.parse(invoiceData.items)
                  : [];

                return items.length > 0 ? (
                  items.map((item: InvoiceItem, index: number) => (
                    <div className="items-row" key={index}>
                      <span className="truncate">{item.product}</span>
                      <span className="truncate">
                        {item.quantity} {item.unit?.charAt(0)}
                      </span>
                      <span>
                        {item.unit_price} {currencyCode}
                      </span>
                      <span>
                        {item.amount} {currencyCode}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-2">
                    No items available
                  </div>
                );
              } catch (error) {
                console.error("Error loading items:", error);
                return (
                  <div className="text-center text-red-500 py-2">
                    Error loading items
                  </div>
                );
              }
            })()}
          </div>

          <div className="dashed-line"></div>

          <div className="text-right my-1 text-xs">
            <div>
              Subtotal: {invoiceData?.subtotal || "0"} {currencyCode}
            </div>
            {Number(invoiceData?.discount) > 0 && (
              <div>
                Discount: {invoiceData.discount} {currencyCode}
              </div>
            )}
            {Number(invoiceData?.tax) > 0 && (
              <div>
                Tax: {invoiceData.tax} {currencyCode}
              </div>
            )}

            <div className="dashed-line"></div>

            <div className="font-bold pt-1">
              TOTAL: {invoiceData?.total || "0"} {currencyCode}
            </div>
          </div>

          <div className="dashed-line"></div>

          <div className="my-1 text-xs">
            <div className="font-bold">Payment:</div>
            <div>
              Method:{" "}
              {invoiceData?.pay_type?.charAt(0).toUpperCase() +
                invoiceData?.pay_type?.slice(1) || "Cash"}
            </div>
            <div>
              Paid: {invoiceData?.paid_amount || "0"} {currencyCode}
            </div>
            {Number(invoiceData?.due_amount) > 0 && (
              <div>
                Due: {invoiceData.due_amount} {currencyCode}
              </div>
            )}
          </div>

          <div className="dashed-line"></div>

          <div className="text-center my-1">
            <QRCodeSVG
              value={generateQRData()}
              size={receiptWidth === "58mm" ? 90 : 110}
              level="L"
              includeMargin={true}
              className="mx-auto"
              style={{ filter: "contrast(130%)" }}
            />
            <div className="mt-1">Thank you for your business!</div>
            <div>{user?.email || ""}</div>
          </div>
          <div className="text-center my-1 mt-2">
            <p>Powered by Copa Business</p>
          </div>
        </div>
      </div>
    </main>
  );
};
