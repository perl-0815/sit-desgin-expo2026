-- CreateTable
CREATE TABLE "Lab" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "official_name" TEXT,
    "instructor" TEXT,
    "course" TEXT,
    "tagline" TEXT,
    "keywords" TEXT,
    "description" TEXT,

    CONSTRAINT "Lab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "student_no" TEXT,
    "name" TEXT,
    "name_kana" TEXT,
    "lab_id" TEXT,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Career" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "category" TEXT,
    "detail" TEXT,
    "job_type" TEXT,
    "decision_reason" TEXT,
    "extra_notes" TEXT,
    "visibility" TEXT,

    CONSTRAINT "Career_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "title1" TEXT,
    "summary1" TEXT,
    "image1_url" TEXT,
    "image1_thumb_url" TEXT,
    "appeal_url_1" TEXT,
    "title2" TEXT,
    "image2_url" TEXT,
    "image2_thumb_url" TEXT,
    "summary2" TEXT,
    "appeal_url_2" TEXT,
    "overall_portfolio_url" TEXT,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Research" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "title" TEXT,
    "image_url" TEXT,
    "image_thumb_url" TEXT,
    "summary" TEXT,
    "motivation" TEXT,
    "keywords" TEXT,
    "lab_relation" TEXT,
    "favorite_place" TEXT,
    "fun_in_research" TEXT,
    "fun_outside_research" TEXT,
    "hard_episode" TEXT,
    "break_time" TEXT,
    "all_nighter_count" TEXT,
    "want_to_continue" TEXT,

    CONSTRAINT "Research_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Overview" (
    "id" SERIAL NOT NULL,
    "key_visual_mobile" TEXT,
    "key_visual_pc" TEXT,
    "about" TEXT,
    "concept_name" TEXT,
    "concept_description" TEXT,
    "map_url_1" TEXT,
    "map_url2" TEXT,
    "contact_email" TEXT,
    "contact_form_url" TEXT,

    CONSTRAINT "Overview_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "Lab"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Career" ADD CONSTRAINT "Career_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Research" ADD CONSTRAINT "Research_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
