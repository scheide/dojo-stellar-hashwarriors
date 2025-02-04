/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import axios from "axios";
import { Search, Eraser } from "lucide-react";

const HORIZON_API_URL = "http://172.233.19.77:8000";

export default function SearchPage() {
  const [inputs, setInputs] = useState({
    ledgerNumber: "",
    transactionHash: "",
    accountAddress: "",
  });
  const [results, setResults] = useState({
    ledgerNumber: null,
    transactionHash: null,
    accountAddress: null,
  });
  const [loading, setLoading] = useState({
    ledgerNumber: false,
    transactionHash: false,
    accountAddress: false,
  });
  const [error, setError] = useState({
    ledgerNumber: null,
    transactionHash: null,
    accountAddress: null,
  });

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (field: string) => {
    setLoading((prev) => ({ ...prev, [field]: true }));
    setError((prev) => ({ ...prev, [field]: null }));

    let url;
    switch (field) {
      case "ledgerNumber":
        url = `${HORIZON_API_URL}/ledgers/${inputs[field]}`;
        break;
      case "transactionHash":
        url = `${HORIZON_API_URL}/transactions/${inputs[field]}`;
        break;
      case "accountAddress":
        url = `${HORIZON_API_URL}/claimable_balances/${inputs[field]}`;
        break;
      default:
        return;
    }

    try {
      const response = await axios.get(url, {
        headers: { Accept: "application/json" },
      });
      setResults((prev) => ({ ...prev, [field]: response.data }));
    } catch (err) {
      console.error(err);
      setError((prev) => ({
        ...prev,
        [field]:
          "Error fetching data. Please check if the information is correct.",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleClear = (field: string) => {
    setInputs((prev) => ({ ...prev, [field]: "" }));
    setResults((prev) => ({ ...prev, [field]: null }));
    setError((prev) => ({ ...prev, [field]: null }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-8">Stellar Ledger Explorer</h1>

      <div className="relative w-full max-w-4xl">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-purple-500 to-yellow-500 rounded-2xl animate-pulse" />
        <div className="absolute inset-[2px] bg-gray-800 rounded-2xl" />
        <div className="relative p-6 space-y-4">
          {[
            {
              name: "ledgerNumber" as keyof typeof inputs,
              label: "Search Ledger by Number",
              placeholder: "Ledger Number",
            },
            {
              name: "transactionHash" as keyof typeof inputs,
              label: "Search Transaction by Hash",
              placeholder: "Transaction Hash",
            },
            {
              name: "accountAddress" as keyof typeof inputs,
              label: "Search Balance by Address",
              placeholder: "Wallet Address",
            },
          ].map((field, index) => (
            <div key={index} className="flex flex-col space-y-2">
              <label htmlFor={field.name} className="font-medium text-gray-300">
                {field.label}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  id={field.name}
                  type="text"
                  name={field.name}
                  value={inputs[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
                <button
                  onClick={() => handleSearch(field.name)}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-200 disabled:opacity-50 hover:shadow-lg hover:shadow-purple-500/25"
                  disabled={loading[field.name]}
                >
                  {loading[field.name] ? "..." : <Search size={20} />}
                </button>
                <button
                  className="p-2 bg-red-500 text-white rounded-lg  hover:bg-red-900 transition-all duration-200 disabled:opacity-50 hover:shadow-lg hover:shadow-red-800/25"
                  onClick={() => handleClear(field.name)}
                >
                  <Eraser size={20} />
                </button>
              </div>
              {error[field.name] && (
                <p className="text-sm text-red-400 mt-2 animate-pulse">
                  {error[field.name]}
                </p>
              )}
              {results[field.name] && (
                <div className="text-sm text-gray-300 mt-2 bg-gray-700 p-3 rounded-lg border border-gray-600">
                  <strong className="text-purple-400">Result:</strong>
                  <pre className="whitespace-pre-wrap break-words mt-2">
                    {JSON.stringify(results[field.name], null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="text-gray-400 mt-6 font-medium">by HashWarriors</p>
    </div>
  );
}
