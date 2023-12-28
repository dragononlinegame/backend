/*
  Warnings:

  - The values [Suspended] on the enum `userStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "userStatus_new" AS ENUM ('Active', 'Inactive');
ALTER TABLE "user" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "status" TYPE "userStatus_new" USING ("status"::text::"userStatus_new");
ALTER TYPE "userStatus" RENAME TO "userStatus_old";
ALTER TYPE "userStatus_new" RENAME TO "userStatus";
DROP TYPE "userStatus_old";
ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT 'Active';
COMMIT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false;
