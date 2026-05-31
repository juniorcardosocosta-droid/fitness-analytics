"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Plug,
  Building,
  Users,
  LogOut,
  Settings,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    const { createClient } = await import("@supabase/supabase-js");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    await supabase.auth.signOut();

    router.push("/login");
  };

  const pathname = usePathname();

  const menu = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Clientes",
      path: "/dashboard/clientes",
      icon: Users,
    },
    {
      name: "Academias",
      path: "/dashboard/academias",
      icon: Building,
    },
    {
      name: "Relatórios",
      path: "/dashboard/relatorios",
      icon: FileText,
    },
    {
      name: "Importar",
      path: "/dashboard/importar",
      icon: FileText,
    },
    {
      name: "Integrações",
      path: "/dashboard/integracoes",
      icon: Plug,
    },
    {
      name: "CRM",
      path: "/dashboard/crm",
      icon: Users,
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#050b18] text-white">
      {/* SIDEBAR */}

      <aside className="w-64 bg-[#0f1c33] border-r border-white/5 p-6">
        <h2 className="text-2xl font-bold mb-10 text-cyan-400">
          Gym Analytics
        </h2>

        <nav className="space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all
                ${
                  active
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />

                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-10 pt-6 border-t border-white/10 space-y-2">
          <Link
            href="/dashboard/perfil"
            className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition"
          >
            <Settings size={18} />
            Meu Perfil
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* CONTEÚDO */}

      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
