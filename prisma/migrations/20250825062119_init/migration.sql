-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "theme" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_year_key" ON "Event"("year");
