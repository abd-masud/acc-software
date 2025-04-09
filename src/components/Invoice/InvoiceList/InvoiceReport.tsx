"use client";

import { useAuth } from "@/contexts/AuthContext";
import { CustomersReportButtonProps } from "@/types/customers";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../../../public/images/logo.png";
import { useEffect, useState } from "react";

export const InvoiceReportButton: React.FC<CustomersReportButtonProps> = ({
  customers,
}) => {
  const { user } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string>("");

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

    getLogoUrl();
  }, []);

  const handleGenerateReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const currentDate = new Date();

    const formattedDate = currentDate.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Header Layout
    const logoWidth = 25;
    const logoHeight = 25;
    const centerStartX = pageWidth / 2;

    // Add logo (either user's logo or default logo)
    if (user?.logo) {
      doc.addImage(user.logo, "JPEG", margin, 15, logoWidth, logoHeight);
    } else if (logoUrl) {
      doc.addImage(logoUrl, "PNG", margin, 15, logoWidth, logoHeight);
    } else {
      // Fallback placeholder
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, 15, logoWidth, logoHeight, "F");
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.text("COMPANY LOGO", margin + logoWidth / 2, 15 + logoHeight / 2, {
        align: "center",
        baseline: "middle",
      });
    }

    // Center-aligned company information (all caps)
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

    // Report title (centered)
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("CUSTOMER REPORT", centerStartX, 50, { align: "center" });

    // Date and time (right-aligned)
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

    // Prepare data for the table
    const tableData = customers.map((customer, index) => [
      index + 1,
      customer.name,
      customer.delivery,
      customer.email,
      customer.contact,
      customer.remarks || "N/A",
    ]);

    // Generate table
    autoTable(doc, {
      startY: 65,
      head: [["#", "Name", "Delivery Address", "Email", "Contact", "Remarks"]],
      body: tableData,
      margin: { horizontal: margin },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        halign: "left",
      },
      headStyles: {
        fillColor: [48, 126, 243],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 40 },
        4: { cellWidth: 30 },
        5: { cellWidth: "auto" },
      },
      theme: "grid",
    });

    // Footer
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

    // Open PDF in new tab for preview
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");

    // Clean up the URL object after use
    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
    }, 100);
  };

  return (
    <button
      className="text-[12px] font-[500] py-1 px-3 rounded cursor-pointer transition-all duration-300 text-white bg-[#307EF3] hover:bg-[#478cf3] focus:bg-[#307EF3]"
      onClick={handleGenerateReport}
    >
      Report
    </button>
  );
};
