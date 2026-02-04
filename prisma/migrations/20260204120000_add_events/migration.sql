-- CreateTable
CREATE TABLE "EventRoundtable" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "location" TEXT,
    "schedule_note" TEXT,

    CONSTRAINT "EventRoundtable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRoundtableSession" (
    "id" TEXT NOT NULL,
    "roundtable_id" TEXT NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER,
    "remaining" INTEGER,
    "is_full" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER,

    CONSTRAINT "EventRoundtableSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventExhibition" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "author" TEXT,
    "image_url" TEXT,
    "image_thumb_url" TEXT,
    "sort_order" INTEGER,

    CONSTRAINT "EventExhibition_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventRoundtableSession" ADD CONSTRAINT "EventRoundtableSession_roundtable_id_fkey" FOREIGN KEY ("roundtable_id") REFERENCES "EventRoundtable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
