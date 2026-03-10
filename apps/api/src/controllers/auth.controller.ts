import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ROLE_PERMISSIONS } from "@repo/types";
import * as AuthService from "../services/auth.service";

const loginSchema = z.object({
  identifiant: z.string().min(1, "identifiant is required"),
  motDePasse: z.string().min(1, "motDePasse is required"),
});

const registerSchema = z.object({
  identifiant: z.string().min(3).max(50),
  motDePasse: z.string().min(8, "Password must be at least 8 characters"),
  confirmMotDePasse: z.string().min(1),
  role: z.enum(["Admin", "Magasinier"]).optional(),
}).refine((d) => d.motDePasse === d.confirmMotDePasse, {
  message: "Passwords do not match",
  path: ["confirmMotDePasse"],
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ status: "error", message: parsed.error.errors.map((e) => e.message).join(", ") });
      return;
    }
    const result = await AuthService.loginPersonnel(parsed.data.identifiant, parsed.data.motDePasse);
    res.status(200).json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/change-password ───────────────────────────────────────────

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ status: "error", message: parsed.error.errors.map((e) => e.message).join(", ") });
      return;
    }
    await AuthService.changePassword(req.user!.sub, parsed.data.currentPassword, parsed.data.newPassword);
    res.status(200).json({ status: "success", message: "Password updated" });
  } catch (err) {
    next(err);
  }
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ status: "error", message: parsed.error.errors.map((e) => e.message).join(", ") });
      return;
    }
    const { identifiant, motDePasse, role } = parsed.data;
    const user = await AuthService.registerPersonnel(identifiant, motDePasse, role);
    res.status(201).json({ status: "success", data: user });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

export function me(req: Request, res: Response): void {
  const { sub, role } = req.user!;
  res.json({
    status: "success",
    data: {
      id: sub,
      role,
      permissions: ROLE_PERMISSIONS[role] ?? [],
    },
  });
}

