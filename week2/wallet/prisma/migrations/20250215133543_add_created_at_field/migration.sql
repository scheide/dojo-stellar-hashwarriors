/*
  Warnings:

  - A unique constraint covering the columns `[alias]` on the table `Keypair` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `alias` to the `Keypair` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Keypair" ADD COLUMN     "alias" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Keypair_alias_key" ON "Keypair"("alias");
