import { PrismaClient } from "@prisma/client";
import * as StellarSdk from "@stellar/stellar-sdk";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { alias } = req.body;

    try {
      // Generate a new keypair
      const newKeypair = StellarSdk.Keypair.random();

      // Save the keypair with alias in the database
      const savedKeypair = await prisma.keypair.create({
        data: {
          alias: alias,
          publicKey: newKeypair.publicKey(),
          secret: newKeypair.secret(),
        },
      });
      
      // Fund the new Stellar account
      const fundAccount = async (publicKey: string) => {
        const friendbotUrl = `https://friendbot.stellar.org?addr=${publicKey}`;
        try {
          const response = await fetch(friendbotUrl);
          if (response.ok) {
            console.log(`Successfully funded account: ${publicKey}`);
          } else {
            console.error(`Failed to fund account: ${publicKey}`);
          }
        } catch (error: any) {
          if (error.code === 'P2002' && error.meta?.target?.includes('alias')) {
            return res.status(400).json({ error: 'Alias already exists. Please choose a different alias.' });
          }
          return res.status(500).json({ error: error.message });
        }
      };
      await fundAccount(newKeypair.publicKey());          

      return res.status(200).json({ savedKeypair });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}