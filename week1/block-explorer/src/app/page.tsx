"use client";

import { useState } from "react";
import axios from "axios";
import { Search } from "lucide-react";

const HORIZON_API_URL = "http://172.233.19.77:8000"; 

export default function SearchPage() {
  const [inputs, setInputs] = useState({ ledgerNumber: "", transactionHash: "", accountAddress: "" });
  const [results, setResults] = useState({ ledger: null, transaction: null, balance: null });
  const [loading, setLoading] = useState({ ledger: false, transaction: false, balance: false });
  const [error, setError] = useState({ ledger: null, transaction: null, balance: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (field) => {
    if (!inputs[field]) return;

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

      console.log(`Response for ${field}:`, response.data);
      setResults((prev) => ({ ...prev, [field]: response.data }));
    } catch (err) {
      console.error(`Error fetching ${field}:`, err);
      setError((prev) => ({ ...prev, [field]: "Error fetching data. Please check if the information is correct." }));
    } finally {
      setLoading((prev) => ({ ...prev, [field]: false }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Stellar Ledger Explorer</h1>
      <div className="bg-gray-800 shadow-lg rounded-2xl p-6 w-full max-w-md space-y-4">
        {[
          { name: "ledgerNumber", label: "Search Ledger by Number", placeholder: "Ledger Number" },
          { name: "transactionHash", label: "Search Transaction by Hash", placeholder: "Transaction Hash" },
          { name: "accountAddress", label: "Search Balance by Address", placeholder: "Wallet Address" }
        ].map((field, index) => (
          <div key={index} className="flex flex-col space-y-2">
            <label htmlFor={field.name} className="font-medium">{field.label}</label>
            <div className="flex items-center space-x-2">
              <input
                id={field.name}
                type="text"
                name={field.name}
                value={inputs[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="flex-1 px-4 py-2 border rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleSearch(field.name)}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                disabled={loading[field.name]}
              >
                {loading[field.name] ? "..." : <Search size={20} />}
              </button>
            </div>
            {error[field.name] && <p className="text-sm text-red-500 mt-2">{error[field.name]}</p>}
            {results[field.name] && (
              <div className="text-sm text-gray-300 mt-2 bg-gray-700 p-3 rounded-lg">
                <strong>Resultado:</strong>
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(results[field.name], null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-gray-400 mt-6">by HashWarriors</p>
    </div>
  );
}
