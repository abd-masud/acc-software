"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Customers } from "@/types/customers";
import { CustomerOption, InvoiceItem, ProductOption } from "@/types/invoices";
import { Products } from "@/types/products";
import { useRouter } from "next/navigation";
import Select, { StylesConfig } from "react-select";
import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import Link from "next/link";
import dayjs from "dayjs";
import { DatePicker, Modal } from "antd";
import Image from "next/image";
import success from "../../../../public/images/success.png";
import { FaXmark } from "react-icons/fa6";

export const CreateInvoicesForm = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [invoice_id, setInvoiceId] = useState("");
  const [nextId, setNextId] = useState(1);
  const [customers, setCustomers] = useState<Customers[]>([]);
  const [products, setProducts] = useState<Products[]>([]);
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [taxRate, setTaxRate] = useState("");
  const [notes, setNotes] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [paymentType, setPaymentType] = useState("cash");
  const [selectedCustomer, setSelectedCustomer] = useState<Customers | null>(
    null
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState<Customers>({
    key: "",
    id: 0,
    customer_id: "",
    name: "",
    delivery: "",
    email: "",
    contact: "",
    status: "",
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    {
      id: 0,
      product_id: "",
      product: "",
      quantity: "",
      unit: "",
      unit_price: "",
      amount: "",
    },
  ]);

  const [invoiceOptions, setInvoiceOptions] = useState({
    date: dayjs().format("YYYY-MM-DD"),
    due_date: dayjs().add(7, "day").format("YYYY-MM-DD"),
    paid_amount: "",
  });

  const dateFormat = "DD MMMM YYYY";

  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: `${customer.name} (${customer.customer_id})`,
    customer: customer,
  }));

  const productOptions = products.map((product) => ({
    value: product.id,
    label: `${product.name} (${product.product_id})`,
    product: product,
  }));

  useEffect(() => {
    if (!user?.id) return;
    const fetchCustomers = async () => {
      try {
        const customersRes = await fetch(`/api/customers?user_id=${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (customersRes.ok) {
          const customersData = await customersRes.json();
          setCustomers(
            Array.isArray(customersData.data) ? customersData.data : []
          );
        }
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      }
    };

    fetchCustomers();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchProducts = async () => {
      try {
        const productsRes = await fetch(`/api/products?user_id=${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(
            Array.isArray(productsData.data) ? productsData.data : []
          );
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, [user?.id]);

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

  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );

    const total_tax = subtotal * (Number(taxRate) / 100);
    const total = subtotal + total_tax - Number(discountAmount);
    const due_amount = total - Number(invoiceOptions.paid_amount);

    return {
      subtotal,
      tax: total_tax || 0,
      total,
      due_amount,
      discount: discountAmount || 0,
    };
  };

  const { subtotal, discount, tax, total, due_amount } = calculateTotals();

  useEffect(() => {
    const generateCustomerId = () => {
      const compPrefix = user?.company
        ? user.company.slice(0, 2).toUpperCase()
        : "CO";
      const random = Math.floor(10000 + Math.random() * 90000);
      return `I${compPrefix}${random}`;
    };

    setInvoiceId(generateCustomerId());
  }, [user]);

  const handleItemChange = (
    id: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setInvoiceItems(
      invoiceItems.map((item) => {
        if (item.id == id) {
          const updatedItem = {
            ...item,
            [field]: field == "product" ? value : value,
          };

          if (field == "quantity" || field == "unit_price") {
            const quantity = Number(updatedItem.quantity);
            const unit_price = Number(updatedItem.unit_price);
            updatedItem.amount = String(quantity * unit_price);
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
        product_id: "",
        product: "",
        quantity: "",
        unit_price: "",
        unit: "",
        amount: "",
      },
    ]);
    setNextId(nextId + 1);
  };

  const removeItem = (id: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((item) => item.id !== id));
    }
  };

  const handleDateChange = (
    value: dayjs.Dayjs | null,
    field: "date" | "due_date"
  ) => {
    if (value) {
      setInvoiceOptions({
        ...invoiceOptions,
        [field]: value.format("YYYY-MM-DD"),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const sub_invoice = [
      {
        paid_amount: Number(invoiceOptions.paid_amount),
        due_amount: due_amount,
        date: invoiceOptions.date,
      },
    ];
    const invoiceData = {
      customer: customerDetails,
      items: invoiceItems,
      invoice_id,
      date: invoiceOptions.date,
      due_date: due_amount == 0 ? "N/A" : invoiceOptions.due_date,
      subtotal,
      tax,
      discount,
      total,
      paid_amount: Number(invoiceOptions.paid_amount),
      due_amount,
      pay_type: paymentType,
      notes,
      sub_invoice,
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create invoice");
      }
      setShowSuccessModal(true);
    } catch (error: any) {
      setUserMessage(error || "An unexpected error occurred");
    } finally {
      setTimeout(() => setUserMessage(null), 5000);
      setLoading(false);
    }
  };

  const customerSelectStyles: StylesConfig<CustomerOption, boolean> = {
    control: (base) => ({
      ...base,
      borderColor: "#E5E7EB",
      "&:hover": {
        borderColor: "#E5E7EB",
      },
      minHeight: "48px",
      fontSize: "14px",
      boxShadow: "none",
      backgroundColor: "#F2F4F7",
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "14px",
      backgroundColor: state.isSelected ? "#F2F4F7" : "white",
      color: "black",
      "&:hover": {
        backgroundColor: "#F2F4F7",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  const productSelectStyles: StylesConfig<ProductOption, boolean> = {
    control: (base) => ({
      ...base,
      borderColor: "#E5E7EB",
      "&:hover": {
        borderColor: "#E5E7EB",
      },
      minHeight: "48px",
      fontSize: "14px",
      boxShadow: "none",
      backgroundColor: "#F2F4F7",
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "14px",
      backgroundColor: state.isSelected ? "#F2F4F7" : "white",
      color: "black",
      "&:hover": {
        backgroundColor: "#F2F4F7",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  const handleOkay = () => {
    setShowSuccessModal(false);
    router.push("/invoices/invoices-list");
  };

  const handleCloseMessage = () => {
    setUserMessage(null);
  };

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
      {userMessage && (
        <div className="left-1/2 top-10 transform -translate-x-1/2 fixed z-50">
          <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800 text-green-400 border-2 border-green-400 mx-auto">
            <div className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              {userMessage}
            </div>
            <button
              onClick={handleCloseMessage}
              className="ml-3 focus:outline-none hover:text-green-300"
            >
              <FaXmark className="text-[14px]" />
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center pb-5">
        <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
        <h2 className="text-[13px] font-[500]">Create New Invoice</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-[14px] block mb-1" htmlFor="invoice_id">
              Invoice ID
            </label>
            <input
              className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="text"
              id="invoice_id"
              value={invoice_id}
              readOnly
            />
          </div>

          <div>
            <label className="text-[14px] block mb-1" htmlFor="date">
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

          <div>
            <label className="text-[14px] block mb-1" htmlFor="due_date">
              Due Date
            </label>
            <DatePicker
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="date"
              id="due_date"
              format={dateFormat}
              value={dayjs(invoiceOptions.due_date)}
              onChange={(value) => handleDateChange(value, "due_date")}
              required
            />
          </div>
        </div>

        <div className="mb-6 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold mb-3">Customer Details</h3>
            <Link
              className="text-[12px] py-1 px-3 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-300"
              href={"/customers/add-customers"}
            >
              Add Customer
            </Link>
          </div>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="customer">
              Customer Name
            </label>
            <Select<{
              value: number;
              label: string;
              customer: Customers;
            }>
              id="customer"
              className="text-[14px] mt-2"
              options={customerOptions}
              value={customerOptions.find(
                (option) => option.value == selectedCustomer?.id
              )}
              onChange={(selectedOption) => {
                if (selectedOption) {
                  setSelectedCustomer(selectedOption.customer);
                  setCustomerDetails(selectedOption.customer);
                } else {
                  setSelectedCustomer(null);
                  setCustomerDetails({
                    key: "",
                    id: 0,
                    customer_id: "",
                    name: "",
                    delivery: "",
                    email: "",
                    contact: "",
                    status: "",
                  });
                }
              }}
              placeholder="Select customer"
              isClearable
              isSearchable
              styles={customerSelectStyles}
              required
            />
          </div>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="delivery">
              Delivery Address
            </label>
            <input
              placeholder="Enter delivery address"
              className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
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
                className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
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
                className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                type="text"
                id="contact"
                value={customerDetails.contact}
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[15px] font-semibold">Invoice Items</h3>
            <button
              type="button"
              onClick={addInvoiceItem}
              className="text-[12px] py-1 px-3 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-300"
            >
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto relative">
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
                      <Select<{
                        value: number;
                        label: string;
                        product: Products;
                      }>
                        className="text-[14px] mt-2"
                        options={productOptions}
                        value={productOptions.find(
                          (option) => option.value.toString() == item.product_id
                        )}
                        onChange={(selectedOption) => {
                          if (selectedOption) {
                            const product = selectedOption.product;
                            setInvoiceItems(
                              invoiceItems.map((i) =>
                                i.id == item.id
                                  ? {
                                      ...i,
                                      product_id: product.product_id,
                                      product: product.name,
                                      unit: String(product.unit),
                                      unit_price: String(product.price),
                                      amount: String(
                                        Number(i.quantity) *
                                          Number(product.price)
                                      ),
                                    }
                                  : i
                              )
                            );
                          } else {
                            setInvoiceItems(
                              invoiceItems.map((i) =>
                                i.id == item.id
                                  ? {
                                      ...i,
                                      product_id: "",
                                      product: "",
                                      unit: "",
                                      unit_price: "",
                                      amount: "",
                                    }
                                  : i
                              )
                            );
                          }
                        }}
                        placeholder="Select product"
                        isClearable
                        isSearchable
                        menuPosition="fixed"
                        styles={productSelectStyles}
                        required
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]"
                        min={1}
                        step="0.01"
                        placeholder="Enter quantity"
                        className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(item.id, "quantity", e.target.value)
                        }
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
                          if (e.key == "." && item.quantity.includes(".")) {
                            e.preventDefault();
                          }
                        }}
                        required
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        min="1"
                        placeholder="Enter unit"
                        className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                        value={item.unit}
                        readOnly
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="Enter unit price"
                        className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                        value={item.unit_price}
                        readOnly
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        placeholder="Enter amount"
                        className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                        value={Number(item.amount)}
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

        <div className="flex md:flex-row flex-col md:items-start items-end md:gap-4 gap-0">
          <div className="w-full">
            <div className="mb-4">
              <label className="text-[15px] font-semibold block mb-2">
                Payment Method
              </label>
              <div className="flex sm:flex-row flex-col sm:gap-5 gap-1">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    className="text-blue-500 focus:ring-blue-500"
                    name="paymentType"
                    value="cash"
                    checked={paymentType == "cash"}
                    onChange={() => setPaymentType("cash")}
                  />
                  <span className="text-[14px]">Cash</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    className="text-blue-500 focus:ring-blue-500"
                    name="paymentType"
                    value="wallet"
                    checked={paymentType == "wallet"}
                    onChange={() => setPaymentType("wallet")}
                  />
                  <span className="text-[14px]">Wallet</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    className="text-blue-500 focus:ring-blue-500"
                    name="paymentType"
                    value="bank"
                    checked={paymentType == "bank"}
                    onChange={() => setPaymentType("bank")}
                  />
                  <span className="text-[14px]">Bank</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    className="text-blue-500 focus:ring-blue-500"
                    name="paymentType"
                    value="others"
                    checked={paymentType == "others"}
                    onChange={() => setPaymentType("others")}
                  />
                  <span className="text-[14px]">Others</span>
                </label>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-[14px] block mb-1" htmlFor="notes">
                Notes
              </label>
              <textarea
                placeholder="Enter notes..."
                maxLength={250}
                className="border text-[14px] py-2 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50 sm:w-96 w-56">
            <div className="flex justify-between mb-2">
              <span className="text-[14px]">Subtotal:</span>
              <span className="text-[14px] font-medium">
                {subtotal.toFixed(2)}
                {currencyCode}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px]">Tax:</span>
              <div className="space-x-1 mr-[17px]">
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={0}
                  max={100}
                  step="0.01"
                  placeholder="0.00"
                  className="border text-[14px] w-20 py-1 px-[10px] bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
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
                    if (e.key == "." && taxRate.includes(".")) {
                      e.preventDefault();
                    }
                  }}
                />
                <span className="text-[14px] font-medium">%</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[14px]">Discount:</span>
              <div className="space-x-1">
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="0"
                  max={subtotal}
                  step="0.01"
                  placeholder="0.00"
                  className="border text-[14px] w-20 py-1 px-[10px] bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
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
                    if (e.key == "." && discountAmount.includes(".")) {
                      e.preventDefault();
                    }
                  }}
                />
                <span className="text-[14px] font-medium">{currencyCode}</span>
              </div>
            </div>

            <div className="flex justify-between font-semibold mb-2">
              <span className="text-[14px]">Total Amount:</span>
              <span className="text-[14px]">
                {total} {currencyCode}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[14px]">Paid:</span>
              <div className="space-x-1">
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="0"
                  max={total}
                  step="0.01"
                  placeholder="Pay"
                  className="border text-[14px] w-20 py-1 px-[10px] bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
                  value={invoiceOptions.paid_amount}
                  onChange={(e) =>
                    setInvoiceOptions({
                      ...invoiceOptions,
                      paid_amount: e.target.value,
                    })
                  }
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
                    if (
                      e.key == "." &&
                      invoiceOptions.paid_amount.includes(".")
                    ) {
                      e.preventDefault();
                    }
                  }}
                  required
                />
                <span className="text-[14px] font-semibold">
                  {currencyCode}
                </span>
              </div>
            </div>
            <div className="border-t my-2"></div>
            <div className="flex justify-between font-semibold text-blue-600">
              <span className="text-[14px]">Due Amount:</span>
              <span className="text-[14px]">
                {due_amount} {currencyCode}
              </span>
            </div>
          </div>
        </div>

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
      <Modal
        open={showSuccessModal}
        onCancel={handleOkay}
        footer={[
          <button
            key="okay"
            onClick={handleOkay}
            className="text-[14px] font-[500] py-2 w-20 rounded cursor-pointer transition-all duration-300 mt-2 text-white bg-[#307EF3] hover:bg-[#478cf3] focus:bg-[#307EF3]"
          >
            Okay
          </button>,
        ]}
        centered
        width={400}
      >
        <div className="flex flex-col items-center pt-5">
          <Image src={success} alt="Success" width={80} height={80} />
          <h3 className="text-xl font-semibold mt-2">Success!</h3>
          <p className="text-gray-600 text-center">
            Invoice has been created successfully.
          </p>
        </div>
      </Modal>
    </main>
  );
};
