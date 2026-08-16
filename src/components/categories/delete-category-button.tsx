"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteCategoryButtonProps = {
  id: number;
  productCount: number;
};

export default function DeleteCategoryButton({
  id,
  productCount,
}: DeleteCategoryButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (productCount > 0) {
      alert(
        "This category contains products and cannot be deleted."
      );

      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `/api/categories/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(
          result.message ?? "Unable to delete category."
        );

        return;
      }

      router.refresh();
    } catch {
      alert("Unable to delete category.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-sm font-medium text-red-600 disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}