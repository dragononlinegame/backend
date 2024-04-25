/*
  Warnings:

  - You are about to drop the column `receiverId` on the `request` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "connection" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "request" DROP COLUMN "receiverId";
