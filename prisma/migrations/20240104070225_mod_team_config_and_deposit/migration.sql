/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `deposit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reference` to the `deposit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "deposit" ADD COLUMN     "reference" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "deposit_reference_key" ON "deposit"("reference");

-- AddForeignKey
ALTER TABLE "teamConfig" ADD CONSTRAINT "teamConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
