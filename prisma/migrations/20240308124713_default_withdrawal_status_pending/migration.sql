-- AlterEnum
ALTER TYPE "status" ADD VALUE 'Staged';

-- AlterTable
ALTER TABLE "withdrawal" ALTER COLUMN "status" SET DEFAULT 'Pending';
