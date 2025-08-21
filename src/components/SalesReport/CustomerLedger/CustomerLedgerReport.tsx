"use client";

import { useAuth } from "@/contexts/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../../../public/images/logo.webp";
import barcode from "../../../../public/images/barcode.webp";
import { useEffect, useState } from "react";
import { InvoicesReportButtonProps } from "@/types/invoices";

const getLogoDimensions = async (
  url: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.src = url;
  });
};

export const CustomerLedgerReportButton: React.FC<
  InvoicesReportButtonProps
> = ({ invoices }) => {
  const { user } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [barcodeUrl, setBarcodeUrl] = useState<string>("");

  useEffect(() => {
    const getLogoUrl = async () => {
      try {
        const response = await fetch(logo.src);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = () => {
          setLogoUrl(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error loading logo:", error);
      }
    };

    const getBarcodeUrl = async () => {
      try {
        const response = await fetch(barcode.src);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = () => {
          setBarcodeUrl(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error loading barcode:", error);
      }
    };

    getLogoUrl();
    getBarcodeUrl();
  }, []);

  const handleGenerateReport = async () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const currentDate = new Date();

    const formattedDate = currentDate.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Logo dimensions
    const logoHeight = 25;
    let logoWidth = 25; // Default fallback width

    // Barcode dimensions
    const barcodeWidth = 100;
    const barcodeHeight = 15;

    const centerStartX = pageWidth / 2;

    // Calculate logo width while maintaining aspect ratio
    if (user?.logo) {
      // If you know the original aspect ratio of user.logo, you can calculate it here
      // For example, if aspect ratio is 2:1: logoWidth = logoHeight * 2;
      // Otherwise, keep the default
    } else if (logoUrl) {
      try {
        const dimensions = await getLogoDimensions(logoUrl);
        const aspectRatio = dimensions.width / dimensions.height;
        logoWidth = logoHeight * aspectRatio;
      } catch (error) {
        console.error("Error getting logo dimensions:", error);
        // Fall back to default width
      }
    }

    // Add logo to PDF
    if (user?.logo) {
      doc.addImage(user.logo, "JPEG", margin, 15, logoWidth, logoHeight);
    } else if (logoUrl) {
      doc.addImage(logoUrl, "PNG", margin, 15, logoWidth, logoHeight);
    } else {
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, 15, logoWidth, logoHeight, "F");
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.text("COMPANY LOGO", margin + logoWidth / 2, 15 + logoHeight / 2, {
        align: "center",
        baseline: "middle",
      });
    }

    // Add barcode to PDF
    if (barcodeUrl) {
      doc.addImage(
        barcodeUrl,
        "GIF",
        pageWidth - margin - barcodeWidth,
        180,
        barcodeWidth,
        barcodeHeight
      );
    }

    // Company header information
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(user?.company?.toUpperCase() || "COMPANY NAME", centerStartX, 20, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(user?.address || "123 Business Street, City", centerStartX, 27, {
      align: "center",
    });

    doc.text(`Email: ${user?.email || "info@company.com"}`, centerStartX, 32, {
      align: "center",
    });

    doc.text(
      `Contact: ${user?.contact || "+1 (123) 456-7890"}`,
      centerStartX,
      37,
      {
        align: "center",
      }
    );

    // Report title
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("CUSTOMER LEDGER", centerStartX, 50, { align: "center" });

    // Date and time
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${formattedDate}`, margin + 11, 55, {
      align: "center",
    });
    doc.text(
      `Time: ${currentDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      pageWidth - margin,
      55,
      { align: "right" }
    );

    // Divider line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, 60, pageWidth - margin, 60);

    // Calculate totals
    const totals = {
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      payment: 0,
      due: 0,
    };

    invoices.forEach((invoice) => {
      totals.subtotal += Number(invoice.subtotal) || 0;
      totals.tax += Number(invoice.tax) || 0;
      totals.discount += Number(invoice.discount) || 0;
      totals.total += Number(invoice.total) || 0;
      totals.payment += Number(invoice.paid_amount) || 0;
      totals.due += Number(invoice.due_amount) || 0;
    });

    // Prepare table data
    const tableData = invoices.map((invoice, index) => {
      let customerInfo = "";
      if (typeof invoice.customer === "string") {
        customerInfo = invoice.customer;
      } else if (invoice.customer) {
        customerInfo = `${invoice.customer.name || ""}(${
          invoice.customer.customer_id || ""
        })`;
      }
      return [
        index + 1,
        invoice.invoice_id,
        `${new Date(invoice.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}`,
        customerInfo,
        invoice.items?.length || 0,
        invoice.subtotal,
        invoice.tax,
        invoice.discount,
        invoice.total,
        invoice.paid_amount,
        invoice.due_amount,
        Number(invoice.due_amount) == 0 ? "Paid" : "Due",
        invoice.notes,
      ];
    });

    const totalsRow = [
      "",
      "TOTAL",
      "",
      "",
      "",
      totals.subtotal,
      totals.tax,
      totals.discount,
      totals.total,
      totals.payment,
      totals.due,
      "",
      "",
    ];

    // Add table to PDF
    autoTable(doc, {
      startY: 65,
      head: [
        [
          "#",
          "Invoice ID",
          "Date",
          "Customer",
          "Items",
          "Subtotal",
          "Tax",
          "Discount",
          "Total",
          "Payment",
          "Due",
          "Status",
          "Remarks",
        ],
      ],
      body: [...tableData, totalsRow],
      margin: { horizontal: margin },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        halign: "left",
        fillColor: false,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fontSize: 9,
        fontStyle: "bold",
        fillColor: false,
        textColor: [0, 0, 0],
      },
      bodyStyles: {
        fillColor: false,
      },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: "auto" },
        2: { cellWidth: "auto" },
        3: { cellWidth: "auto" },
        4: { cellWidth: "auto" },
        5: { cellWidth: "auto" },
        6: { cellWidth: "auto" },
        7: { cellWidth: "auto" },
        8: { cellWidth: "auto" },
        9: { cellWidth: "auto" },
        10: { cellWidth: "auto" },
        11: { cellWidth: "auto" },
        12: { cellWidth: "auto" },
      },
      didParseCell: (data) => {
        data.cell.styles.lineWidth = 0.1;
        data.cell.styles.lineColor = [0, 0, 0];
        if (data.row.index == tableData.length) {
          data.cell.styles.fontStyle = "bold";
          if (data.row.index == tableData.length && data.column.index == 0) {
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.2);
          }
        }
      },
    });

    // Add signature lines
    const signatureY = (doc as any).lastAutoTable.finalY + 20;
    const signatureWidth = 40;
    const signatureSpacing = (pageWidth - margin * 2 - signatureWidth * 4) / 3;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    for (let i = 0; i < 4; i++) {
      const x = margin + i * (signatureWidth + signatureSpacing);

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.line(x, signatureY, x + signatureWidth, signatureY);

      doc.text(
        [
          "Prepared by",
          "Accountant Manager",
          "Audit Officer",
          "Propretor Signature",
        ][i],
        x + signatureWidth / 2,
        signatureY + 5,
        { align: "center" }
      );
    }

    // Add page numbers and footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - margin,
        doc.internal.pageSize.getHeight() - 10,
        { align: "right" }
      );
      doc.text(
        `© ${new Date().getFullYear()} ${user?.company || "Company Name"}`,
        margin,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    // Generate and open PDF
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");

    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
    }, 100);
  };

  return (
    <button
      className="text-[12px] font-[500] py-[7px] px-3 rounded cursor-pointer transition-all duration-300 text-white bg-[#307EF3] hover:bg-[#478cf3] focus:bg-[#307EF3]"
      onClick={handleGenerateReport}
    >
      Report
    </button>
  );
};
