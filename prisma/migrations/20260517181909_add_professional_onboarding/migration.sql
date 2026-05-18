-- CreateEnum
CREATE TYPE "ProfessionalStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "ProfessionalProfile" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "experienceYears" INTEGER,
    "servicesOffered" TEXT[],
    "serviceAreas" TEXT[],
    "availability" TEXT[],
    "hasOwnSupplies" BOOLEAN NOT NULL DEFAULT false,
    "hasTransport" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "status" "ProfessionalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessionalProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalProfile_email_key" ON "ProfessionalProfile"("email");

-- CreateIndex
CREATE INDEX "ProfessionalProfile_status_idx" ON "ProfessionalProfile"("status");
