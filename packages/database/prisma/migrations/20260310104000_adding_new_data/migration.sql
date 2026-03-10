-- AlterTable
ALTER TABLE "Personnel" ALTER COLUMN "mot_de_passe_hash" SET DATA TYPE VARCHAR(72);

-- CreateIndex
CREATE INDEX "Historique_Log_date_heure_idx" ON "Historique_Log"("date_heure" DESC);

-- CreateIndex
CREATE INDEX "Historique_Log_date_heure_type_action_idx" ON "Historique_Log"("date_heure", "type_action");

-- CreateIndex
CREATE INDEX "Historique_Log_id_vehicule_idx" ON "Historique_Log"("id_vehicule");

-- CreateIndex
CREATE INDEX "Historique_Log_id_visiteur_idx" ON "Historique_Log"("id_visiteur");

-- CreateIndex
CREATE INDEX "Historique_Log_id_personnel_idx" ON "Historique_Log"("id_personnel");

-- CreateIndex
CREATE INDEX "Livreur_id_entreprise_idx" ON "Livreur"("id_entreprise");
