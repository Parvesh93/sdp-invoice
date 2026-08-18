import DocumentForm from "@/components/documents/document-form";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function CreateDocumentPage() {
  const [
    categories,
    products,
    customers,
    settings,
  ] = await Promise.all([
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

    prisma.product.findMany({
      where: {
        isActive: true,
      },

      select: {
        id: true,
        name: true,
        model: true,
        description: true,
        categoryId: true,
        standardPrice: true,

        variants: {
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
        },
      },

      orderBy: {
        name: "asc",
      },
    }),

    prisma.customer.findMany({
      select: {
        id: true,
        nameFirmName: true,
        email: true,
        phone: true,
        whatsapp: true,
        gstNumber: true,
        city: true,
        state: true,
        addressLine1: true,
        addressLine2: true,
        addressLine3: true,
      },

      orderBy: {
        nameFirmName: "asc",
      },
    }),

    getSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Create Document
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create a quotation or order form.
        </p>
      </div>

      <DocumentForm
        categories={categories}
        customers={customers}
        companyState={
          settings.companyState
        }
        defaultGstPercent={
          settings.gst
        }
        defaultGstType={
          settings.gstType
        }
        products={products.map(
          (product) => ({
            id:
              product.id,

            name:
              product.name,

            model:
              product.model,

            description:
              product.description,

            categoryId:
              product.categoryId,

            standardPrice:
              product.standardPrice.toString(),

            variants:
              product.variants,
          })
        )}
      />
    </div>
  );
}