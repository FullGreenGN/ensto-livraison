import { Entreprise } from "@repo/db";
import { prisma } from "../lib/prisma";
import { NotFoundError } from "../lib/errors";

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface CreateEntrepriseDTO {
  nomEntreprise: string;
  numeroContact: string;
}

export type UpdateEntrepriseDTO = Partial<CreateEntrepriseDTO>;

// ── Service ───────────────────────────────────────────────────────────────────

/**
 * All database interactions for the `Entreprise` model live here.
 * Controllers MUST NOT import `prisma` directly – they call these functions.
 */

export async function getAllEntreprises(): Promise<Entreprise[]> {
  return prisma.entreprise.findMany({
    orderBy: { id: "asc" },
  });
}

export async function getEntrepriseById(id: number): Promise<Entreprise> {
  const entreprise = await prisma.entreprise.findUnique({ where: { id } });

  if (!entreprise) {
    throw new NotFoundError("Entreprise", id);
  }

  return entreprise;
}

export async function createEntreprise(
  data: CreateEntrepriseDTO,
): Promise<Entreprise> {
  return prisma.entreprise.create({ data });
}

export async function updateEntreprise(
  id: number,
  data: UpdateEntrepriseDTO,
): Promise<Entreprise> {
  // Ensure the record exists before patching – throws 404 otherwise
  await getEntrepriseById(id);

  return prisma.entreprise.update({ where: { id }, data });
}

export async function deleteEntreprise(id: number): Promise<void> {
  await getEntrepriseById(id);
  await prisma.entreprise.delete({ where: { id } });
}

