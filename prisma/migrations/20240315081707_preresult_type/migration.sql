/*
  Warnings:

  - Added the required column `type` to the `predefinedResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "predefinedResult" ADD COLUMN     "type" INTEGER NOT NULL;
