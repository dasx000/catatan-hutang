import Link from "next/link";
import { NotebookText } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { NavProgress } from "@/components/nav-progress";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-40 rounded-b-[2rem] bg-ledger text-ledger-foreground shadow-clay-lg">
        <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-white/20 shadow-clay-sm">
              <NotebookText className="size-[18px]" strokeWidth={2.5} />
            </span>
            <span className="font-heading text-[17px] font-bold tracking-tight">
              Catatan Hutang
            </span>
            <NavProgress />
          </Link>
          <div className="flex items-center gap-1.5">
            {user?.email && (
              <span className="hidden max-w-32 truncate text-xs font-medium text-ledger-foreground/75 sm:inline">
                {user.email}
              </span>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
