"use client";

import { Modal } from "antd";
import { useState } from "react";

interface CalculatorModalProps {
  visible: boolean;
  onCancel: () => void;
}

export const CalculatorModal = ({
  visible,
  onCancel,
}: CalculatorModalProps) => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const handleClick = (value: string) => {
    if (value === "=") {
      try {
        setResult(eval(input).toString());
      } catch {
        setResult("Error");
      }
    } else if (value === "C") {
      setInput("");
      setResult("");
    } else if (value === "⌫") {
      setInput(input.slice(0, -1));
    } else {
      setInput(input + value);
    }
  };

  const buttons = [
    "7",
    "8",
    "9",
    "/",
    "4",
    "5",
    "6",
    "*",
    "1",
    "2",
    "3",
    "-",
    "0",
    ".",
    "=",
    "+",
    "C",
    "⌫",
  ];

  return (
    <Modal
      title="Calculator"
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      width={300}
    >
      <div className="bg-gray-100 p-2 rounded mb-4 text-right">
        <div className="text-gray-600 text-sm h-6">{input}</div>
        <div className="text-2xl font-semibold h-8">{result || "0"}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {buttons.map((btn) => (
          <button
            key={btn}
            onClick={() => handleClick(btn)}
            className={`p-2 rounded text-lg font-medium ${
              btn === "="
                ? "bg-blue-500 text-white"
                : btn === "C" || btn === "⌫"
                ? "bg-red-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {btn}
          </button>
        ))}
      </div>
    </Modal>
  );
};
