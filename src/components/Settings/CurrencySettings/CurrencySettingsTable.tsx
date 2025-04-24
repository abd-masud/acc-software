"use client";

import { useEffect, useMemo, useState } from "react";
import { Table, Switch, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CurrencyType } from "@/types/currency";
import { useAuth } from "@/contexts/AuthContext";

export const CurrencySettingsTable = () => {
  const { user } = useAuth();
  const [data, setData] = useState<CurrencyType[]>([]);
  const [searchText, setSearchText] = useState("");

  const filteredCurrency = useMemo(() => {
    if (!searchText) return data;

    return data.filter((currency) =>
      Object.values(currency).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [data, searchText]);

  const columns: ColumnsType<CurrencyType> = [
    {
      title: "#",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Currency Name",
      dataIndex: "currencyName",
      key: "name",
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Default",
      dataIndex: "isDefault",
      key: "isDefault",
      render: (_, record) => (
        <Switch
          checked={record.isDefault}
          onChange={() => handleDefaultChange(record.key)}
        />
      ),
    },
  ];

  const handleDefaultChange = async (key: string) => {
    if (!user?.id) return;

    const selectedCurrency = data.find((item) => item.key == key);
    if (!selectedCurrency) return;

    const payload = {
      user_id: user.id,
      currency: selectedCurrency.code,
    };

    try {
      const response = await fetch("/api/currencies", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        const updatedData = data.map((item) => ({
          ...item,
          isDefault: item.key == key,
        }));
        setData(updatedData);
      }
    } catch (error) {
      console.error("Currency upsert failed:", error);
    }
  };

  useEffect(() => {
    fetch("/data/currency.json")
      .then((res) => res.json())
      .then(
        (
          currencyData: Record<
            string,
            Omit<CurrencyType, "key" | "si" | "isDefault" | "currencyName"> & {
              name: string;
            }
          >
        ) => {
          const formattedData: CurrencyType[] = Object.entries(
            currencyData
          ).map(([code, currency], index) => ({
            key: code,
            si: index + 1,
            currencyName: currency.name,
            code: currency.code,
            isDefault: code == "USD",
          }));
          setData(formattedData);
        }
      );
  }, []);

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
      <div className="flex sm:justify-between justify-end items-center mb-5">
        <div className="sm:flex items-center hidden">
          <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
          <h2 className="text-[13px] font-[500]">Currency Settings Info</h2>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Input
            type="text"
            placeholder="Search..."
            className="border text-[14px] sm:w-40 w-32 py-1 px-[10px] bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={filteredCurrency}
        scroll={{ x: "max-content" }}
        pagination={false}
        bordered
      />
    </main>
  );
};
