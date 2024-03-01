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
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bankDetail_walletId_key" ON "bankDetail"("walletId");

-- AddForeignKey
ALTER TABLE "bankDetail" ADD CONSTRAINT "bankDetail_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
