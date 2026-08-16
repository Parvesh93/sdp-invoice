import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/products/product-form";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  const productId = Number(id);

  if (!Number.isInteger(productId)) {
    notFound();
  }

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: {
        id: productId,
      },

      include: {
        variants: {
          orderBy: {
            id: "asc",
          },
        },
      },
    }),

    prisma.category.findMany({
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
    }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Edit Product
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Update product details, variants and annexure content.
          </p>
        </div>

        <Link
          href="/products"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to Products
        </Link>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <ProductForm
          categories={categories}
          product={{
            id: product.id,

            name: product.name,

            model: product.model,

            description: product.description,

            annexureContent: product.annexureContent,

            standardPrice:
              product.standardPrice.toString(),

            categoryId: product.categoryId,

            isActive: product.isActive,

            variants: product.variants.map((variant) => ({
              id: variant.id,
              name: variant.name,
              isActive: variant.isActive,
            })),
          }}
        />
      </div>
    </div>
  );
}