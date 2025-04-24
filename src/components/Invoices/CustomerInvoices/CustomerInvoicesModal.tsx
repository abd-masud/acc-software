"use client";

import { Modal, message } from "antd";
import { useEffect, useState } from "react";
import { EditInvoiceModalProps } from "@/types/invoices";

export const InvoicesModal: React.FC<EditInvoiceModalProps> = ({
  isOpen,
  onClose,
  currentInvoice,
  onSave,
}) => {
  const [invoiceId, setInvoiceId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [delivery, setDelivery] = useState("");
  const [total, setTotal] = useState("");
  const [paid, setPaid] = useState("");
  const [due, setDue] = useState("");

  useEffect(() => {
    if (currentInvoice) {
      setInvoiceId(currentInvoice.invoice_id);
      setCustomerName(currentInvoice.customer.name);
      setDelivery(currentInvoice.customer.delivery);
      setTotal(currentInvoice.total.toFixed(2));
      setPaid(currentInvoice.paid_amount.toFixed(2));
      const calculatedDue = (
        currentInvoice.total - currentInvoice.paid_amount
      ).toFixed(2);
      setDue(calculatedDue);
    }
  }, [currentInvoice]);

  const handlePaidChange = (value: string) => {
    setPaid(value);
    const newDue = (Number(total) - Number(value)).toFixed(2);
    setDue(newDue);
  };

  const handleSubmit = async () => {
    try {
      if (!currentInvoice) return;

      const updatedInvoice = {
        ...currentInvoice,
        paid_amount: parseInt(paid),
        due_amount: parseInt(due),
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
    <Modal open={isOpen} onOk={handleSubmit} onCancel={onClose} okText="Save">
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
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            type="text"
            id="invoiceId"
            value={invoiceId}
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="name">
            Customer Name
          </label>
          <input
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            type="text"
            id="name"
            value={customerName}
            readOnly
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="text-[14px]" htmlFor="delivery">
          Delivery Address
        </label>
        <input
          className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
          type="text"
          id="delivery"
          value={delivery}
          readOnly
        />
      </div>

      <div className="grid md:grid-cols-3 grid-cols-1 gap-3">
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="total">
            Total Amount
          </label>
          <input
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
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
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            min={0}
            max={total}
            id="paid"
            value={paid}
            onChange={(e) => handlePaidChange(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="due">
            Due Amount
          </label>
          <input
            type="number"
            placeholder="Enter due amount"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            min={0}
            id="due"
            value={due}
            readOnly
          />
        </div>
      </div>
    </Modal>
  );
};
