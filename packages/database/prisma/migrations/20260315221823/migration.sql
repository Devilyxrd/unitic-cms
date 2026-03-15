/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Entry` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order` to the `ContentField` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `ContentField` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ContentType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ContentField" DROP CONSTRAINT "ContentField_contentTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Entry" DROP CONSTRAINT "Entry_contentTypeId_fkey";

-- DropForeignKey
ALTER TABLE "EntryValue" DROP CONSTRAINT "EntryValue_entryId_fkey";

-- DropForeignKey
ALTER TABLE "EntryValue" DROP CONSTRAINT "EntryValue_fieldId_fkey";

-- AlterTable
ALTER TABLE "ContentField" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ContentType" ADD COLUMN     "description" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Entry" ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "EntryValue" ADD COLUMN     "mediaId" TEXT,
ALTER COLUMN "value" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "ContentField_contentTypeId_idx" ON "ContentField"("contentTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Entry_slug_key" ON "Entry"("slug");

-- CreateIndex
CREATE INDEX "Entry_contentTypeId_idx" ON "Entry"("contentTypeId");

-- CreateIndex
CREATE INDEX "EntryValue_entryId_idx" ON "EntryValue"("entryId");

-- AddForeignKey
ALTER TABLE "ContentField" ADD CONSTRAINT "ContentField_contentTypeId_fkey" FOREIGN KEY ("contentTypeId") REFERENCES "ContentType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_contentTypeId_fkey" FOREIGN KEY ("contentTypeId") REFERENCES "ContentType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryValue" ADD CONSTRAINT "EntryValue_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryValue" ADD CONSTRAINT "EntryValue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "ContentField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryValue" ADD CONSTRAINT "EntryValue_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
