-- AlterTable
ALTER TABLE "User" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "GdprAccessLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GdprAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GdprAccessLog_actorId_idx" ON "GdprAccessLog"("actorId");

-- CreateIndex
CREATE INDEX "GdprAccessLog_targetUserId_idx" ON "GdprAccessLog"("targetUserId");

-- CreateIndex
CREATE INDEX "GdprAccessLog_createdAt_idx" ON "GdprAccessLog"("createdAt");
