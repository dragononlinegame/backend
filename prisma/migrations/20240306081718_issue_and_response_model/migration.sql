-- CreateEnum
CREATE TYPE "issue_type" AS ENUM ('Deposit', 'Withdrawal', 'Other');

-- CreateTable
CREATE TABLE "issue" (
    "id" SERIAL NOT NULL,
    "cretedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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

-- AddForeignKey
ALTER TABLE "issue" ADD CONSTRAINT "issue_userid_fkey" FOREIGN KEY ("userid") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
