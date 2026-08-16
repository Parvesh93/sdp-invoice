import SettingsForm from "@/components/settings/settings-form";

import {
  getSettings,
} from "@/lib/settings";


import {
  redirect,
} from "next/navigation";

import { getSession } from "@/lib/auth";

export default async function SettingsPage() {
  const session =
    await getSession();

  if (!session) {
    redirect("/login");
  }

  if (
    session.role !== "ADMIN"
  ) {
    redirect("/dashboard");
  }

  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage document branding, GST, terms, warranty and quotation settings.
        </p>
      </div>

      <SettingsForm
        initialSettings={
          settings
        }
      />
    </div>
  );
}