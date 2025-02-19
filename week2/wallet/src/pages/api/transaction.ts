import { PrismaClient } from "@prisma/client";
import * as StellarSdk from "@stellar/stellar-sdk";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { sender, receiver, amount } = req.body;

    try {
      const senderKeypair = StellarSdk.Keypair.fromSecret(sender);
      const receiverKeypair = await prisma.keypair.findFirst({
        where: { publicKey: receiver },
      });

      if (!receiverKeypair) {
        return res.status(404).json({ error: "Receiver keypair not found" });
      }

      const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
      const senderAccount = await server.loadAccount(senderKeypair.publicKey());
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

      // Sign the transaction
      transaction.sign(senderKeypair);

      // Submit the transaction
      const transactionResult = await server.submitTransaction(transaction);
      return res.status(200).json({ transactionResult });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}