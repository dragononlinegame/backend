/*
  Warnings:

  - A unique constraint covering the columns `[referralCode]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `referralCode` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "referralCode" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "teamConfig" (
    "userId" INTEGER NOT NULL,
    "uplineId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "teamConfig_uplineId_idx" ON "teamConfig"("uplineId");

-- CreateIndex
CREATE INDEX "teamConfig_userId_idx" ON "teamConfig"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "teamConfig_userId_uplineId_key" ON "teamConfig"("userId", "uplineId");

-- CreateIndex
CREATE UNIQUE INDEX "user_referralCode_key" ON "user"("referralCode");
