"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Customers } from "@/types/customers";
import { CustomerOption, QuoteItem, ProductOption } from "@/types/quotes";
import { Products } from "@/types/products";
import { useRouter } from "next/navigation";
import Select, { StylesConfig } from "react-select";
import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import Link from "next/link";
import dayjs from "dayjs";
import { DatePicker } from "antd";

export const CreateQuotesForm = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [quote_id, setQuoteId] = useState("");
  const [nextId, setNextId] = useState(1);
  const [customers, setCustomers] = useState<Customers[]>([]);
  const [products, setProducts] = useState<Products[]>([]);
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<Customers | null>(
    null
  );
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

  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([
    {
      id: 0,
      product_id: "",
      product: "",
      quantity: 1,
      unit: "",
      unit_price: 0,
      amount: 0,
    },
  ]);

  const [quoteOptions, setQuoteOptions] = useState({
    date: dayjs().format("YYYY-MM-DD"),
    due_date: dayjs().add(7, "day").format("YYYY-MM-DD"),
    paid_amount: 0,
  });

  const dateFormat = "DD MMMM YYYY";

  // Prepare customer options for react-select
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

  // Fetch customers
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

  // Fetch products
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

  // Calculate quote totals
  const calculateTotals = () => {
    const subtotal = quoteItems.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );

    const total_tax = subtotal * (taxRate / 100);
    const total = subtotal + total_tax - discountAmount;

    return {
      subtotal,
      tax: total_tax,
      total,
      discount: discountAmount,
    };
  };

  const { subtotal, discount, tax, total } = calculateTotals();

  // Generate quote number on component mount
  useEffect(() => {
    const generateCustomerId = () => {
      const compPrefix = user?.company
        ? user.company.slice(0, 2).toUpperCase()
        : "CO";
      const random = Math.floor(10000 + Math.random() * 90000);
      return `I${compPrefix}${random}`;
    };

    setQuoteId(generateCustomerId());
  }, [user]);

  const handleItemChange = (
    id: number,
    field: keyof QuoteItem,
    value: string | number
  ) => {
    setQuoteItems(
      quoteItems.map((item) => {
        if (item.id == id) {
          const updatedItem = {
            ...item,
            [field]: field == "product" ? value : Number(value),
          };

          if (field == "quantity" || field == "unit_price") {
            updatedItem.amount = updatedItem.quantity * updatedItem.unit_price;
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  const addQuoteItem = () => {
    setQuoteItems([
      ...quoteItems,
      {
        id: nextId,
        product_id: "",
        product: "",
        quantity: 1,
        unit_price: 0,
        unit: "",
        amount: 0,
      },
    ]);
    setNextId(nextId + 1);
  };

  const removeItem = (id: number) => {
    if (quoteItems.length > 1) {
      setQuoteItems(quoteItems.filter((item) => item.id !== id));
    }
  };

  const handleDateChange = (value: dayjs.Dayjs | null, field: "date") => {
    if (value) {
      setQuoteOptions({
        ...quoteOptions,
        [field]: value.format("YYYY-MM-DD"),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const quoteData = {
      customer: customerDetails,
      items: quoteItems,
      quote_id,
      date: quoteOptions.date,
      subtotal,
      tax,
      discount,
      total,
      notes,
      user_id: user?.id as number,
    };

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quoteData),
      });

      if (res.ok) {
        router.push("/quotes/quotes-list");
      } else {
        console.error("Failed to create quote");
      }
    } catch (error) {
      console.error("Error creating quote:", error);
    } finally {
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

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
      <div className="flex items-center pb-5">
        <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
        <h2 className="text-[13px] font-[500]">Create New Quote</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Quote Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-[14px] block mb-1" htmlFor="quote_id">
              Quote ID
            </label>
            <input
              className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="text"
              id="quote_id"
              value={quote_id}
              readOnly
            />
          </div>

          <div>
            <label className="text-[14px] block mb-1" htmlFor="date">
              Quote Date
            </label>
            <DatePicker
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="date"
              id="date"
              format={dateFormat}
              value={dayjs(quoteOptions.date)}
              onChange={(value) => handleDateChange(value, "date")}
              required
            />
          </div>
        </div>

        {/* Customer Details */}
        <div className="mb-6 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold mb-3">Customer Details</h3>
            <Link
              className="text-[12px] py-1 px-3 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-300"
              href={"/customers/add-customers"}
            >
              Add Customers
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
              className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
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
                className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
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
                className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                type="text"
                id="contact"
                value={customerDetails.contact}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Quote Items */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[15px] font-semibold">Quote Items</h3>
            <button
              type="button"
              onClick={addQuoteItem}
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
                {quoteItems.map((item) => (
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
                            setQuoteItems(
                              quoteItems.map((i) =>
                                i.id == item.id
                                  ? {
                                      ...i,
                                      product_id: product.product_id,
                                      product: product.name,
                                      unit: product.unit,
                                      unit_price: Number(product.price),
                                      amount:
                                        i.quantity * Number(product.price),
                                    }
                                  : i
                              )
                            );
                          } else {
                            setQuoteItems(
                              quoteItems.map((i) =>
                                i.id == item.id
                                  ? {
                                      ...i,
                                      product_id: "",
                                      product: "",
                                      unit: "",
                                      unit_price: 0,
                                      amount: 0,
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
                        min="1"
                        placeholder="Enter quantity"
                        className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
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
                        placeholder="Enter unit"
                        className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                        value={item.unit}
                        readOnly
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="Enter unit price"
                        className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                        value={item.unit_price}
                        readOnly
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        placeholder="Enter amount"
                        className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                        value={item.amount.toFixed(2)}
                        readOnly
                      />
                    </td>
                    <td className="px-4 py-2">
                      {quoteItems.length > 1 && (
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

        {/* Quote Summary */}
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
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50 sm:w-96 w-56">
            <div className="flex justify-between mb-2">
              <span className="text-[14px]">Subtotal:</span>
              <span className="text-[14px] font-medium">
                {subtotal.toFixed(2)} {currencyCode}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-[14px]">Tax:</span>
              <div className="space-x-1 mr-[17px]">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="border text-[14px] w-20 py-1 px-[10px] bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                />
                <span className="text-[14px] font-medium">%</span>
              </div>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-[14px]">Discount:</span>
              <div className="space-x-1">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="border text-[14px] w-20 py-1 px-[10px] bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-1"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                />
                <span className="text-[14px] font-medium">{currencyCode}</span>
              </div>
            </div>

            <div className="flex justify-between font-semibold mb-2">
              <span className="text-[14px]">Total Amount:</span>
              <span className="text-[14px]">
                {total.toFixed(2)} {currencyCode}
              </span>
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
            {loading ? "Saving..." : "Save Quote"}
          </button>
        </div>
      </form>
    </main>
  );
};
