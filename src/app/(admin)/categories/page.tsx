import Link from "next/link";

import { prisma } from "@/lib/prisma";
import DeleteCategoryButton from "@/components/categories/delete-category-button";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

// export default async function CategoriesPage() {
//   const categories = await prisma.category.findMany({
//     include: {
//       _count: {
//         select: {
//           products: true,
//         },
//       },
//     },

//     orderBy: {
//       createdAt: "desc",
//     },
//   });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Categories
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage product categories.
          </p>
        </div>

        <Link
          href="/categories/new"
          className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          + Add Category
        </Link>
      </div>

      {/* Categories Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Description
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Products
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center"
                  >
                    <p className="text-sm font-medium text-slate-700">
                      No categories found.
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Add your first category to start organizing products.
                    </p>
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr
                    key={category.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Category */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {category.name}
                      </div>
                    </td>

                    {/* Description */}
                    <td className="max-w-md px-5 py-4">
                      <p className="truncate text-sm text-slate-500">
                        {category.description || "—"}
                      </p>
                    </td>

                    {/* Product Count */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-700">
                        {category._count.products}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {category.isActive ? (
                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/categories/${category.id}/edit`}
                          className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
                        >
                          Edit
                        </Link>

                        <DeleteCategoryButton
                          id={category.id}
                          productCount={
                            category._count.products
                          }
                        />
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