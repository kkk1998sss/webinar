-- CreateTable
CREATE TABLE "EBook" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "fileType" TEXT,
    "thumbnail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "downloads" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EBook_pkey" PRIMARY KEY ("id")
);
