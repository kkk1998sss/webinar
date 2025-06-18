-- AlterTable
ALTER TABLE "WebinarDetails" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paidAmount" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "WebinarSettings" ADD COLUMN     "isLive" BOOLEAN NOT NULL DEFAULT false;
