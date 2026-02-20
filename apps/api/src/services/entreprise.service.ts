import { Entreprise, EntrepriseRepository, PrismaService, Prisma, RecordNotFoundError } from "@repo/db";

const prismaService = PrismaService.getInstance();
const repository = new EntrepriseRepository(prismaService);

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
  return repository.findAll();
}

export async function getEntrepriseById(id: number): Promise<Entreprise> {
  const entreprise = await repository.findById(id);
  if (!entreprise) {
    throw new RecordNotFoundError('Entreprise', id);
  }
  return entreprise;
}

export async function createEntreprise(
  data: CreateEntrepriseDTO,
): Promise<Entreprise> {
  const input: Prisma.EntrepriseCreateInput = {
    nomEntreprise: data.nomEntreprise,
    numeroContact: data.numeroContact,
  };
  return repository.create(input);
}

export async function updateEntreprise(
  id: number,
  data: UpdateEntrepriseDTO,
): Promise<Entreprise> {
  const input: Prisma.EntrepriseUpdateInput = {
    ...(data.nomEntreprise && { nomEntreprise: data.nomEntreprise }),
    ...(data.numeroContact && { numeroContact: data.numeroContact }),
  };
  return repository.update(id, input);
}

export async function deleteEntreprise(id: number): Promise<Entreprise> {
  return repository.delete(id);
}
