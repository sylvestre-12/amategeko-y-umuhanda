/*
  Warnings:

  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `correct` on the `Question` table. All the data in the column will be lost.
  - Added the required column `correctAnswer` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."CorrectAnswer" DROP CONSTRAINT "CorrectAnswer_questionId_fkey";

-- AlterTable
ALTER TABLE "public"."CorrectAnswer" ALTER COLUMN "questionId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."Question" DROP CONSTRAINT "Question_pkey",
DROP COLUMN "correct",
ADD COLUMN     "correctAnswer" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Question_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Question_id_seq";

-- AddForeignKey
ALTER TABLE "public"."CorrectAnswer" ADD CONSTRAINT "CorrectAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
