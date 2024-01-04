/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `withdrawal` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reference` to the `withdrawal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "withdrawal" ADD COLUMN     "reference" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "withdrawal_reference_key" ON "withdrawal"("reference");
