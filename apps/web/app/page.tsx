import { prisma } from "@repo/db";
import { AppHeader } from "@/components/app-header";

export default async function Home() {
  const company = await prisma.entreprise.findFirst();

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">
          {company?.nomEntreprise ?? "No company added yet"}
        </h1>
      </main>
    </div>
  );
}