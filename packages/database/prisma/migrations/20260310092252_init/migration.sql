/*
  Warnings:

  - You are about to drop the column `societe` on the `Visiteur` table. All the data in the column will be lost.
  - Added the required column `id_entreprise` to the `Visiteur` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Visiteur" DROP COLUMN "societe",
ADD COLUMN     "id_entreprise" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Visiteur" ADD CONSTRAINT "Visiteur_id_entreprise_fkey" FOREIGN KEY ("id_entreprise") REFERENCES "Entreprise"("id_entreprise") ON DELETE RESTRICT ON UPDATE CASCADE;
