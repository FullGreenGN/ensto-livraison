"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheckIcon,
  UserIcon,
  KeyRoundIcon,
  LogOutIcon,
  SaveIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { AppHeader } from "@/components/app-header";

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserInfo {
  id: number;
  identifiant: string;
  role: "Admin" | "Magasinier";
}

const USER_KEY = "auth_user";
const TOKEN_KEY = "auth_token";

function readUser(): UserInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserInfo) : null;
  } catch {
    return null;
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const user = readUser();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  // Redirect to login if not authenticated
  if (!user) {
    router.replace("/login");
    return null;
  }

  const initials = user.identifiant.slice(0, 2).toUpperCase();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);

    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }

    setPwLoading(true);
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        setPwError(data?.message ?? "Failed to change password.");
      } else {
        setPwSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPwError("An unexpected error occurred.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <AppHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8 space-y-6">

        {/* ── Identity card ───────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                <AvatarFallback className="bg-primary text-primary-foreground text-base font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <CardTitle className="text-lg">{user.identifiant}</CardTitle>
                <CardDescription className="flex items-center gap-1.5">
                  <UserIcon className="size-3.5" />
                  ID #{user.id}
                </CardDescription>
              </div>
              <div className="ml-auto">
                <Badge
                  variant={user.role === "Admin" ? "default" : "secondary"}
                  className="flex items-center gap-1"
                >
                  <ShieldCheckIcon className="size-3" />
                  {user.role}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Username
              </p>
              <p className="text-sm font-medium">{user.identifiant}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Role
              </p>
              <p className="text-sm font-medium">{user.role}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Account ID
              </p>
              <p className="text-sm font-medium">#{user.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* ── Change password card ─────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRoundIcon className="size-4 text-muted-foreground" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>
              Use a minimum of 8 characters including letters and numbers.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handlePasswordChange}>
            <CardContent className="space-y-4">
              {pwError && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {pwError}
                </p>
              )}
              {pwSuccess && (
                <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                  Password updated successfully.
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="justify-end">
              <Button type="submit" disabled={pwLoading}>
                <SaveIcon />
                {pwLoading ? "Saving…" : "Save Password"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* ── Danger zone card ─────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Actions here are immediate and cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Sign out of your account</p>
                <p className="text-xs text-muted-foreground">
                  You will be redirected to the login page.
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOutIcon />
                Log out
              </Button>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}

