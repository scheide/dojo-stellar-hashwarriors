import { PrismaClient } from "@prisma/client";
import * as StellarSdk from "@stellar/stellar-sdk";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { sender, receiver, amount } = req.body;

    try {
      // Fetch sender and receiver keypairs
      const senderKeypair = await prisma.keypair.findFirst({
        where: { publicKey: sender },
      });
      if (!senderKeypair) {
        return res.status(404).json({ error: "Sender keypair not found" });
      }

      const receiverKeypair = await prisma.keypair.findFirst({
        where: { publicKey: receiver },
      });
      if (!receiverKeypair) {
        return res.status(404).json({ error: "Receiver keypair not found" });
      }

      // Initialize StellarSdk server
      const server = new StellarSdk.Horizon.Server(
        "https://horizon-testnet.stellar.org"
      );

      // Load sender account
      const senderAccount = await server.loadAccount(senderKeypair.publicKey);

      //
      const transaction = new StellarSdk.TransactionBuilder(senderAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: receiverKeypair.publicKey,
            asset: StellarSdk.Asset.native(),
            amount: amount, // Amount to transfer
          })
        )
        .setTimeout(300)
        .build();

      // Sign transaction
      const signKeypair = StellarSdk.Keypair.fromSecret(senderKeypair.secret);
      transaction.sign(signKeypair);

      // Submit transaction
      const transactionResult = await server.submitTransaction(transaction);
      return res.status(200).json({ transactionResult });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      } else {
        return res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
