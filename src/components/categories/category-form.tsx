"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type CategoryFormProps = {
  category?: {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
  };
};

export default function CategoryForm({
  category,
}: CategoryFormProps) {
  const router = useRouter();

  const isEditing = Boolean(category);

  const [name, setName] = useState(category?.name ?? "");

  const [description, setDescription] = useState(
    category?.description ?? ""
  );

  const [isActive, setIsActive] = useState(
    category?.isActive ?? true
  );

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const url = isEditing
        ? `/api/categories/${category!.id}`
        : "/api/categories";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          description,
          isActive,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ?? "Unable to save category."
        );
      }

      router.push("/categories");
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Category Name */}
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Category Name *
        </label>

        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          required
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          placeholder="Example: Cutting Machines"
        />

        <p className="mt-2 text-xs text-slate-500">
          This category will be used to group products in the quotation form.
        </p>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Description
        </label>

        <textarea
          id="description"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          rows={5}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          placeholder="Optional category description"
        />
      </div>

      {/* Status */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <input
            id="isActive"
            type="checkbox"
            checked={isActive}
            onChange={(event) =>
              setIsActive(event.target.checked)
            }
            className="mt-1 h-4 w-4 rounded border-slate-300"
          />

          <div>
            <label
              htmlFor="isActive"
              className="cursor-pointer text-sm font-medium text-slate-800"
            >
              Active Category
            </label>

            <p className="mt-1 text-xs text-slate-500">
              Inactive categories will not be available when adding new products or creating documents.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 border-t border-slate-200 pt-6">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : isEditing
              ? "Update Category"
              : "Add Category"}
        </button>

        <button
          type="button"
          onClick={() =>
            router.push("/categories")
          }
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}