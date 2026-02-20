/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RolePersonnel" AS ENUM ('Admin', 'Magasinier');

-- CreateEnum
CREATE TYPE "TypeActionLog" AS ENUM ('Entree', 'Sortie', 'Refus', 'Ouverture_Manuelle');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Entreprise" (
    "id_entreprise" SERIAL NOT NULL,
    "nom_entreprise" VARCHAR(100) NOT NULL,
    "numero_contact" VARCHAR(20) NOT NULL,

    CONSTRAINT "Entreprise_pkey" PRIMARY KEY ("id_entreprise")
);

-- CreateTable
CREATE TABLE "Livreur" (
    "id_livreur" SERIAL NOT NULL,
    "id_entreprise" INTEGER NOT NULL,
    "nom_chiffre" BYTEA NOT NULL,
    "prenom_chiffre" BYTEA NOT NULL,
    "charte_epi_valide" BOOLEAN NOT NULL DEFAULT false,
    "date_signature_epi" TIMESTAMP(3),

    CONSTRAINT "Livreur_pkey" PRIMARY KEY ("id_livreur")
);

-- CreateTable
CREATE TABLE "Vehicule" (
    "id_vehicule" SERIAL NOT NULL,
    "id_livreur" INTEGER NOT NULL,
    "immatriculation" VARCHAR(20) NOT NULL,
    "type_vehicule" VARCHAR(50),

    CONSTRAINT "Vehicule_pkey" PRIMARY KEY ("id_vehicule")
);

-- CreateTable
CREATE TABLE "Visiteur" (
    "id_visiteur" SERIAL NOT NULL,
    "nom_complet_chiffre" BYTEA NOT NULL,
    "societe" VARCHAR(100),
    "heure_arrivee" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visiteur_pkey" PRIMARY KEY ("id_visiteur")
);

-- CreateTable
CREATE TABLE "Personnel" (
    "id_personnel" SERIAL NOT NULL,
    "identifiant" VARCHAR(50) NOT NULL,
    "mot_de_passe_hash" VARCHAR(64) NOT NULL,
    "role" "RolePersonnel" NOT NULL,

    CONSTRAINT "Personnel_pkey" PRIMARY KEY ("id_personnel")
);

-- CreateTable
CREATE TABLE "Historique_Log" (
    "id_log" BIGSERIAL NOT NULL,
    "date_heure" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type_action" "TypeActionLog" NOT NULL,
    "details" TEXT,
    "id_vehicule" INTEGER,
    "id_visiteur" INTEGER,
    "id_personnel" INTEGER,

    CONSTRAINT "Historique_Log_pkey" PRIMARY KEY ("id_log")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicule_immatriculation_key" ON "Vehicule"("immatriculation");

-- CreateIndex
CREATE UNIQUE INDEX "Personnel_identifiant_key" ON "Personnel"("identifiant");

-- AddForeignKey
ALTER TABLE "Livreur" ADD CONSTRAINT "Livreur_id_entreprise_fkey" FOREIGN KEY ("id_entreprise") REFERENCES "Entreprise"("id_entreprise") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicule" ADD CONSTRAINT "Vehicule_id_livreur_fkey" FOREIGN KEY ("id_livreur") REFERENCES "Livreur"("id_livreur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historique_Log" ADD CONSTRAINT "Historique_Log_id_vehicule_fkey" FOREIGN KEY ("id_vehicule") REFERENCES "Vehicule"("id_vehicule") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historique_Log" ADD CONSTRAINT "Historique_Log_id_visiteur_fkey" FOREIGN KEY ("id_visiteur") REFERENCES "Visiteur"("id_visiteur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historique_Log" ADD CONSTRAINT "Historique_Log_id_personnel_fkey" FOREIGN KEY ("id_personnel") REFERENCES "Personnel"("id_personnel") ON DELETE SET NULL ON UPDATE CASCADE;
