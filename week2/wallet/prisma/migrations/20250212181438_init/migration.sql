/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "Wallet" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);
