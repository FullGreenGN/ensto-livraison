"use client";

import { useState } from "react";
import { SettingsIcon, PaletteIcon, BellIcon, ShieldIcon, ServerIcon } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { PageGuard } from "@/components/guards";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";

function Section({ icon, title, description, children }: {
  icon: React.ReactNode; title: string; description: string; children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">{icon} {title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {children}
    </Card>
  );
}

function ToggleRow({ label, description, defaultChecked = false }: { label: string; description: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        role="switch" aria-checked={checked} onClick={() => setChecked((v) => !v)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${checked ? "bg-primary" : "bg-input"}`}
      >
        <span className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

function SettingsContent() {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="size-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">Application configuration</p>
          </div>
          <Badge variant="secondary" className="ml-auto">Admin only</Badge>
        </div>

        <Section icon={<PaletteIcon className="size-4" />} title="Appearance" description="Customize the look and feel.">
          <CardContent className="space-y-4">
            <ToggleRow label="Dark Mode" description="Switch between light and dark theme." />
            <Separator />
            <ToggleRow label="Compact Tables" description="Use smaller row heights in data tables." />
          </CardContent>
        </Section>

        <Section icon={<BellIcon className="size-4" />} title="Notifications" description="Configure alerts and reminders.">
          <CardContent className="space-y-4">
            <ToggleRow label="Access Alerts" description="Notify on unauthorized access attempts." defaultChecked />
            <Separator />
            <ToggleRow label="New Driver Registration" description="Alert when a new driver is added." defaultChecked />
            <Separator />
            <ToggleRow label="EPI Expiry Reminders" description="Remind when EPI charters are about to expire." />
          </CardContent>
        </Section>

        <Section icon={<ShieldIcon className="size-4" />} title="Security" description="Session and authentication settings.">
          <CardContent className="space-y-4">
            <ToggleRow label="Enforce Strong Passwords" description="Require passwords with mixed case, numbers, and symbols." defaultChecked />
            <Separator />
            <ToggleRow label="Auto Logout on Inactivity" description="Sign out after 30 minutes of inactivity." defaultChecked />
            <Separator />
            <div className="space-y-1.5">
              <Label htmlFor="sessionTTL">Session Duration (hours)</Label>
              <Input id="sessionTTL" type="number" defaultValue={8} min={1} max={24} className="w-28" />
              <p className="text-xs text-muted-foreground">Matches <code>JWT_EXPIRES_IN</code> on the API.</p>
            </div>
          </CardContent>
        </Section>

        <Section icon={<ServerIcon className="size-4" />} title="API Configuration" description="Connection settings for the Express backend.">
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="apiUrl">API Base URL</Label>
              <Input id="apiUrl" defaultValue={process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"} placeholder="http://localhost:3001" />
              <p className="text-xs text-muted-foreground">Set via <code>NEXT_PUBLIC_API_URL</code>.</p>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={handleSave} size="sm">{saved ? "Saved ✓" : "Save Changes"}</Button>
          </CardFooter>
        </Section>
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <PageGuard permission="settings:manage">
      <SettingsContent />
    </PageGuard>
  );
}

