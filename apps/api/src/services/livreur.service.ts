import { Livreur, LivreurRepository, PrismaService, Prisma, RecordNotFoundError } from "@repo/db";
import { encrypt, decrypt } from "../lib/crypto";

const prismaService = PrismaService.getInstance();
const repository = new LivreurRepository(prismaService);

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
function toDTO(raw: Livreur): LivreurDTO {
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
  const rows = await repository.findAll();
  return rows.map(toDTO);
}

export async function getLivreurById(id: number): Promise<LivreurDTO> {
  const row = await repository.findById(id);
  if (!row) throw new RecordNotFoundError("Livreur", id);
  return toDTO(row);
}

export async function getLivreursByEntreprise(
  entrepriseId: number,
): Promise<LivreurDTO[]> {
  const rows = await repository.findByEntrepriseId(entrepriseId);
  return rows.map(toDTO);
}

export async function createLivreur(data: CreateLivreurDTO): Promise<LivreurDTO> {
  // Use unchecked input if needed or proper relation connection
  // Using 'any' to bypass strict typing if complex, or map correctly.

  const input: Prisma.LivreurCreateInput = {
     entreprise: { connect: { id: data.entrepriseId } },
     nomChiffre: encrypt(data.nom) as any,
     prenomChiffre: encrypt(data.prenom) as any,
     charteEpiValide: data.charteEpiValide ?? false,
     dateSignatureEpi: data.dateSignatureEpi ? new Date(data.dateSignatureEpi) : null
  };

  const row = await repository.create(input);
  return toDTO(row);
}

export async function updateLivreur(
  id: number,
  data: UpdateLivreurDTO,
): Promise<LivreurDTO> {
  const existing = await repository.findById(id);
  if (!existing) throw new RecordNotFoundError("Livreur", id);

  const input: Prisma.LivreurUpdateInput = {
    ...(data.nom && { nomChiffre: encrypt(data.nom) as any }),
    ...(data.prenom && { prenomChiffre: encrypt(data.prenom) as any }),
    ...(data.charteEpiValide !== undefined && { charteEpiValide: data.charteEpiValide }),
    ...(data.dateSignatureEpi !== undefined && {
        dateSignatureEpi: data.dateSignatureEpi ? new Date(data.dateSignatureEpi) : null,
    }),
  };

  const row = await repository.update(id, input);
  return toDTO(row);
}

export async function deleteLivreur(id: number): Promise<LivreurDTO> {
  const row = await repository.delete(id);
  return toDTO(row);
}
