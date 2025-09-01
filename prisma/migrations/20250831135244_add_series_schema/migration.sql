-- CreateTable
CREATE TABLE "Series" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "totalVideos" INTEGER NOT NULL DEFAULT 0,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeriesVideo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT NOT NULL,
    "thumbnail" TEXT,
    "duration" INTEGER,
    "orderIndex" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "seriesId" TEXT NOT NULL,

    CONSTRAINT "SeriesVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SeriesVideo_seriesId_orderIndex_idx" ON "SeriesVideo"("seriesId", "orderIndex");

-- AddForeignKey
ALTER TABLE "SeriesVideo" ADD CONSTRAINT "SeriesVideo_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;
