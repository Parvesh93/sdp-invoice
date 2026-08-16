import {
  redirect,
} from "next/navigation";

import { getSession } from "@/lib/auth";

import UserForm from "@/components/users/user-form";

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  const session =
    await getSession();

  if (!session) {
    redirect("/login");
  }

  if (
    session.role !== "ADMIN"
  ) {
    redirect(
      "/dashboard"
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Add User
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create a new system user.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <UserForm />
      </div>
    </div>
  );
}