/*
  Warnings:

  - You are about to drop the `KeyPair` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "KeyPair";

-- CreateTable
CREATE TABLE "Keypair" (
    "id" SERIAL NOT NULL,
    "privateKey" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,

    CONSTRAINT "Keypair_pkey" PRIMARY KEY ("id")
);
