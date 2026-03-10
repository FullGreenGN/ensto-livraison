import { prisma } from "@repo/db";
import { UserMenu } from "@/components/user-menu";

export default async function Home() {
  const company = await prisma.entreprise.findFirst();

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Top navigation bar ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="text-sm font-semibold tracking-tight">
            {company?.nomEntreprise ?? "Ensto"}
          </span>
          <UserMenu />
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────────────── */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">
          {company?.nomEntreprise ?? "No company added yet"}
        </h1>
      </main>
    </div>
  );
}