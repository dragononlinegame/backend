/*
  Warnings:

  - Added the required column `phone` to the `franchise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "franchise" ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL;
