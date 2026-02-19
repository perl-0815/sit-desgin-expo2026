-- AlterTable
ALTER TABLE "EventRoundtableSession"
ADD COLUMN "reception_start_at" TIMESTAMP(3),
ADD COLUMN "location" TEXT,
ADD COLUMN "booking_form_url" TEXT;
