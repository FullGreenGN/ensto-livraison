import { prisma } from "../lib/prisma";
import { NotFoundError } from "../lib/errors";
import { encrypt, decrypt } from "../lib/crypto";

// ── DTOs ──────────────────────────────────────────────────────────────────────

/** What the API caller sends (plain text, never encrypted bytes) */
export interface CreateLivreurDTO {
  entrepriseId: number;
  nom: string;    // will be encrypted → nomChiffre
  prenom: string; // will be encrypted → prenomChiffre
  charteEpiValide?: boolean;
  dateSignatureEpi?: string; // ISO-8601 string, parsed to Date in service
}

export type UpdateLivreurDTO = Partial<
  Omit<CreateLivreurDTO, "entrepriseId">
>;

/** What the API returns (decrypted, human-readable) */
export interface LivreurDTO {
  id: number;
  entrepriseId: number;
  nom: string;
  prenom: string;
  charteEpiValide: boolean;
  dateSignatureEpi: Date | null;
}

// ── Private helpers ───────────────────────────────────────────────────────────

/**
 * Maps a raw Prisma `Livreur` row (Prisma Bytes = Uint8Array) to the public
 * DTO by decrypting the sensitive fields.
 */
function toDTO(raw: any): LivreurDTO {
  return {
    id: raw.id,
    entrepriseId: raw.entrepriseId,
    nom: decrypt(raw.nomChiffre),       // 🔓 decrypt bytes → plain text
    prenom: decrypt(raw.prenomChiffre), // 🔓 decrypt bytes → plain text
    charteEpiValide: raw.charteEpiValide,
    dateSignatureEpi: raw.dateSignatureEpi,
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

export async function getAllLivreurs(): Promise<LivreurDTO[]> {
  const rows = await prisma.livreur.findMany({ orderBy: { id: "asc" } });
  return rows.map(toDTO);
}

export async function getLivreurById(id: number): Promise<LivreurDTO> {
  const row = await prisma.livreur.findUnique({ where: { id } });

  if (!row) {
    throw new NotFoundError("Livreur", id);
  }

  return toDTO(row);
}

export async function getLivreursByEntreprise(
  entrepriseId: number,
): Promise<LivreurDTO[]> {
  const rows = await prisma.livreur.findMany({
    where: { entrepriseId },
    orderBy: { id: "asc" },
  });
  return rows.map(toDTO);
}

export async function createLivreur(data: CreateLivreurDTO): Promise<LivreurDTO> {
  const row = await prisma.livreur.create({
    data: {
      entrepriseId: data.entrepriseId,
      nomChiffre: encrypt(data.nom) as any,        // 🔐 encrypt plain text → bytes
      prenomChiffre: encrypt(data.prenom) as any,  // 🔐 encrypt plain text → bytes
      charteEpiValide: data.charteEpiValide ?? false,
      dateSignatureEpi: data.dateSignatureEpi
        ? new Date(data.dateSignatureEpi)
        : null,
    },
  });

  return toDTO(row);
}

export async function updateLivreur(
  id: number,
  data: UpdateLivreurDTO,
): Promise<LivreurDTO> {
  // Ensure the record exists – throws 404 otherwise
  await getLivreurById(id);

  const row = await prisma.livreur.update({
    where: { id },
    data: {
      ...(data.nom !== undefined && {
        nomChiffre: encrypt(data.nom) as any,       // 🔐 re-encrypt updated name
      }),
      ...(data.prenom !== undefined && {
        prenomChiffre: encrypt(data.prenom) as any, // 🔐 re-encrypt updated prénom
      }),
      ...(data.charteEpiValide !== undefined && {
        charteEpiValide: data.charteEpiValide,
      }),
      ...(data.dateSignatureEpi !== undefined && {
        dateSignatureEpi: new Date(data.dateSignatureEpi),
      }),
    },
  });

  return toDTO(row);
}

export async function deleteLivreur(id: number): Promise<void> {
  await getLivreurById(id);
  await prisma.livreur.delete({ where: { id } });
}
