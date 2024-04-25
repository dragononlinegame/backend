/*
  Warnings:

  - Added the required column `receiverId` to the `request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "request" ADD COLUMN     "receiverId" INTEGER NOT NULL;
