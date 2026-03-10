import jwt from "jsonwebtoken";
import crypto from "crypto";
import { PrismaService, PersonnelRepository } from "@repo/db";
import { UnauthorizedError, ValidationError } from "../lib/errors";
import type { JwtPayload } from "../middlewares/auth";

const repository = new PersonnelRepository(PrismaService.getInstance());

const JWT_SECRET = process.env.JWT_SECRET ?? "changeme_in_production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "8h";

function hashPassword(plain: string): string {
  return crypto.createHash("sha256").update(plain).digest("hex");
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function loginPersonnel(
  identifiant: string,
  motDePasse: string
): Promise<{ token: string; user: { id: number; identifiant: string; role: string } }> {
  const personnel = await repository.findByIdentifiant(identifiant);

  if (!personnel || personnel.motDePasseHash !== hashPassword(motDePasse)) {
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
  role: "Admin" | "Magasinier" = "Magasinier"
): Promise<{ id: number; identifiant: string; role: string }> {
  const existing = await repository.findByIdentifiant(identifiant);
  if (existing) {
    throw new ValidationError(`Identifiant "${identifiant}" is already taken`);
  }

  const personnel = await repository.create({
    identifiant,
    motDePasseHash: hashPassword(motDePasse),
    role,
  });

  return { id: personnel.id, identifiant: personnel.identifiant, role: personnel.role };
}
