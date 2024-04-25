/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `franchise` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `franchise` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "franchise_phone_key" ON "franchise"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "franchise_email_key" ON "franchise"("email");
