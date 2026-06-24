/*
  Warnings:

  - A unique constraint covering the columns `[idDocumentReuploadToken]` on the table `ProfessionalProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProfessionalIdDocumentType" AS ENUM ('NATIONAL_ID', 'PASSPORT');

-- CreateEnum
CREATE TYPE "ProfessionalIdDocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REUPLOAD_REQUESTED');

-- AlterTable
ALTER TABLE "ProfessionalProfile" ADD COLUMN     "idDocumentBackUrl" TEXT,
ADD COLUMN     "idDocumentFrontUrl" TEXT,
ADD COLUMN     "idDocumentReuploadExpiresAt" TIMESTAMP(3),
ADD COLUMN     "idDocumentReuploadToken" TEXT,
ADD COLUMN     "idDocumentStatus" "ProfessionalIdDocumentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "idDocumentType" "ProfessionalIdDocumentType";

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalProfile_idDocumentReuploadToken_key" ON "ProfessionalProfile"("idDocumentReuploadToken");
