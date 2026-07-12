-- AlterTable
ALTER TABLE "drivers" ADD COLUMN     "safety_score" INTEGER NOT NULL DEFAULT 100;

-- AlterTable
ALTER TABLE "trips" ADD COLUMN     "cargo_weight" INTEGER;
