/*
  Warnings:

  - The values [STANDARD,DEEP] on the enum `CleaningType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[checkoutSessionId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CleaningType_new" AS ENUM ('SOHO_SIGNATURE', 'SOHO_SIGNATURE_DEEP', 'MOVE_IN_MOVE_OUT', 'RECURRING', 'AIRBNB_TURNOVER');
ALTER TABLE "Booking" ALTER COLUMN "cleaningType" TYPE "CleaningType_new" USING ("cleaningType"::text::"CleaningType_new");
ALTER TYPE "CleaningType" RENAME TO "CleaningType_old";
ALTER TYPE "CleaningType_new" RENAME TO "CleaningType";
DROP TYPE "public"."CleaningType_old";
COMMIT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_checkoutSessionId_key" ON "Payment"("checkoutSessionId");
