import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Users
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage system users, roles and account access.
          </p>
        </div>

        <Link
          href="/users/new"
          className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Add User
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-212.5">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <TableHeading>Name</TableHeading>
                <TableHeading>Email</TableHeading>
                <TableHeading>Role</TableHeading>
                <TableHeading>Status</TableHeading>
                <TableHeading>Created</TableHeading>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-14 text-center text-sm text-slate-400"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {user.name}
                      </div>

                      {user.id === session.userId && (
                        <div className="mt-1 text-xs text-slate-400">
                          Current user
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      {user.email}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {user.isActive ? (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {new Intl.DateTimeFormat("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }).format(user.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={`/users/${user.id}/edit`}
                          className="text-sm font-medium text-slate-700 hover:text-slate-950"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TableHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}