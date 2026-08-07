/*
  This migration preserves existing Payment.amount values by copying them
  into Payment.authorizedAmount before dropping the old amount column.
*/

-- CreateEnum
CREATE TYPE "AdditionalAuthorizationStatus" AS ENUM (
    'PENDING',
    'AUTHORIZED',
    'EXPIRED',
    'CANCELLED'
);

-- Add new Payment columns without removing the existing amount column yet
ALTER TABLE "Payment"
ADD COLUMN "authorizedAmount" DOUBLE PRECISION,
ADD COLUMN "capturedAmount" DOUBLE PRECISION,
ADD COLUMN "isAdditionalAuthorization" BOOLEAN NOT NULL DEFAULT false;

-- Preserve existing payment data
UPDATE "Payment"
SET "authorizedAmount" = "amount";

-- Existing PAID payments were already captured, so preserve that history
UPDATE "Payment"
SET "capturedAmount" = "amount"
WHERE "status" = 'PAID';

-- Make authorizedAmount required after existing rows have been populated
ALTER TABLE "Payment"
ALTER COLUMN "authorizedAmount" SET NOT NULL;

-- Remove the obsolete column only after its values have been migrated
ALTER TABLE "Payment"
DROP COLUMN "amount";

-- CreateTable
CREATE TABLE "AdditionalAuthorization" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "additionalAmount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "status" "AdditionalAuthorizationStatus" NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "authorizedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdditionalAuthorization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdditionalAuthorization_token_key"
ON "AdditionalAuthorization"("token");

-- CreateIndex
CREATE INDEX "AdditionalAuthorization_bookingId_idx"
ON "AdditionalAuthorization"("bookingId");

-- CreateIndex
CREATE INDEX "AdditionalAuthorization_status_idx"
ON "AdditionalAuthorization"("status");

-- AddForeignKey
ALTER TABLE "AdditionalAuthorization"
ADD CONSTRAINT "AdditionalAuthorization_bookingId_fkey"
FOREIGN KEY ("bookingId")
REFERENCES "Booking"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdditionalAuthorization"
ADD CONSTRAINT "AdditionalAuthorization_paymentId_fkey"
FOREIGN KEY ("paymentId")
REFERENCES "Payment"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;