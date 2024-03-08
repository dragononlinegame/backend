/*
  Warnings:

  - Added the required column `bankDetail` to the `withdrawal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "withdrawal" ADD COLUMN     "bankDetail" JSONB NOT NULL;
