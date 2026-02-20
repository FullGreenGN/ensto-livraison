import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import * as LivreurService from "../services/livreur.service";

// ── Zod schemas ───────────────────────────────────────────────────────────────

const createSchema = z.object({
  entrepriseId: z.number().int().positive(),
  nom: z.string().min(1),
  prenom: z.string().min(1),
  charteEpiValide: z.boolean().optional(),
  dateSignatureEpi: z.string().datetime({ offset: true }).optional(),
});

const updateSchema = z
  .object({
    nom: z.string().min(1),
    prenom: z.string().min(1),
    charteEpiValide: z.boolean(),
    dateSignatureEpi: z.string().datetime({ offset: true }),
  })
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field must be provided for update",
  });

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseId(raw: string | string[] | undefined): number {
  if (!raw) {
    throw Object.assign(new Error("Missing id parameter"), { statusCode: 400 });
  }
  const id = Number(Array.isArray(raw) ? raw[0] : raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw Object.assign(new Error("Invalid id parameter"), { statusCode: 400 });
  }
  return id;
}

// ── Handlers ──────────────────────────────────────────────────────────────────

/**
 * GET /api/livreurs
 * GET /api/livreurs?entrepriseId=42   (optional filter)
 */
export async function getAll(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { entrepriseId } = req.query;

    const data = entrepriseId
      ? await LivreurService.getLivreursByEntreprise(Number(entrepriseId))
      : await LivreurService.getAllLivreurs();

    res.json({ status: "success", data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/livreurs/:id
 */
export async function getOne(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseId(req.params.id);
    const data = await LivreurService.getLivreurById(id);
    res.json({ status: "success", data });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/livreurs
 */
export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = createSchema.parse(req.body);
    const data = await LivreurService.createLivreur(body);
    res.status(201).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/livreurs/:id
 */
export async function update(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseId(req.params.id);
    const body = updateSchema.parse(req.body);
    const data = await LivreurService.updateLivreur(id, body);
    res.json({ status: "success", data });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/livreurs/:id
 */
export async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseId(req.params.id);
    await LivreurService.deleteLivreur(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

