import { UserMenu } from "@/components/user-menu";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-sm">
          <GalleryVerticalEnd className="size-4" />
          Ensto
        </Link>
        <UserMenu />
      </div>
    </header>
  );
}

