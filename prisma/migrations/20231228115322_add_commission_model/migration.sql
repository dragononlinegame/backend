-- CreateEnum
CREATE TYPE "commission_type" AS ENUM ('LevelIncome', 'DailyIncome', 'SponsorIncome');

-- CreateTable
CREATE TABLE "commission" (
    "id" SERIAL NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "fromId" INTEGER NOT NULL,
    "toId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "type" "commission_type" NOT NULL DEFAULT 'LevelIncome',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "commission_fromId_idx" ON "commission"("fromId");
