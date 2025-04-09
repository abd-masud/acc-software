"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Customers } from "@/types/customers";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

type InvoiceData = {
  customer: Customers;
  items: InvoiceItem[];
  invoiceNumber: string;
  date: string;
  dueDate: string;
  subtotal: number;
  tax_rate: number;
  taxAmount: number;
  discount: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue";
  user_id?: number;
};

export const CreateInvoiceForm = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [
    customers,
    //  setCustomers
  ] = useState<Customers[]>([]); // Initialize as empty array
  const [
    customerLoading,
    // setCustomerLoading
  ] = useState(true);
  const [customerDetails, setCustomerDetails] = useState<Customers>({
    key: "",
    id: 0,
    name: "",
    delivery: "",
    email: "",
    contact: "",
    remarks: "",
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    {
      id: uuidv4(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    },
  ]);

  const [invoiceOptions, setInvoiceOptions] = useState({
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    tax_rate: 10,
    discount: 0,
    status: "draft" as const,
  });

  // const fetchCustomers = async () => {
  //   try {
  //     const res = await fetch("/api/customers");
  //     if (res.ok) {
  //       const data = await res.json();
  //       // Ensure data is an array before setting it
  //       setCustomers(Array.isArray(data) ? data : []);
  //     } else {
  //       // Handle error case by setting empty array
  //       setCustomers([]);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch customers:", error);
  //     setCustomers([]);
  //   } finally {
  //     setCustomerLoading(false);
  //   }
  // };

  // Calculate invoice totals
  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );
    const taxAmount = subtotal * (invoiceOptions.tax_rate / 100);
    const total = subtotal + taxAmount - invoiceOptions.discount;

    return { subtotal, taxAmount, total };
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  // Generate invoice number on component mount
  useEffect(() => {
    const generateInvoiceNumber = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      return `INV-${year}${month}${day}-${randomNum}`;
    };

    setInvoiceNumber(generateInvoiceNumber());
  }, []);

  const handleCustomerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCustomerDetails({
      ...customerDetails,
      [e.target.id]: e.target.value,
    });
  };

  const handleItemChange = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setInvoiceItems(
      invoiceItems.map((item) => {
        if (item.id === id) {
          const updatedItem = {
            ...item,
            [field]: field === "description" ? value : Number(value),
          };

          if (field === "quantity" || field === "unitPrice") {
            updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  const addNewItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        id: uuidv4(),
        description: "",
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((item) => item.id !== id));
    }
  };

  const handleOptionsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setInvoiceOptions({
      ...invoiceOptions,
      [e.target.id]:
        e.target.id === "status"
          ? (e.target.value as "draft" | "sent" | "paid" | "overdue")
          : Number(e.target.value) || 0,
    });
  };

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "date" | "dueDate"
  ) => {
    setInvoiceOptions({
      ...invoiceOptions,
      [field]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const invoiceData: InvoiceData = {
      customer: customerDetails,
      items: invoiceItems,
      invoiceNumber,
      date: invoiceOptions.date,
      dueDate: invoiceOptions.dueDate,
      subtotal,
      tax_rate: invoiceOptions.tax_rate,
      taxAmount,
      discount: invoiceOptions.discount,
      total,
      status: invoiceOptions.status,
      user_id: user?.id,
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
        router.push("/invoices/invoices-list");
      } else {
        console.error("Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
      <div className="flex items-center pb-5">
        <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
        <h2 className="text-[13px] font-[500]">Create New Invoice</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Invoice Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="mb-4">
            <label className="text-[14px] block mb-1" htmlFor="invoiceNumber">
              Invoice Number
            </label>
            <input
              className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] rounded-md"
              type="text"
              id="invoiceNumber"
              value={invoiceNumber}
              readOnly
            />
          </div>

          <div className="mb-4">
            <label className="text-[14px] block mb-1" htmlFor="date">
              Invoice Date
            </label>
            <input
              className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] rounded-md"
              type="date"
              id="date"
              value={invoiceOptions.date}
              onChange={(e) => handleDateChange(e, "date")}
              required
            />
          </div>

          <div className="mb-4">
            <label className="text-[14px] block mb-1" htmlFor="dueDate">
              Due Date
            </label>
            <input
              className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] rounded-md"
              type="date"
              id="dueDate"
              value={invoiceOptions.dueDate}
              onChange={(e) => handleDateChange(e, "dueDate")}
              required
            />
          </div>
        </div>

        {/* Customer Details */}
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-[15px] font-semibold mb-3">Customer Details</h3>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="name">
              Customer Name
            </label>
            <select
              id="customerSelect"
              className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
              // value={selectedCustomer.id}
              // onChange={handleCustomerSelect}
              required
              disabled={customerLoading}
            >
              <option value="">
                {customerLoading ? "Loading customers..." : "Select a customer"}
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="delivery">
              Delivery Address
            </label>
            <input
              placeholder="Enter delivery address"
              className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
              type="text"
              id="delivery"
              value={customerDetails.delivery}
              onChange={handleCustomerChange}
              required
            />
          </div>
          <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-4 gap-0">
            <div className="mb-4">
              <label className="text-[14px]" htmlFor="email">
                Email Address
              </label>
              <input
                placeholder="Enter email address"
                className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
                type="email"
                id="email"
                value={customerDetails.email}
                onChange={handleCustomerChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="text-[14px]" htmlFor="contact">
                Contact Number
              </label>
              <input
                placeholder="Enter contact number"
                className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                id="contact"
                value={customerDetails.contact}
                onChange={handleCustomerChange}
                minLength={11}
                maxLength={11}
                required
                onKeyDown={(e) => {
                  if (
                    !/[0-9]/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete" &&
                    e.key !== "Tab" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight"
                  ) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          </div>
          <div>
            <label className="text-[14px]" htmlFor="remarks">
              Remarks
            </label>
            <textarea
              placeholder="Enter remarks"
              className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
              id="remarks"
              value={customerDetails.remarks}
              onChange={handleCustomerChange}
            />
          </div>
        </div>

        {/* Invoice Items */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[15px] font-semibold">Invoice Items</h3>
            <button
              type="button"
              onClick={addNewItem}
              className="text-[14px] py-1 px-3 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
            >
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        className="border text-[14px] py-1 px-2 w-full bg-[#F2F4F7] rounded"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "description",
                            e.target.value
                          )
                        }
                        required
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="1"
                        className="border text-[14px] py-1 px-2 w-full bg-[#F2F4F7] rounded"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(item.id, "quantity", e.target.value)
                        }
                        required
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="border text-[14px] py-1 px-2 w-full bg-[#F2F4F7] rounded"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(item.id, "unitPrice", e.target.value)
                        }
                        required
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        className="border text-[14px] py-1 px-2 w-full bg-gray-100 rounded"
                        value={item.amount.toFixed(2)}
                        readOnly
                      />
                    </td>
                    <td className="px-4 py-2">
                      {invoiceItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="col-span-2">
            <div className="mb-4">
              <label className="text-[14px] block mb-1" htmlFor="status">
                Status
              </label>
              <select
                className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] rounded-md"
                id="status"
                value={invoiceOptions.status}
                onChange={handleOptionsChange}
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="text-[14px] block mb-1" htmlFor="remarks">
                Notes
              </label>
              <textarea
                className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] rounded-md"
                id="remarks"
                value={customerDetails.remarks}
                onChange={handleCustomerChange}
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between mb-2">
              <span className="text-[14px]">Subtotal:</span>
              <span className="text-[14px] font-medium">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-[14px]">
                Tax ({invoiceOptions.tax_rate}%):
              </span>
              <span className="text-[14px] font-medium">
                ${taxAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-[14px]">Discount:</span>
              <span className="text-[14px] font-medium">
                -${invoiceOptions.discount.toFixed(2)}
              </span>
            </div>
            <div className="border-t my-2"></div>
            <div className="flex justify-between font-semibold">
              <span className="text-[14px]">Total:</span>
              <span className="text-[14px]">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-[14px] font-[500] py-2 w-32 rounded cursor-pointer transition-all duration-300 mt-4 text-gray-700 bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="text-[14px] font-[500] py-2 w-40 rounded cursor-pointer transition-all duration-300 mt-4 text-white bg-[#307EF3] hover:bg-[#478cf3]"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Invoice"}
          </button>
        </div>
      </form>
    </main>
  );
};
