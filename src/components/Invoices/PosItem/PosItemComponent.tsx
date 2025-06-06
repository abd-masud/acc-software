"use client";

import { useEffect, useRef, useState } from "react";
import { InvoiceData, InvoicesItemProps } from "@/types/invoices";
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

  const generateQRData = () => {
    if (!invoiceData) return "";
    return [
      `Invoice ID: ${invoiceData.invoice_id}`,
      `Contact: ${invoiceData.customer.contact}`,
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
                  font-size: 12px;
                  width: 58mm;
                  margin: 0;
                  padding: 0;
                }
                .receipt-container {
                  width: 100%;
                  padding: 2mm;
                }
                .logo-container img {
                  width: auto;
                  height: auto;
                  max-width: 100%;
                  max-height: 50px;
                  object-fit: contain;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                .border-top { border-top: 1px dashed #000; }
                .border-bottom { border-bottom: 1px dashed #000; }
                .my-1 { margin-top: 0.25rem; margin-bottom: 0.25rem; }
                .items-header, .items-row {
                  display: flex;
                  justify-content: space-between;
                }
                .items-header span, .items-row span {
                  flex: 1;
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
              }
            </style>
          </head>
          <body>
            ${receiptRef.current.innerHTML}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 100);
              };
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
      <div className="flex justify-end px-10 pt-5">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Print Receipt
        </button>
      </div>

      {/* Receipt container with fixed 58mm width */}
      <div className="flex justify-center px-4 mx-auto pb-10">
        <div
          ref={receiptRef}
          className="receipt-container bg-white p-2 shadow-lg border"
          style={{ width: "58mm", maxWidth: "58mm" }}
        >
          <style jsx>{`
            .receipt-container {
              font-family: "Courier New", monospace;
              font-size: 12px;
              width: 58mm;
              max-width: 58mm;
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
                className="grayscale h-14 w-auto"
              />
            </div>

            <div className="font-bold text-sm">
              {user?.company || "Copa Business"}
            </div>
            <div className="text-xs">{user?.address || "-"}</div>
            <div className="text-xs">Tel: {user?.contact || "-"}</div>
          </div>

          <div className="dashed-line"></div>

          <div className="text-center my-1">
            <div className="font-bold text-sm">INVOICE</div>
            <div className="text-xs">Inv ID: {invoiceData?.invoice_id}</div>
            <div className="text-xs">Date: {formatDate(invoiceData.date)}</div>
          </div>

          <div className="dashed-line"></div>

          <div className="my-1 text-xs">
            <div className="font-bold">Customer:</div>
            <div>{invoiceData?.customer?.name}</div>
            <div>{invoiceData?.customer?.email}</div>
            <div>{invoiceData?.customer?.contact}</div>
          </div>

          <div className="dashed-line"></div>

          <div className="my-1 text-xs">
            <div className="items-header font-bold">
              <span>Item</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Total</span>
            </div>
            {invoiceData?.items?.map((item, index) => (
              <div className="items-row" key={index}>
                <span className="truncate">{item.product}</span>
                <span className="truncate">
                  {item.quantity} {item.unit?.charAt(0)}
                </span>
                <span>{item.unit_price}</span>
                <span>{item.amount}</span>
              </div>
            ))}
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
              size={100}
              level="L"
              className="mx-auto"
            />
            <div className="text-xs mt-1">Thank you for your business!</div>
            <div className="text-xs">{user?.email || ""}</div>
          </div>
          <div className="text-center my-1 mt-2">
            <p>Powered by Copa Business</p>
          </div>
        </div>
      </div>
    </main>
  );
};
