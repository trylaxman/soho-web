-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'PROFESSIONAL', 'ADMIN');

-- CreateEnum
CREATE TYPE "CleaningType" AS ENUM ('STANDARD', 'DEEP', 'MOVE_IN_MOVE_OUT', 'RECURRING', 'AIRBNB_TURNOVER');

-- CreateEnum
CREATE TYPE "CleaningFrequency" AS ENUM ('ONE_TIME', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'ASSIGNED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "address" TEXT,
    "apartment" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "cleaningType" "CleaningType" NOT NULL,
    "homeSize" TEXT NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "preferredDate" TIMESTAMP(3),
    "preferredTime" TEXT,
    "frequency" "CleaningFrequency" NOT NULL,
    "specialNotes" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");

-- CreateIndex
CREATE INDEX "Booking_userProfileId_idx" ON "Booking"("userProfileId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_cleaningType_idx" ON "Booking"("cleaningType");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
