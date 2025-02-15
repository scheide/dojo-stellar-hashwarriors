/*
  Warnings:

  - You are about to drop the column `privateKey` on the `Keypair` table. All the data in the column will be lost.
  - Added the required column `secret` to the `Keypair` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Keypair" DROP COLUMN "privateKey",
ADD COLUMN     "secret" TEXT NOT NULL;
