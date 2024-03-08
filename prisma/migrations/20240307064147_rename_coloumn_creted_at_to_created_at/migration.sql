/*
  Warnings:

  - You are about to drop the column `cretedAt` on the `issue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "issue" DROP COLUMN "cretedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
