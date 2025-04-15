"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Customers } from "@/types/customers";
import { InvoiceData, InvoiceItem } from "@/types/invoices";
import { Products } from "@/types/products";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";

export const CreateInvoicesForm = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [invoice_id, setInvoiceNumber] = useState("");
  const [nextId, setNextId] = useState(1);
  const [customers, setCustomers] = useState<Customers[]>([]);
  const [products, setProducts] = useState<Products[]>([]);

  const [selectedCustomer, setSelectedCustomer] = useState<Customers | null>(
    null
  );
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
      id: 0,
      product_id: 0,
      product: "",
      quantity: 1,
      unit_price: 0,
      unit: "",
      tax_rate: 0,
      amount: 0,
    },
  ]);

  const [invoiceOptions, setInvoiceOptions] = useState({
    date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    discount: 0,
    paid_amount: "",
    notes: "",
  });

  // Fetch customers and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (user?.id) {
          headers["user_id"] = user.id.toString();
        }

        const customersRes = await fetch("/api/customers", {
          method: "GET",
          headers: headers,
        });

        if (customersRes.ok) {
          const customersData = await customersRes.json();
          setCustomers(
            Array.isArray(customersData.data) ? customersData.data : []
          );
        }

        const productsRes = await fetch("/api/products", {
          method: "GET",
          headers: headers,
        });

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(
            Array.isArray(productsData.data) ? productsData.data : []
          );
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [user?.id]);

  // Calculate invoice totals
  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );

    const total_tax = invoiceItems.reduce(
      (sum, item) => sum + (item.amount * (item.tax_rate / 100) || 0),
      0
    );

    const total = subtotal + total_tax - invoiceOptions.discount;
    const due_amount = total - Number(invoiceOptions.paid_amount);

    return { subtotal, total_tax, total, due_amount };
  };

  const { subtotal, total_tax, total, due_amount } = calculateTotals();

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

  // Handle customer selection
  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = parseInt(e.target.value);
    const customer = customers.find((c) => c.id === customerId);

    if (customer) {
      setSelectedCustomer(customer);
      setCustomerDetails(customer);
    } else {
      setSelectedCustomer(null);
      setCustomerDetails({
        key: "",
        id: 0,
        name: "",
        delivery: "",
        email: "",
        contact: "",
        remarks: "",
      });
    }
  };

  // Handle product selection for an item
  const handleProductSelect = (itemId: number, product_id: number) => {
    const product = products.find((p) => p.id === product_id);

    if (product) {
      setInvoiceItems(
        invoiceItems.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              product_id: product.id,
              product: product.name,
              unit: product.unit,
              unit_price: product.price,
              tax_rate: product.tax_rate,
              amount: item.quantity * product.price,
            };
          }
          return item;
        })
      );
    }
  };

  const handleItemChange = (
    id: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setInvoiceItems(
      invoiceItems.map((item) => {
        if (item.id === id) {
          const updatedItem = {
            ...item,
            [field]: field === "product" ? value : Number(value),
          };

          if (field === "quantity" || field === "unit_price") {
            updatedItem.amount = updatedItem.quantity * updatedItem.unit_price;
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  const addInvoiceItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        id: nextId,
        product_id: 0,
        product: "",
        quantity: 1,
        unit_price: 0,
        unit: "",
        tax_rate: 0,
        amount: 0,
      },
    ]);
    setNextId(nextId + 1);
  };

  const removeItem = (id: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((item) => item.id !== id));
    }
  };

  const handleOptionsChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value } = e.target;

    setInvoiceOptions({
      ...invoiceOptions,
      [id]:
        id === "status"
          ? (value as "draft" | "sent" | "paid" | "overdue")
          : id === "notes"
          ? value
          : Number(value) || 0,
    });
  };

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "date" | "due_date"
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
      id: 0,
      customer: customerDetails,
      items: invoiceItems,
      invoice_id,
      date: invoiceOptions.date,
      due_date: invoiceOptions.due_date,
      subtotal,
      total_tax,
      discount: invoiceOptions.discount,
      total,
      paid_amount: Number(invoiceOptions.paid_amount),
      due_amount,
      notes: invoiceOptions.notes,
      user_id: user?.id as number,
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
            <label className="text-[14px] block mb-1" htmlFor="invoice_id">
              Invoice ID
            </label>
            <input
              className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
              type="text"
              id="invoice_id"
              value={invoice_id}
              readOnly
            />
          </div>

          <div className="mb-4">
            <label className="text-[14px] block mb-1" htmlFor="date">
              Invoice Date
            </label>
            <input
              className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
              type="date"
              id="date"
              value={invoiceOptions.date}
              onChange={(e) => handleDateChange(e, "date")}
              required
            />
          </div>

          <div className="mb-4">
            <label className="text-[14px] block mb-1" htmlFor="due_date">
              Due Date
            </label>
            <input
              className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
              type="date"
              id="due_date"
              value={invoiceOptions.due_date}
              onChange={(e) => handleDateChange(e, "due_date")}
              required
            />
          </div>
        </div>

        {/* Customer Details */}
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-[15px] font-semibold mb-3">Customer Details</h3>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="customerSelect">
              Customer Name
            </label>
            <select
              id="customerSelect"
              className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
              value={selectedCustomer?.id || ""}
              onChange={handleCustomerSelect}
              required
            >
              <option value="">Select a customer</option>
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
              readOnly
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
                readOnly
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
                id="contact"
                value={customerDetails.contact}
                readOnly
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
              readOnly
            />
          </div>
        </div>

        {/* Invoice Items */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[15px] font-semibold">Invoice Items</h3>
            <button
              type="button"
              onClick={addInvoiceItem}
              className="text-[14px] py-1 px-3 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
            >
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="border rounded-lg xl:w-full w-[1024px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-60">
                    Product
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax Rate
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
                      <select
                        className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
                        value={item.product_id}
                        required
                        onChange={(e) =>
                          handleProductSelect(item.id, parseInt(e.target.value))
                        }
                      >
                        <option value="0">Select Product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="1"
                        className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(item.id, "quantity", e.target.value)
                        }
                        required
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        min="1"
                        className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
                        value={item.unit}
                        readOnly
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
                        value={item.unit_price}
                        readOnly
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
                        value={item.tax_rate}
                        readOnly
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
                        value={item.amount.toFixed(2)}
                        readOnly
                      />
                    </td>
                    <td className="px-4 py-2">
                      {invoiceItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-[12px] transition-all duration-300"
                        >
                          <FaTrash />
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
        <div className="flex md:flex-row flex-col md:items-start items-end md:gap-4 gap-0">
          <div className="w-full">
            <div className="mb-4">
              <label className="text-[14px] block mb-1" htmlFor="notes">
                Notes
              </label>
              <textarea
                placeholder="Enter notes..."
                className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
                id="notes"
                value={invoiceOptions.notes}
                onChange={handleOptionsChange}
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50 sm:w-96 w-56">
            <div className="flex justify-between mb-2">
              <span className="text-[14px]">Subtotal:</span>
              <span className="text-[14px] font-medium">
                {subtotal.toFixed(2)} BDT
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-[14px]">Total Tax:</span>
              <span className="text-[14px] font-medium">
                {total_tax.toFixed(2)} BDT
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-[14px]">Discount:</span>
              <span className="text-[14px] font-medium">
                {invoiceOptions.discount.toFixed(2)} BDT
              </span>
            </div>
            <div className="border-t my-2"></div>
            <div className="flex justify-between font-semibold mb-2">
              <span className="text-[14px]">Total Amount:</span>
              <span className="text-[14px]">{total.toFixed(2)} BDT</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[14px]">Paid Amount:</span>
              <input
                type="number"
                min="0"
                max={total}
                placeholder="0.00"
                className="border text-[14px] py-2 w-20 px-[10px] bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
                value={invoiceOptions.paid_amount}
                onChange={(e) => handleOptionsChange(e)}
                id="paid_amount"
              />
            </div>
            <div className="border-t my-2"></div>
            <div className="flex justify-between font-semibold text-blue-600">
              <span className="text-[14px]">Due Amount:</span>
              <span className="text-[14px]">{due_amount.toFixed(2)} BDT</span>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end">
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
