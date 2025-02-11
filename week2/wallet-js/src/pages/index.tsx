import { useState } from "react";
import StellarSdk from "@stellar/stellar-sdk";
import { decryptData, encryptData } from "@/lib/keyStore";
import { Sparkles, Key, Coins, Send } from "lucide-react";

export default function Home() {
  const [password, setPassword] = useState("");
  const [createdKey, setCreatedKey] = useState("");
  const [encryptedSecret, setEncryptedSecret] = useState("");
  const [balance, setBalance] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [sourcePublicKey, setSourcePublicKey] = useState("");
  const [message, setMessage] = useState("");
  const [keys, setKeys] = useState<string[]>([]);

  const URL_NODE_STELLAR = "http://172.233.19.77:8000";
  
  // CREATE KEY
  
  const createKey = () => {
	  if (!password) {
		  setMessage("Please enter a password to encrypt the secret key.");
      return;
    }
    const keypair = StellarSdk.Keypair.random();
    const encrypted = encryptData(keypair.secret(), password);
    const pubKey = keypair.publicKey();
	
    setCreatedKey(pubKey);
    setEncryptedSecret(encrypted);
    setKeys((prev) => [...prev, pubKey]);
    setMessage("Key created successfully!");
};

// FUND WALLET

const fundWallet = async () => {
	if (!createdKey) {
		setMessage("No wallet created. Please generate a key first.");
		return;
    }
    try {
		//
		const response = await fetch(
			`${URL_NODE_STELLAR}/friendbot?addr=${createdKey}`
		);
		const data = await response.json();
		if (response.ok) {
			setMessage(
				`Account funded successfully!<br>Transaction hash: ${data.hash}`
			);
		} else {
        setMessage("Error funding account.");
	}
} catch (error) {
	console.error(error);
	setMessage("Error funding account.");
}
};

// CHECK BALANCE

const checkBalance = async () => {
	if (!publicKey) {
		setMessage("Please enter a public key to check balance.");
		return;
    }
    try {
		const res = await fetch(`${URL_NODE_STELLAR}/accounts/${publicKey}`);
		const data = await res.json();
		if (res.ok) {
			setBalance(data.balances[0].balance);
		} else {
			setMessage("Error: " + data.error);
		}
    } catch (error) {
		console.error(error);
		setMessage("Error checking balance.");
    }
};

// SEND TRANSACTION

const sendTransaction = async () => {
    if (!sourcePublicKey || !password || !destination || !amount) {
      setMessage("All fields are required.");
      return;
    }

    try {
      // Recupera a chave secreta descriptografando com a senha
      const secretKey = decryptData(sourcePublicKey, password);
      if (!secretKey) {
        setMessage("Invalid password or no secret key found.");
        return;
      }

      // Obtém a conta do remetente
      const server = new StellarSdk.Server(URL_NODE_STELLAR);
      const account = await server.loadAccount(sourcePublicKey);
      console.log(account, "::: KEY:::");
      // Construção da transação
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: "Standalone Network ; February 2017",
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: destination,
            asset: StellarSdk.Asset.native(),
            amount: amount,
          })
        )
        .setTimeout(30)
        .build();

      // Assina a transação com a chave secreta
      // Assina a transação com a chave secreta
      const keypair = StellarSdk.Keypair.fromSecret(secretKey);
      console.log(keypair, "::: SECRET KEY :::");

      // Prepara a requisição JSON-RPC
      const requestBody = {
        jsonrpc: "2.0",
        id: 8675309,
        method: "sendTransaction",
        params: {
          transaction: transaction.toXDR(), // Transação no formato base64
        },
      };

      // Envia a transação via JSON-RPC
      const res = await fetch(`${URL_NODE_STELLAR}/rpc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      console.log(data, "::: DATA TX :::");

      if (res.ok && data.result) {
        setMessage("Transaction sent successfully! Hash: " + data.result.hash);
      } else {
        setMessage("Error: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      setMessage("Error sending transaction.");
    }
  };

  //	Render

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-900 via-purple-900 to-black text-purple-500 font-mono">
      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/image.png')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-purple-500 to-yellow-500 flex items-center justify-center gap-4">
            <span className="text-4xl">ハッシュ</span> {/* Dragon character */}
            HashWarriors
            <span className="text-4xl">武</span> {/* Warrior character */}
          </h1>
          <p className="text-cyan-400 text-lg">dojo-stellar week#2</p>
          {/* Create Wallet Section */}
          <div className="bg-black bg-opacity-60 backdrop-blur-lg rounded-xl p-8 mb-8 border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
            <div className="flex items-center gap-4 mb-6">
              <Key className="text-yellow-500" size={24} />
              <h2 className="text-2xl font-bold text-yellow-400">
                Create New Wallet
              </h2>
            </div>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-yellow-500/30 rounded-lg px-4 py-2 text-cyan-400 focus:outline-none focus:border-yellow-500"
              />
              <button
                onClick={createKey}
                className="w-full bg-gradient-to-r from-cyan-600 to-purple-800 hover:from-cyan-700 hover:to-purple-900 text-white py-3 rounded-lg font-semibold transition-all duration-300"
              >
                Generate Keypair
              </button>
              {createdKey && (
                <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-yellow-500/30">
                  <p className="text-sm text-cyan-400 break-all">
                    New Public Key: {createdKey}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Fund Wallet Button */}
          <button
            onClick={fundWallet}
            disabled={!createdKey}
            className={`w-full mb-8 flex items-center justify-center gap-2 py-4 rounded-lg font-bold transition-all duration-300 ${
              createdKey
                ? "bg-gradient-to-r from-yellow-500 to-purple-500 text-black hover:from-yellow-600 hover:to-purple-600"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Coins size={24} />
            Fund Wallet
          </button>
          {/* Message Display */}
          {message && (
            <div className="bg-black bg-opacity-60 backdrop-blur-lg rounded-xl p-6 border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
              <p
                className="text-center text-cyan-400"
                dangerouslySetInnerHTML={{ __html: message }}
              />
            </div>
          )}
        </div>
        {/* Check Balance Section */}
        <div className="bg-black bg-opacity-60 backdrop-blur-lg rounded-xl p-8 mb-8 border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
          <div className="flex items-center gap-4 mb-6">
            <Sparkles className="text-yellow-500" size={24} />
            <h2 className="text-2xl font-bold text-yellow-400">
              Check Balance
            </h2>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Public Key"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              className="w-full bg-gray-900 border border-yellow-500/30 rounded-lg px-4 py-2 text-cyan-400 focus:outline-none focus:border-yellow-500"
            />
            <button
              onClick={checkBalance}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-800 hover:from-cyan-700 hover:to-blue-900 text-white py-3 rounded-lg font-semibold transition-all duration-300"
            >
              Check Balance!
            </button>
            {balance && (
              <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-red-500/30">
                <p className="text-xl text-cyan-400 text-center">
                  {balance} XLM
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Send Transaction Section */}
        <div className="bg-black bg-opacity-60 backdrop-blur-lg rounded-xl p-8 mb-8 border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
          <div className="flex items-center gap-4 mb-6">
            <Send className="text-yellow-500" size={24} />
            <h2 className="text-2xl font-bold text-yellow-400">
              Send Transaction
            </h2>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Source Public Key"
              value={sourcePublicKey}
              onChange={(e) => setSourcePublicKey(e.target.value)}
              className="w-full bg-gray-900 border border-yellow-500/30 rounded-lg px-4 py-2 text-cyan-400 focus:outline-none focus:border-yellow-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-yellow-500/30 rounded-lg px-4 py-2 text-cyan-400 focus:outline-none focus:border-yellow-500"
            />
            <input
              type="text"
              placeholder="Destination Key"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-gray-900 border border-yellow-500/30 rounded-lg px-4 py-2 text-cyan-400 focus:outline-none focus:border-yellow-500"
            />
            <input
              type="text"
              placeholder="Amount in XLM"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-900 border border-yellow-500/30 rounded-lg px-4 py-2 text-cyan-400 focus:outline-none focus:border-yellow-500"
            />
            <button
              onClick={sendTransaction}
              className="w-full bg-gradient-to-r from-yellow-600 to-purple-800 hover:from-yellow-700 hover:to-purple-900 text-white py-3 rounded-lg font-semibold transition-all duration-300"
            >
              Send Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
