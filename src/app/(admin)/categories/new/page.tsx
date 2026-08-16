import Link from "next/link";
import CategoryForm from "@/components/categories/category-form";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Add Category
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create a new product category.
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
          <CategoryForm />
        </div>
      </div>
    </div>
  );
}