import {
  notFound,
  redirect,
} from "next/navigation";

import DocumentForm from "@/components/documents/document-form";

import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export const dynamic =
  "force-dynamic";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditDocumentPage({
  params,
}: Props) {
  const { id } =
    await params;

  const documentId =
    Number(id);

  if (
    !Number.isInteger(
      documentId
    )
  ) {
    notFound();
  }

  const [
    document,
    categories,
    products,
    customers,
    settings,
  ] = await Promise.all([
    prisma.document.findUnique({
      where: {
        id:
          documentId,
      },

      include: {
        items:
          true,

        recipients:
          true,
      },
    }),

    prisma.category.findMany({
      where: {
        isActive:
          true,
      },

      select: {
        id:
          true,

        name:
          true,
      },

      orderBy: {
        name:
          "asc",
      },
    }),

    prisma.product.findMany({
      select: {
        id:
          true,

        name:
          true,

        model:
          true,

        description:
          true,

        categoryId:
          true,

        standardPrice:
          true,

        variants: {
          select: {
            id:
              true,

            name:
              true,

            isActive:
              true,
          },

          orderBy: {
            id:
              "asc",
          },
        },
      },

      orderBy: {
        name:
          "asc",
      },
    }),

    prisma.customer.findMany({
      select: {
        id:
          true,

        nameFirmName:
          true,

        email:
          true,

        phone:
          true,

        whatsapp:
          true,

        gstNumber:
          true,

        city:
          true,

        state:
          true,

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

  if (!document) {
    notFound();
  }

  if (
    document.status ===
    "SENT"
  ) {
    redirect(
      `/documents/${document.id}/preview`
    );
  }

  const toEmails =
    document.recipients
      .filter(
        (
          recipient
        ) =>
          recipient.type ===
          "TO"
      )
      .map(
        (
          recipient
        ) =>
          recipient.email
      )
      .join(", ");

  const ccEmails =
    document.recipients
      .filter(
        (
          recipient
        ) =>
          recipient.type ===
          "CC"
      )
      .map(
        (
          recipient
        ) =>
          recipient.email
      )
      .join(", ");

  const productMap =
    new Map(
      products.map(
        (
          product
        ) => [
          product.id,
          product,
        ]
      )
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Edit Document
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Edit{" "}
          {
            document.documentNumber
          }
          . Saving changes will
          require approval again.
        </p>
      </div>

      <DocumentForm
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

            variants:
              product.variants
                .filter(
                  (
                    variant
                  ) =>
                    variant.isActive
                )
                .map(
                  (
                    variant
                  ) => ({
                    id:
                      variant.id,

                    name:
                      variant.name,
                  })
                ),
          })
        )}
        document={{
          id:
            document.id,

          documentType:
            document.documentType,

          customer: {
            nameFirmName:
              document.customerNameFirm,

            email:
              toEmails,

            cc:
              ccEmails,

            phone:
              document.customerPhone ??
              "",

            whatsapp:
              document.customerWhatsapp ??
              "",

            gstNumber:
              document.customerGST ??
              "",

            city:
              document.customerCity ??
              "",

            state:
              document.customerState ??
              "",

            addressLine1:
              document.addressLine1 ??
              "",

            addressLine2:
              document.addressLine2 ??
              "",

            addressLine3:
              document.addressLine3 ??
              "",
          },

          gstType:
            document.gstType,

          gstPercent:
            document.gstPercent.toString(),

          additionalNotes:
            document.additionalNotes ??
            "",

          items:
            document.items.map(
              (
                item
              ) => {
                const product =
                  item.productId
                    ? productMap.get(
                        item.productId
                      )
                    : undefined;

                return {
                  productId:
                    item.productId ??
                    0,

                  categoryId:
                    product?.categoryId ??
                    0,

                  variantId:
                    item.variantId ??
                    null,

                  standardPrice:
                    item.standardPrice.toString(),

                  priceOverride:
                    item.priceOverride?.toString() ??
                    "",

                  quantity:
                    item.quantity,
                };
              }
            ),
        }}
      />
    </div>
  );
}