/*
  Warnings:

  - You are about to drop the column `userId` on the `connection` table. All the data in the column will be lost.
  - You are about to drop the column `userOne` on the `connection` table. All the data in the column will be lost.
  - You are about to drop the column `userTwo` on the `connection` table. All the data in the column will be lost.
  - Added the required column `userOneId` to the `connection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userTwoId` to the `connection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "connection" DROP COLUMN "userId",
DROP COLUMN "userOne",
DROP COLUMN "userTwo",
ADD COLUMN     "userOneId" INTEGER NOT NULL,
ADD COLUMN     "userTwoId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "connection" ADD CONSTRAINT "connection_userOneId_fkey" FOREIGN KEY ("userOneId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connection" ADD CONSTRAINT "connection_userTwoId_fkey" FOREIGN KEY ("userTwoId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
