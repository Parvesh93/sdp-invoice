import DocumentForm from "@/components/documents/document-form";

import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export const dynamic =
  "force-dynamic";

export default async function PublicQuotationPage() {
  const [
    categories,
    products,
    customers,
    settings,
  ] =
    await Promise.all([
      prisma.category.findMany({
        where: {
          isActive:
            true,
        },

        select: {
          id: true,
          name: true,
        },

        orderBy: {
          name:
            "asc",
        },
      }),

      prisma.product.findMany({
        where: {
          isActive:
            true,
        },

        select: {
          id: true,
          name: true,
          model: true,
          description:
            true,
          categoryId:
            true,
          standardPrice:
            true,
        },

        orderBy: {
          name:
            "asc",
        },
      }),

      /*
       * Client specifically requires existing
       * customer selection on this page.
       */
      prisma.customer.findMany({
        select: {
          id: true,
          nameFirmName:
            true,
          email: true,
          phone: true,
          whatsapp:
            true,
          gstNumber:
            true,
          city: true,
          state: true,
          addressLine1:
            true,
          addressLine2:
            true,
          addressLine3:
            true,
        },

        orderBy: {
          nameFirmName:
            "asc",
        },
      }),

      getSettings(),
    ]);

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <div>
            <div className="text-xl font-bold text-slate-950">
              SDP Machines
            </div>

            <div className="mt-0.5 text-xs uppercase tracking-[0.18em] text-slate-400">
              Quotation Generator
            </div>
          </div>

          <div className="hidden text-sm text-slate-500 sm:block">
            Quotation Management System
          </div>
        </div>
      </header>

      {/* Content */}

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-950">
            Create Quotation
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Select an existing customer or create a new one,
            add machines and generate the quotation.
          </p>
        </div>

        <DocumentForm
          publicMode
          submitEndpoint="/api/public/quotation"
          previewBasePath="/quotation"

          categories={
            categories
          }

          customers={
            customers
          }

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
            (
              product
            ) => ({
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
            })
          )}
        />
      </div>
    </main>
  );
}