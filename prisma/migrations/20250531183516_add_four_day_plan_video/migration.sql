-- AlterTable
ALTER TABLE "EBook" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "FourDayPlanVideo" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "videoUrl" TEXT,
    "day" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FourDayPlanVideo_pkey" PRIMARY KEY ("id")
);
