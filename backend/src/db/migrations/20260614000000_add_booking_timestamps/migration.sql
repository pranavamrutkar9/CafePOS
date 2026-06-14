-- Add createdAt and updatedAt timestamps to Booking
-- Use DEFAULT CURRENT_TIMESTAMP so existing rows get a valid value

ALTER TABLE "Booking" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Booking" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
