import Link from "next/link";
import {GalleryVerticalEnd} from "lucide-react";
import {UserMenu} from "@/components/user-menu";
import {PermissionGuard} from "@/components/guards";
import {ThemeSwitcher} from "@/components/theme-switcher";

export function AppHeader() {
    return (
        <header
            className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-semibold text-sm shrink-0">
                    <GalleryVerticalEnd className="size-4"/>
                    Ensto
                </Link>

                {/* Nav links — RBAC-gated */}
                <nav className="flex items-center gap-4 text-sm text-muted-foreground flex-1">
                    <PermissionGuard permission="entreprise:read">
                        <Link href="/entreprises" className="hover:text-foreground transition-colors">
                            Companies
                        </Link>
                    </PermissionGuard>

                    <PermissionGuard permission="livreur:read">
                        <Link href="/livreurs" className="hover:text-foreground transition-colors">
                            Drivers
                        </Link>
                    </PermissionGuard>

                    <PermissionGuard permission="log:read">
                        <Link href="/admin" className="hover:text-foreground transition-colors">
                            RBAC
                        </Link>
                    </PermissionGuard>

                    <PermissionGuard permission="settings:manage">
                        <Link href="/settings" className="hover:text-foreground transition-colors">
                            Settings
                        </Link>
                    </PermissionGuard>
                </nav>

                <ThemeSwitcher/>
                <UserMenu/>
            </div>
        </header>
    );
}
