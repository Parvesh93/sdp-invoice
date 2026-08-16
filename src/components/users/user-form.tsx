"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

type UserFormProps = {
  user?: {
    id: number;
    name: string;
    email: string;
    role: "ADMIN" | "STAFF";
    isActive: boolean;
  };
};

export default function UserForm({
  user,
}: UserFormProps) {
  const router =
    useRouter();

  const isEditing =
    Boolean(user);

  const [name, setName] =
    useState(
      user?.name ?? ""
    );

  const [email, setEmail] =
    useState(
      user?.email ?? ""
    );

  const [role, setRole] =
    useState<
      "ADMIN" | "STAFF"
    >(
      user?.role ??
        "STAFF"
    );

  const [
    isActive,
    setIsActive,
  ] = useState(
    user?.isActive ??
      true
  );

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          isEditing
            ? `/api/users/${user!.id}`
            : "/api/users",
          {
            method:
              isEditing
                ? "PUT"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                name:
                  name.trim(),

                email:
                  email
                    .trim()
                    .toLowerCase(),

                password,

                role,

                isActive,
              }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ??
            "Unable to save user."
        );
      }

      router.push(
        "/users"
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-6"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Name *
          </label>

          <input
            id="name"
            value={name}
            required
            onChange={(
              event
            ) =>
              setName(
                event.target.value
              )
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Email *
          </label>

          <input
            id="email"
            type="email"
            value={email}
            required
            onChange={(
              event
            ) =>
              setEmail(
                event.target.value
              )
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Role *
          </label>

          <select
            id="role"
            value={role}
            onChange={(
              event
            ) =>
              setRole(
                event.target
                  .value as
                  | "ADMIN"
                  | "STAFF"
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3"
          >
            <option value="STAFF">
              Staff
            </option>

            <option value="ADMIN">
              Admin
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            {isEditing
              ? "New Password"
              : "Password *"}
          </label>

          <input
            id="password"
            type="password"
            value={password}
            required={
              !isEditing
            }
            onChange={(
              event
            ) =>
              setPassword(
                event.target.value
              )
            }
            placeholder={
              isEditing
                ? "Leave blank to keep current password"
                : "Minimum 8 characters"
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={
              isActive
            }
            onChange={(
              event
            ) =>
              setIsActive(
                event.target
                  .checked
              )
            }
            className="mt-1 h-4 w-4"
          />

          <div>
            <div className="text-sm font-medium text-slate-800">
              Active User
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Inactive users cannot log in.
            </p>
          </div>
        </label>
      </div>

      <div className="flex gap-3 border-t border-slate-200 pt-6">
        <button
          type="submit"
          disabled={
            loading
          }
          className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : isEditing
              ? "Update User"
              : "Add User"}
        </button>

        <button
          type="button"
          disabled={
            loading
          }
          onClick={() =>
            router.push(
              "/users"
            )
          }
          className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}