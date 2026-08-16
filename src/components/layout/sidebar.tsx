"use client";

import Link from "next/link";

import {
  LayoutDashboard,
  FilePlus2,
  Files,
  Users,
  Package,
  Tags,
  Settings,
  UserCog,
  X,
} from "lucide-react";

type SidebarProps = {
  role: "ADMIN" | "STAFF";
  mobile?: boolean;
  onClose?: () => void;
};

export default function Sidebar({
  role,
  mobile = false,
  onClose,
}: SidebarProps) {
  return (
    <aside
      className={
        mobile
          ? "h-full w-72 bg-slate-950 text-white"
          : "fixed inset-y-0 left-0 z-40 hidden w-72 bg-slate-950 text-white lg:block"
      }
    >
      <div className="flex h-full flex-col">
        {/* Brand */}
        <div className="flex items-start justify-between px-7 py-7">
          <div>
            <h1 className="text-2xl font-bold">
              SDP Machines
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Quotation Management
            </p>
          </div>

          {mobile && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-6">
          <SidebarLink
            href="/dashboard"
            icon={<LayoutDashboard size={20} />}
            onClick={onClose}
          >
            Dashboard
          </SidebarLink>

          <SidebarLink
            href="/documents/create"
            icon={<FilePlus2 size={20} />}
            onClick={onClose}
          >
            Create Document
          </SidebarLink>

          <SidebarLink
            href="/documents"
            icon={<Files size={20} />}
            onClick={onClose}
          >
            Documents
          </SidebarLink>

          <SidebarLink
            href="/customers"
            icon={<Users size={20} />}
            onClick={onClose}
          >
            Customers
          </SidebarLink>

          <SidebarLink
            href="/products"
            icon={<Package size={20} />}
            onClick={onClose}
          >
            Products
          </SidebarLink>

          <SidebarLink
            href="/categories"
            icon={<Tags size={20} />}
            onClick={onClose}
          >
            Categories
          </SidebarLink>

          {role === "ADMIN" && (
            <>
              <div className="px-4 pb-2 pt-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Administration
              </div>

              <SidebarLink
                href="/settings"
                icon={<Settings size={20} />}
                onClick={onClose}
              >
                Settings
              </SidebarLink>

              <SidebarLink
                href="/users"
                icon={<UserCog size={20} />}
                onClick={onClose}
              >
                Users
              </SidebarLink>
            </>
          )}
        </nav>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
    >
      <span className="text-slate-400">
        {icon}
      </span>

      <span>{children}</span>
    </Link>
  );
}