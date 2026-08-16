import {
  notFound,
  redirect,
} from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

import UserForm from "@/components/users/user-form";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditUserPage({
  params,
}: Props) {
  const session =
    await getSession();

  if (!session) {
    redirect("/login");
  }

  if (
    session.role !==
    "ADMIN"
  ) {
    redirect(
      "/dashboard"
    );
  }

  const { id } =
    await params;

  const userId =
    Number(id);

  if (
    !Number.isInteger(
      userId
    ) ||
    userId <= 0
  ) {
    notFound();
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id:
          userId,
      },

      include: {
        permissions: {
          select: {
            permission:
              true,
          },

          orderBy: {
            id: "asc",
          },
        },
      },
    });

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Edit User
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update user access, permissions and account details.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <UserForm
          user={{
            id:
              user.id,

            name:
              user.name,

            email:
              user.email,

            role:
              user.role,

            isActive:
              user.isActive,
          }}
        />
      </div>
    </div>
  );
}