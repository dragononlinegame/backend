-- CreateEnum
CREATE TYPE "profit_type" AS ENUM ('Daily', 'Weekly', 'Monthly');

-- CreateTable
CREATE TABLE "profit" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "betAmount" DECIMAL(65,30) NOT NULL,
    "winAmount" DECIMAL(65,30) NOT NULL,
    "profitAmount" DECIMAL(65,30) NOT NULL,
    "type" "profit_type" NOT NULL DEFAULT 'Daily',

    CONSTRAINT "profit_pkey" PRIMARY KEY ("id")
);
