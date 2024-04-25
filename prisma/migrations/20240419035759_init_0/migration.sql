-- CreateEnum
CREATE TYPE "roles" AS ENUM ('Admin', 'Franchise');

-- CreateEnum
CREATE TYPE "status" AS ENUM ('Pending', 'Completed', 'Failed', 'Staged');

-- CreateEnum
CREATE TYPE "userStatus" AS ENUM ('Active', 'Inactive');

-- CreateEnum
CREATE TYPE "transactionType" AS ENUM ('Credit', 'Debit');

-- CreateEnum
CREATE TYPE "commission_type" AS ENUM ('LevelIncome', 'DailyIncome', 'SponsorIncome');

-- CreateEnum
CREATE TYPE "profit_type" AS ENUM ('Daily', 'Weekly', 'Monthly');

-- CreateEnum
CREATE TYPE "issue_type" AS ENUM ('Deposit', 'Withdrawal', 'Other');

-- CreateTable
CREATE TABLE "franchise" (
    "id" SERIAL NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "roles" NOT NULL DEFAULT 'Franchise',
    "franchiseCode" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "franchise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "franchiseCode" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "status" "userStatus" NOT NULL DEFAULT 'Active',
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teamConfig" (
    "userId" INTEGER NOT NULL,
    "uplineId" INTEGER NOT NULL,
    "franchiseCode" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "bankDetail" (
    "id" SERIAL NOT NULL,
    "walletId" INTEGER NOT NULL,
    "beneficiaryName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "branchIfscCode" TEXT NOT NULL,

    CONSTRAINT "bankDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "locked" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalBet" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalWin" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(65,30) NOT NULL,
    "type" "transactionType" NOT NULL DEFAULT 'Debit',
    "status" "status" NOT NULL DEFAULT 'Completed',
    "description" TEXT,
    "walletId" INTEGER NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deposit" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reference" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "method" TEXT NOT NULL,
    "status" "status" NOT NULL DEFAULT 'Completed',
    "walletId" INTEGER NOT NULL,

    CONSTRAINT "deposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawal" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reference" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "method" TEXT NOT NULL,
    "status" "status" NOT NULL DEFAULT 'Pending',
    "bankDetail" JSONB NOT NULL,
    "walletId" INTEGER NOT NULL,

    CONSTRAINT "withdrawal_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "game" (
    "id" SERIAL NOT NULL,
    "serial" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3) NOT NULL,
    "result" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predefinedResult" (
    "id" SERIAL NOT NULL,
    "type" INTEGER NOT NULL,
    "serial" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "predefinedResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bet" (
    "id" SERIAL NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "prediction" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gameId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "bet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "win" (
    "id" SERIAL NOT NULL,
    "winAmount" DECIMAL(65,30) NOT NULL,
    "isClaimed" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "betId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "win_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "issue_type" NOT NULL DEFAULT 'Deposit',
    "amount" TEXT,
    "ref" TEXT,
    "note" TEXT,
    "response" TEXT,
    "status" "status" NOT NULL DEFAULT 'Pending',
    "userid" INTEGER NOT NULL,

    CONSTRAINT "issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "responseBy" TEXT NOT NULL,
    "issueId" INTEGER NOT NULL,

    CONSTRAINT "response_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "franchise_franchiseId_key" ON "franchise"("franchiseId");

-- CreateIndex
CREATE UNIQUE INDEX "franchise_franchiseCode_key" ON "franchise"("franchiseCode");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_referralCode_key" ON "user"("referralCode");

-- CreateIndex
CREATE INDEX "teamConfig_uplineId_idx" ON "teamConfig"("uplineId");

-- CreateIndex
CREATE INDEX "teamConfig_userId_idx" ON "teamConfig"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "teamConfig_userId_uplineId_key" ON "teamConfig"("userId", "uplineId");

-- CreateIndex
CREATE UNIQUE INDEX "bankDetail_walletId_key" ON "bankDetail"("walletId");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_userId_key" ON "wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "deposit_reference_key" ON "deposit"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "withdrawal_reference_key" ON "withdrawal"("reference");

-- CreateIndex
CREATE INDEX "commission_fromId_idx" ON "commission"("fromId");

-- CreateIndex
CREATE UNIQUE INDEX "win_betId_key" ON "win"("betId");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_franchiseCode_fkey" FOREIGN KEY ("franchiseCode") REFERENCES "franchise"("franchiseCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamConfig" ADD CONSTRAINT "teamConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bankDetail" ADD CONSTRAINT "bankDetail_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposit" ADD CONSTRAINT "deposit_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawal" ADD CONSTRAINT "withdrawal_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bet" ADD CONSTRAINT "bet_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bet" ADD CONSTRAINT "bet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "win" ADD CONSTRAINT "win_betId_fkey" FOREIGN KEY ("betId") REFERENCES "bet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "win" ADD CONSTRAINT "win_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue" ADD CONSTRAINT "issue_userid_fkey" FOREIGN KEY ("userid") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
