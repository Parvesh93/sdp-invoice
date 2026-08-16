import Link from "next/link";

import ProductForm from "@/components/products/product-form";
import { prisma } from "@/lib/prisma";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },

    select: {
      id: true,
      name: true,
    },

    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-slate-500">
        <Link
          href="/products"
          className="hover:text-slate-900"
        >
          Products
        </Link>

        <span className="mx-2">/</span>

        <span>Add Product</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Add Product
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Add a product that can be used in quotations and order forms.
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}