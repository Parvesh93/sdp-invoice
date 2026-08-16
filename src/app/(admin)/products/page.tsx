import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { formatIndianCurrency } from "@/lib/currency";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Products
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage products used in quotations and order forms.
          </p>
        </div>

        <Link
          href="/products/new"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Search products..."
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
          />

          <select className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm">
            <option>All Categories</option>
          </select>

          <select className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Product
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Standard Price
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-14 text-center text-sm text-slate-500"
                >
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900">
                      {product.name}
                    </div>

                    {product.description && (
                      <div className="mt-1 max-w-md truncate text-sm text-slate-500">
                        {product.description}
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {product.category.name}
                  </td>

                  <td className="px-5 py-4 font-medium text-slate-900">
                    {formatIndianCurrency(
                      product.standardPrice.toString()
                    )}
                  </td>

                  <td className="px-5 py-4">
                    {product.isActive ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/products/${product.id}/edit`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}