import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import * as EntrepriseService from "../services/entreprise.service";

// ── Zod schemas ───────────────────────────────────────────────────────────────

const createSchema = z.object({
  nomEntreprise: z.string().min(1).max(100),
  numeroContact: z.string().min(1).max(20),
});

const updateSchema = createSchema.partial();

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
 * GET /api/entreprises
 */
export async function getAll(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await EntrepriseService.getAllEntreprises();
    res.json({ status: "success", data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/entreprises/:id
 */
export async function getOne(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseId(req.params.id);
    const data = await EntrepriseService.getEntrepriseById(id);
    res.json({ status: "success", data });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/entreprises
 */
export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = createSchema.parse(req.body); // throws ZodError on failure
    const data = await EntrepriseService.createEntreprise(body);
    res.status(201).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/entreprises/:id
 */
export async function update(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseId(req.params.id);
    const body = updateSchema.parse(req.body);
    const data = await EntrepriseService.updateEntreprise(id, body);
    res.json({ status: "success", data });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/entreprises/:id
 */
export async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseId(req.params.id);
    await EntrepriseService.deleteEntreprise(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

