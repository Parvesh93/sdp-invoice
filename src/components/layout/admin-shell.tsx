"use client";

import { useState } from "react";

import {
  Menu,
  ShieldCheck,
} from "lucide-react";

import Sidebar from "@/components/layout/sidebar";
import LogoutButton from "@/components/auth/logout-button";

type AdminLayoutShellProps = {
  children: React.ReactNode;

  user: {
    name: string;
    role: "ADMIN" | "STAFF";
  };
};

export default function AdminLayoutShell({
  children,
  user,
}: AdminLayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Desktop Sidebar */}
      <Sidebar role={user.role} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="h-full w-72"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <Sidebar
              role={user.role}
              mobile
              onClose={() =>
                setSidebarOpen(false)
              }
            />
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="fixed left-0 right-0 top-0 z-30 h-16 border-b border-slate-200 bg-white lg:left-72">
        <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Mobile menu */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setSidebarOpen(true)
              }
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div className="lg:hidden">
              <div className="text-sm font-bold text-slate-900">
                SDP Machines
              </div>
            </div>
          </div>

          {/* User */}
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden rounded-full bg-slate-100 p-2 text-slate-600 sm:block">
              <ShieldCheck size={18} />
            </div>

            <div className="text-right">
              <div className="max-w-[130px] truncate text-sm font-medium text-slate-900 sm:max-w-none">
                {user.name}
              </div>

              <div className="text-xs text-slate-500">
                {user.role === "ADMIN"
                  ? "Admin"
                  : "Staff"}
              </div>
            </div>

            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen pt-16 lg:ml-72">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}