-- CreateEnum
CREATE TYPE "request_status" AS ENUM ('Paid', 'Declined', 'Pending');

-- CreateTable
CREATE TABLE "connection" (
    "id" SERIAL NOT NULL,
    "userOne" INTEGER NOT NULL,
    "userTwo" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request" (
    "id" BIGSERIAL NOT NULL,
    "connectionId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "note" TEXT,
    "status" "request_status" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
