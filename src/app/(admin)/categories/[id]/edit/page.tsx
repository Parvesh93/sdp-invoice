import Link from "next/link";
import { notFound } from "next/navigation";

import CategoryForm from "@/components/categories/category-form";
import { prisma } from "@/lib/prisma";

type EditCategoryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params;

  const categoryId = Number(id);

  if (!Number.isInteger(categoryId)) {
    notFound();
  }

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Edit Category
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Update category information.
          </p>
        </div>

        <Link
          href="/categories"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to Categories
        </Link>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="max-w-3xl">
          <CategoryForm
            category={{
              id: category.id,
              name: category.name,
              description: category.description,
              isActive: category.isActive,
            }}
          />
        </div>
      </div>
    </div>
  );
}