"use client";

import { DatePicker, Modal, message } from "antd";
import { useEffect, useState } from "react";
import { EditInvoiceModalProps } from "@/types/invoices";
import dayjs from "dayjs";

export const OpenInvoicesModal: React.FC<EditInvoiceModalProps> = ({
  isOpen,
  onClose,
  currentInvoice,
  onSave,
}) => {
  const [invoiceId, setInvoiceId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [total, setTotal] = useState("");
  const [paid, setPaid] = useState("");
  const [payNow, setPayNow] = useState("");
  const [due, setDue] = useState(0);

  useEffect(() => {
    if (currentInvoice) {
      setInvoiceId(currentInvoice.invoice_id);

      let invoiceData;
      try {
        invoiceData =
          typeof currentInvoice.customer == "string"
            ? JSON.parse(currentInvoice.customer)
            : currentInvoice.customer;
      } catch (e) {
        console.error("Error parsing invoice data", e);
        invoiceData = {};
      }

      setCustomerName(invoiceData.name || "");
      setCustomerId(invoiceData.customer_id || "");
      setCustomerEmail(invoiceData.email || "");
      setCustomerPhone(invoiceData.contact || "");

      setTotal(currentInvoice.total);
      setPaid(currentInvoice.paid_amount);
      setPayNow("");
      const calculatedDue =
        Number(currentInvoice.total) - Number(currentInvoice.paid_amount);
      setDue(Number(calculatedDue.toFixed(2)));
    }
  }, [currentInvoice]);

  const handlePayNowChange = (value: string) => {
    const newPayNow = value == "" ? "" : String(Number(value));
    setPayNow(newPayNow);
    const newDue =
      value == ""
        ? Number(total) - Number(paid)
        : Number(total) - (Number(paid) + Number(value));
    setDue(newDue);
  };

  const dateFormat = "DD MMMM YYYY";

  const [invoiceOptions, setInvoiceOptions] = useState({
    date: dayjs().format("YYYY-MM-DD"),
  });

  const handleDateChange = (value: dayjs.Dayjs | null, field: "date") => {
    if (value) {
      setInvoiceOptions({
        ...invoiceOptions,
        [field]: value.format("YYYY-MM-DD"),
      });
    }
  };

  const handleSubmit = async () => {
    try {
      if (!currentInvoice) return;

      const payNowAmount = Number(payNow);
      const remainingDue = Number(total) - Number(paid);

      if (payNowAmount <= 0) {
        message.error("Payment amount must be greater than 0");
        return;
      }

      if (payNowAmount > remainingDue) {
        message.error("Payment amount cannot exceed the due amount");
        return;
      }

      const updatedPaidAmount = Number(paid) + Number(payNow);
      const updatedDueAmount = Number(total) - Number(updatedPaidAmount);

      let existingSubInvoice = [];
      if (currentInvoice.sub_invoice) {
        try {
          existingSubInvoice =
            typeof currentInvoice.sub_invoice === "string"
              ? JSON.parse(currentInvoice.sub_invoice)
              : currentInvoice.sub_invoice;

          if (!Array.isArray(existingSubInvoice)) {
            existingSubInvoice = [existingSubInvoice];
          }
        } catch (e) {
          console.error("Error parsing sub_invoice", e);
          existingSubInvoice = [];
        }
      }

      const newPaymentEntry = {
        paid_amount: payNow,
        due_amount: updatedDueAmount,
        date: invoiceOptions.date,
      };

      const updatedSubInvoice = [...existingSubInvoice, newPaymentEntry];

      let customerData = currentInvoice.customer;
      if (typeof customerData === "string") {
        try {
          customerData = JSON.parse(customerData);
        } catch (e) {
          console.error("Error parsing customer data", e);
        }
      }

      let itemsData = currentInvoice.items || [];
      if (typeof itemsData === "string") {
        try {
          itemsData = JSON.parse(itemsData);
        } catch (e) {
          console.error("Error parsing items data", e);
          itemsData = [];
        }
      }

      const updatedInvoice = {
        ...currentInvoice,
        customer: customerData,
        items: itemsData,
        paid_amount: updatedPaidAmount.toString(),
        due_amount: String(updatedDueAmount.toFixed(2)),
        sub_invoice: updatedSubInvoice,
      };

      await onSave(updatedInvoice);

      message.success("Invoice updated successfully");
      onClose();
    } catch (err) {
      console.error(err);
      message.error("Failed to update invoice");
    }
  };

  return (
    <Modal
      open={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      okText="Pay"
      okButtonProps={{
        disabled:
          Number(payNow) <= 0 || Number(payNow) > Number(total) - Number(paid),
      }}
    >
      <div className="flex items-center pb-3">
        <div className="h-2 w-2 bg-[#307EF3] rounded-full mr-2"></div>
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
            value={invoiceId}
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
            value={`${customerName}  (${customerId})`}
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
            value={customerEmail}
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
            value={customerPhone}
            readOnly
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 grid-cols-1 gap-3">
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="total">
            Total Amount
          </label>
          <input
            className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            id="total"
            value={total}
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="paid">
            Paid Amount
          </label>
          <input
            type="number"
            placeholder="Enter paid amount"
            className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            id="paid"
            value={paid}
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="due">
            Due Amount
          </label>
          <input
            type="number"
            placeholder="Enter due amount"
            className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            min={0}
            id="due"
            value={due.toFixed(2)}
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
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter amount"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            min={0}
            max={Number(total) - Number(paid)}
            id="paid"
            value={payNow}
            onChange={(e) => {
              const value = e.target.value;
              const maxAmount = Number(total) - Number(paid);
              if (value !== "" && Number(value) > maxAmount) {
                setPayNow(maxAmount.toString());
                setDue(0);
              } else {
                handlePayNowChange(value);
              }
            }}
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
            Invoice Date
          </label>
          <DatePicker
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            type="date"
            id="date"
            format={dateFormat}
            value={dayjs(invoiceOptions.date)}
            onChange={(value) => handleDateChange(value, "date")}
            required
          />
        </div>
      </div>
    </Modal>
  );
};
