"use client"

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import * as StellarSdk from "@stellar/stellar-sdk";

const Modal = ({ message, onClose }: { message: string; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-orange-500">Message</h2>
        <p className="text-gray-300 text-center mb-6 whitespace-pre-wrap break-words">{message}</p>
        <button
          className="w-full bg-orange-500 text-white p-2 rounded mt-4 hover:bg-orange-600"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const [keypairs, setKeypairs] = useState<{ id: number; alias: string; publicKey: string; secret: string; balance?: string; showBalance?: boolean }[]>([]);
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [showKeypairs, setShowKeypairs] = useState(false);
  const [currentForm, setCurrentForm] = useState("create-account");
  const [newAlias, setNewAlias] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [senderBalance, setSenderBalance] = useState("");
  const [receiverBalance, setReceiverBalance] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchKeypairs = async () => {
      const response = await fetch("/api/keypairs");
      const allKeypairs = await response.json();
      setKeypairs(allKeypairs.map((kp: any) => ({ ...kp, showBalance: false })));
    };
    fetchKeypairs();
  }, []);

  const fetchBalance = async (publicKey: string) => {
    try {
      const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${publicKey}`);
      const account = await response.json();
      const balance = account.balances.find((b: any) => b.asset_type === "native").balance;
      return balance;
    } catch (error) {
      console.error("Error fetching balance:", error);
      return "0";
    }
  };

  const handleSenderChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const publicKey = e.target.value;
    setSender(publicKey);
    if (publicKey) {
      const balance = await fetchBalance(publicKey);
      setSenderBalance(balance);
    } else {
      setSenderBalance("");
    }
  };

  const handleReceiverChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const publicKey = e.target.value;
    setReceiver(publicKey);
    if (publicKey) {
      const balance = await fetchBalance(publicKey);
      setReceiverBalance(balance);
    } else {
      setReceiverBalance("");
    }
  };

  const handleTransaction = async () => {
    if (parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) {
      setResultMessage("Amount must be a number greater than zero.");
      setShowModal(true);
      return;
    }

    if (!StellarSdk.StrKey.isValidEd25519PublicKey(sender)) {
      setResultMessage("Invalid sender public key.");
      setShowModal(true);
      return;
    }

    if (!StellarSdk.StrKey.isValidEd25519PublicKey(receiver)) {
      setResultMessage("Invalid receiver public key.");
      setShowModal(true);
      return;
    }

    const response = await fetch("/api/transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sender, receiver, amount }),
    });

    const result = await response.json();
    if (response.ok) {
      console.log("Transaction successful:", result.transactionResult);
      setResultMessage("Transaction successful!");
    } else {
      console.error("Transaction failed:", result.error);
      setResultMessage(`Transaction failed: ${result.error}`);
    }
    setShowModal(true);
  };

  const handleCreateAccount = async () => {
    if (newAlias.trim() === "") {
      setResultMessage("Alias cannot be empty.");
      setShowModal(true);
      return;
    }

    setIsProcessing(true);
    setResultMessage("");
    const response = await fetch("/api/create-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ alias: newAlias }),
    });

    const result = await response.json();
    setIsProcessing(false);
    if (response.ok) {
      setResultMessage(`Account created successfully!\nPublic Key: ${result.savedKeypair.publicKey}`);
      setNewAlias("");
      // Refresh keypairs list
      const allKeypairs = await fetch("/api/keypairs").then(res => res.json());
      setKeypairs(allKeypairs.map((kp: any) => ({ ...kp, showBalance: false })));
    } else {
      setResultMessage(`Account creation failed: ${result.error}`);
    }
    setShowModal(true);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const fetchAndSetBalance = async (publicKey: string) => {
    const balance = await fetchBalance(publicKey);
    setKeypairs((prevKeypairs) =>
      prevKeypairs.map((kp) =>
        kp.publicKey === publicKey ? { ...kp, balance } : kp
      )
    );
  };

  const toggleBalanceVisibility = (publicKey: string) => {
    setKeypairs((prevKeypairs) =>
      prevKeypairs.map((kp) =>
        kp.publicKey === publicKey ? { ...kp, showBalance: !kp.showBalance } : kp
      )
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <h1 className="text-7xl font-bold mb-1 text-center text-orange-500">SWM</h1>
      <h1 className="text-sm font-bold mb-4 text-center text-orange-500">Stellar Wallets Manager</h1>
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md mb-8">
        <div className="flex justify-between mb-6 border-b border-gray-600">
          <button
            className={`text-lg font-bold px-4 py-2 ${currentForm === "create-account" ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-300"}`}
            onClick={() => setCurrentForm("create-account")}
          >
            Create Account
          </button>
          <button
            className={`text-lg font-bold px-4 py-2 ${currentForm === "transaction" ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-300"}`}
            onClick={() => setCurrentForm("transaction")}
          >
            Transaction
          </button>
        </div>
        {currentForm === "create-account" && (
          <>
            <div className="mb-4">
              <label className="block text-gray-300">Alias:</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-600 rounded mt-1 bg-gray-700 text-gray-300"
                value={newAlias}
                onChange={(e) => setNewAlias(e.target.value)}
              />
            </div>
            <button
              className="w-full bg-orange-500 text-white p-2 rounded mt-4 hover:bg-orange-600"
              onClick={handleCreateAccount}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Create"}
            </button>
          </>
        )}
        {currentForm === "transaction" && (
          <>
            <div className="mb-4">
              <label className="block text-gray-300">Sender:</label>
              <select
                className="w-full p-2 border border-gray-600 rounded mt-1 bg-gray-700 text-gray-300"
                value={sender}
                onChange={handleSenderChange}
              >
                <option value="">Select Sender</option>
                {keypairs.map((kp) => (
                  <option key={kp.id} value={kp.publicKey}>
                    {kp.alias}
                  </option>
                ))}
              </select>
              {sender && (
                <p className="mt-2 text-gray-300">Balance: {senderBalance} XLM</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-gray-300">Receiver:</label>
              <select
                className="w-full p-2 border border-gray-600 rounded mt-1 bg-gray-700 text-gray-300"
                value={receiver}
                onChange={handleReceiverChange}
              >
                <option value="">Select Receiver</option>
                {keypairs.map((kp) => (
                  <option key={kp.id} value={kp.publicKey}>
                    {kp.alias}
                  </option>
                ))}
              </select>
              {receiver && (
                <p className="mt-2 text-gray-300">Balance: {receiverBalance} XLM</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-gray-300">Amount:</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-600 rounded mt-1 bg-gray-700 text-gray-300"
                value={amount}
                onChange={handleAmountChange}
              />
            </div>
            <button
              className="w-full bg-orange-500 text-white p-2 rounded mt-4 hover:bg-orange-600"
              onClick={handleTransaction}
            >
              Transfer
            </button>
          </>
        )}
      </div>
      <button
        className="text-orange-500 underline mt-4"
        onClick={() => setShowKeypairs(!showKeypairs)}
      >
        {showKeypairs ? "Hide Accounts" : "Show Accounts"}
      </button>
      {showKeypairs && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-2xl">
            <h2 className="text-3xl font-bold mb-6 text-center text-orange-500">Accounts</h2>
            <div className="bg-gray-700 p-4 rounded mt-2 text-gray-300 text-sm whitespace-pre-wrap break-words">
              {keypairs.map((kp) => (
                <div key={kp.publicKey} className="mb-4">
                  <p className="text-lg font-bold text-orange-500">{kp.alias}</p>
                  <p><strong>Public Key:</strong> {kp.publicKey}</p>
                  <p>
                    <strong>Balance:</strong> {kp.showBalance ? kp.balance : "*****"} XLM
                    <button
                      className="ml-2 text-orange-500"
                      onClick={() => {
                        if (!kp.showBalance) {
                          fetchAndSetBalance(kp.publicKey);
                        }
                        toggleBalanceVisibility(kp.publicKey);
                      }}
                    >
                      <FontAwesomeIcon icon={kp.showBalance ? faEyeSlash : faEye} />
                    </button>
                  </p>
                </div>
              ))}
            </div>
            <button
              className="w-full bg-orange-500 text-white p-2 rounded mt-4 hover:bg-orange-600"
              onClick={() => setShowKeypairs(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showModal && (
        <Modal
          message={resultMessage}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
