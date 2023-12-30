-- CreateTable
CREATE TABLE "deposit" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    "amount" DECIMAL(65,30) NOT NULL,
    "method" TEXT NOT NULL,
    "status" "status" NOT NULL DEFAULT 'Completed',
    "walletId" INTEGER NOT NULL,

    CONSTRAINT "withdrawal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "deposit" ADD CONSTRAINT "deposit_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawal" ADD CONSTRAINT "withdrawal_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
