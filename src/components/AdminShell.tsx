import Link from "next/link";
import { LayoutDashboard, FilePlus2, Files, Users, Package, Tags, Settings, UserCog } from "lucide-react";

const nav = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Create Document", "/documents/create", FilePlus2],
  ["Documents", "/documents", Files],
  ["Customers", "/customers", Users],
  ["Products", "/products", Package],
  ["Categories", "/categories", Tags],
  ["Settings", "/settings", Settings],
  ["Users", "/users", UserCog],
] as const;

export default function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 md:grid md:grid-cols-[250px_1fr]">
      <aside className="border-r bg-slate-950 p-5 text-white">
        <div className="mb-8">
          <div className="text-xl font-bold">SDP Machines</div>
          <div className="text-xs text-slate-400">Quotation Management</div>
        </div>
        <nav className="space-y-1">
          {nav.map(([label, href, Icon]) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white">
              <Icon size={17} /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main>
        <header className="border-b bg-white px-6 py-4">
          <h1 className="text-xl font-semibold">{title}</h1>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
