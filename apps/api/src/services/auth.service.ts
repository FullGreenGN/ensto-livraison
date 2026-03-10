import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PrismaService, PersonnelRepository } from "@repo/db";
import { UnauthorizedError, ValidationError } from "../lib/errors";
import type { JwtPayload } from "../middlewares/auth";

const repository = new PersonnelRepository(PrismaService.getInstance());

const JWT_SECRET = process.env.JWT_SECRET ?? "changeme_in_production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "8h";
const SALT_ROUNDS = 12;

// ── Login ─────────────────────────────────────────────────────────────────────

export async function loginPersonnel(
  identifiant: string,
  motDePasse: string,
): Promise<{ token: string; user: { id: number; identifiant: string; role: string } }> {
  const personnel = await repository.findByIdentifiant(identifiant);

  // Use bcrypt.compare — constant-time, resistant to timing attacks
  const valid = personnel
    ? await bcrypt.compare(motDePasse, personnel.motDePasseHash)
    : false; // still run compare to prevent timing oracle

  if (!personnel || !valid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const payload: JwtPayload = { sub: personnel.id, role: personnel.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);

  return {
    token,
    user: { id: personnel.id, identifiant: personnel.identifiant, role: personnel.role },
  };
}

// ── Register ──────────────────────────────────────────────────────────────────

export async function registerPersonnel(
  identifiant: string,
  motDePasse: string,
  role: "Admin" | "Magasinier" = "Magasinier",
): Promise<{ id: number; identifiant: string; role: string }> {
  const existing = await repository.findByIdentifiant(identifiant);
  if (existing) {
    throw new ValidationError(`Identifiant "${identifiant}" is already taken`);
  }

  const motDePasseHash = await bcrypt.hash(motDePasse, SALT_ROUNDS);

  const personnel = await repository.create({ identifiant, motDePasseHash, role });

  return { id: personnel.id, identifiant: personnel.identifiant, role: personnel.role };
}

// ── Change password ───────────────────────────────────────────────────────────

export async function changePassword(
  personnelId: number,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const personnel = await repository.findById(personnelId);
  if (!personnel) throw new UnauthorizedError("Account not found");

  const valid = await bcrypt.compare(currentPassword, personnel.motDePasseHash);
  if (!valid) throw new UnauthorizedError("Current password is incorrect");

  await repository.update(personnelId, {
    motDePasseHash: await bcrypt.hash(newPassword, SALT_ROUNDS),
  });
}
