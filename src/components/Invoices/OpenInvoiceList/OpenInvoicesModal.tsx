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
  const [payNow, setPayNow] = useState(0);
  const [due, setDue] = useState("");

  useEffect(() => {
    if (currentInvoice) {
      setInvoiceId(currentInvoice.invoice_id);
      setCustomerName(currentInvoice.customer.name);
      setCustomerId(currentInvoice.customer.customer_id);
      setCustomerEmail(currentInvoice.customer.email);
      setCustomerPhone(currentInvoice.customer.contact);
      setTotal(currentInvoice.total.toFixed(2));
      setPaid(currentInvoice.paid_amount.toFixed(2));
      setPayNow(0);
      const calculatedDue = (
        currentInvoice.total - currentInvoice.paid_amount
      ).toFixed(2);
      setDue(calculatedDue);
    }
  }, [currentInvoice]);

  const handlePayNowChange = (value: string) => {
    const newPayNow = Number(value) || 0;
    setPayNow(newPayNow);
    const newDue = (
      Number(total) -
      (Number(paid) + Number(value || 0))
    ).toFixed(2);
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

      const updatedPaidAmount = Number(paid) + payNow;
      const updatedDueAmount = Number(total) - updatedPaidAmount;

      let existingSubInvoice = [];
      if (currentInvoice.sub_invoice) {
        try {
          if (typeof currentInvoice.sub_invoice == "string") {
            existingSubInvoice = JSON.parse(currentInvoice.sub_invoice);
          } else {
            existingSubInvoice = Array.isArray(currentInvoice.sub_invoice)
              ? currentInvoice.sub_invoice
              : [currentInvoice.sub_invoice];
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

      const updatedInvoice = {
        ...currentInvoice,
        paid_amount: updatedPaidAmount,
        due_amount: updatedDueAmount,
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
    <Modal open={isOpen} onOk={handleSubmit} onCancel={onClose} okText="Pay">
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
            className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
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
            className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
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
            className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
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
            className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
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
            className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
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
            className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
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
            className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            min={0}
            id="due"
            value={due}
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
            max={Number(total) - Number(paid)}
            id="paid"
            value={payNow}
            onChange={(e) => handlePayNowChange(e.target.value)}
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
