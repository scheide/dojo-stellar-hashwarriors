import { PrismaClient } from "@prisma/client";
import * as StellarSdk from "@stellar/stellar-sdk";

export default async function Home() {
  const prisma = new PrismaClient();

  // Generate keypairs for sender and receiver
  const senderKeypair = StellarSdk.Keypair.random();
  const receiverKeypair = StellarSdk.Keypair.random();
  console.log("Sender Secret:", senderKeypair.secret());
  console.log("Sender Public Key:", senderKeypair.publicKey());
  console.log("Receiver Public Key:", receiverKeypair.publicKey());

  // Function to fund an account using Friendbot
  const fundAccount = async (publicKey: string) => {
    const friendbotUrl = `https://friendbot.stellar.org?addr=${publicKey}`;
    try {
      const response = await fetch(friendbotUrl);
      if (response.ok) {
        console.log(`Successfully funded account: ${publicKey}`);
      } else {
        console.error(`Failed to fund account: ${publicKey}`);
      }
    } catch (error) {
      console.error(`Error funding account: ${error}`);
    }
  };

  await fundAccount(senderKeypair.publicKey());
  await fundAccount(receiverKeypair.publicKey());

  // Add the sender and receiver keypairs to the database
  // await prisma.keypair.create({
  //   data: {
  //     secret: senderKeypair.secret(),
  //     publicKey: senderKeypair.publicKey(),
  //   },
  // });

  // await prisma.keypair.create({
  //   data: {
  //     secret: receiverKeypair.secret(),
  //     publicKey: receiverKeypair.publicKey(),
  //   },
  // });

  // Create and submit a transaction to transfer funds from sender to receiver
  const server = new StellarSdk.Horizon.Server(
    "https://horizon-testnet.stellar.org"
  );
  try {
    const senderAccount = await server.loadAccount(senderKeypair.publicKey());
    const transaction = new StellarSdk.TransactionBuilder(senderAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: receiverKeypair.publicKey(),
          asset: StellarSdk.Asset.native(),
          amount: "10", // Amount to transfer
        })
      )
      .setTimeout(300)
      .build();

    // Sign the transaction
    transaction.sign(senderKeypair);

    // Submit the transaction
    const transactionResult = await server.submitTransaction(transaction);
    console.log("Transaction successful:", transactionResult);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Transaction failed:", error.response?.data || error.message);
    if (error.response?.data?.extras?.result_codes) {
      console.error("Result Codes:", error.response.data.extras.result_codes);
    }
  }

  // Fetch all keypairs from the database
  const allKeypairs = await prisma.keypair.findMany();

  return (
    <div className="grid items-center justify-items-center p-8">
      Keypairs:
      <pre>{JSON.stringify(allKeypairs, null, 2)}</pre>
    </div>
  );
}
