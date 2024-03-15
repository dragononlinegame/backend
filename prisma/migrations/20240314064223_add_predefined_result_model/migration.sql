-- AlterTable
ALTER TABLE "event" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "predefinedResult" (
    "id" SERIAL NOT NULL,
    "serial" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "predefinedResult_pkey" PRIMARY KEY ("id")
);
