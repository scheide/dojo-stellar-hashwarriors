import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const keypairs = await prisma.keypair.findMany({orderBy: {alias: "asc"}});
      res.status(200).json(keypairs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch keypairs" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}