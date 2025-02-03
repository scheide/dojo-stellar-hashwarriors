"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchPage() {
  const [inputs, setInputs] = useState({ blockNumber: "", transactionHash: "", balanceAddress: "" });
  const [results, setResults] = useState({ blockNumber: "", transactionHash: "", balanceAddress: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (field) => {
    setResults((prev) => ({ ...prev, [field]: `Result for ${inputs[field]}` }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Stellar Block Explorer</h1>
      <div className="bg-gray-800 shadow-lg rounded-2xl p-6 w-full max-w-md space-y-4">
        {[
          { name: "blockNumber", label: "Find Block by Number", placeholder: "Block Number" },
          { name: "transactionHash", label: "Find Transaction by Hash", placeholder: "Transaction Hash" },
          { name: "balanceAddress", label: "Find Balance by Address", placeholder: "Address" }
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
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                <Search size={20} />
              </button>
            </div>
            {results[field.name] && (
              <p className="text-sm text-gray-300 mt-2">{results[field.name]}</p>
            )}
          </div>
        ))}
      </div>
      <p className="text-gray-400 mt-6">by HashWarriors</p>
    </div>
  );
}
