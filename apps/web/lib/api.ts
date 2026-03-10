/**
 * Typed API client for the Express backend.
 * Base URL is read from NEXT_PUBLIC_API_URL (defaults to localhost:3001 for local dev).
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// ── Generic fetch wrapper ────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, error?.message ?? "Unknown error");
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ── Custom error class ───────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  identifiant: string;
  motDePasse: string;
}

export interface RegisterPayload {
  identifiant: string;
  motDePasse: string;
  confirmMotDePasse: string;
  role?: "Admin" | "Magasinier";
}

export interface LoginResponse {
  status: string;
  data: {
    token: string;
    user: {
      id: number;
      identifiant: string;
      role: "Admin" | "Magasinier";
    };
  };
}

export interface RegisterResponse {
  status: string;
  data: {
    id: number;
    identifiant: string;
    role: string;
  };
}

export interface AuthApi {
  login(payload: LoginPayload): Promise<LoginResponse>;
  register(payload: RegisterPayload): Promise<RegisterResponse>;
}

export const authApi: AuthApi = {
  login: (payload: LoginPayload) =>
    request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  register: (payload: RegisterPayload) =>
    request<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ── Entreprises ──────────────────────────────────────────────────────────────

export interface Entreprise {
  id: number;
  nomEntreprise: string;
  numeroContact: string;
}

export const entreprisesApi = {
  getAll: (token?: string) =>
    request<Entreprise[]>("/api/entreprises", {}, token),

  getOne: (id: number, token: string) =>
    request<Entreprise>(`/api/entreprises/${id}`, {}, token),

  create: (data: Omit<Entreprise, "id">, token?: string) =>
    request<Entreprise>("/api/entreprises", { method: "POST", body: JSON.stringify(data) }, token),

  update: (id: number, data: Partial<Omit<Entreprise, "id">>, token: string) =>
    request<Entreprise>(`/api/entreprises/${id}`, { method: "PATCH", body: JSON.stringify(data) }, token),

  remove: (id: number, token: string) =>
    request<void>(`/api/entreprises/${id}`, { method: "DELETE" }, token),
};

// ── Livreurs ─────────────────────────────────────────────────────────────────

export interface Livreur {
  id: number;
  entrepriseId: number;
  nom: string;
  prenom: string;
  charteEpiValide: boolean;
  dateSignatureEpi: string | null;
}

export const livreursApi = {
  getAll: (token: string, entrepriseId?: number) => {
    const qs = entrepriseId ? `?entrepriseId=${entrepriseId}` : "";
    return request<Livreur[]>(`/api/livreurs${qs}`, {}, token);
  },

  getOne: (id: number, token: string) =>
    request<Livreur>(`/api/livreurs/${id}`, {}, token),

  create: (data: Omit<Livreur, "id">, token?: string) =>
    request<Livreur>("/api/livreurs", { method: "POST", body: JSON.stringify(data) }, token),

  update: (id: number, data: Partial<Omit<Livreur, "id">>, token: string) =>
    request<Livreur>(`/api/livreurs/${id}`, { method: "PATCH", body: JSON.stringify(data) }, token),

  remove: (id: number, token: string) =>
    request<void>(`/api/livreurs/${id}`, { method: "DELETE" }, token),
};

