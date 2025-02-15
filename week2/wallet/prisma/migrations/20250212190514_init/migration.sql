/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Wallet` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "Wallet";

-- CreateTable
CREATE TABLE "KeyPair" (
    "id" SERIAL NOT NULL,
    "privateKey" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,

    CONSTRAINT "KeyPair_pkey" PRIMARY KEY ("id")
);
