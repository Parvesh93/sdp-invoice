import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { getSettings } from "@/lib/settings";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseEmails(
  value: string
) {
  return value
    .split(/[;,]/)
    .map((email) =>
      email
        .trim()
        .toLowerCase()
    )
    .filter(Boolean);
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session =
      await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const { id } =
      await context.params;

    const documentId =
      Number(id);

    if (
      !Number.isInteger(
        documentId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid document ID.",
        },
        {
          status: 400,
        }
      );
    }

    const existingDocument =
      await prisma.document.findUnique({
        where: {
          id: documentId,
        },
      });

    if (!existingDocument) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Document not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      existingDocument.status ===
      "SENT"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Sent documents cannot be edited.",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

      const settings =
  await getSettings();

    const saveAsDraft =
      body.saveAsDraft ===
      true;

    const documentType =
      body.documentType ===
      "ORDER_FORM"
        ? "ORDER_FORM"
        : "QUOTATION";

    const customer =
      body.customer ?? {};

    const nameFirmName =
      String(
        customer.nameFirmName ??
          ""
      ).trim();

    if (!nameFirmName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name / Firm Name is required.",
        },
        {
          status: 422,
        }
      );
    }

    if (
      !Array.isArray(
        body.items
      ) ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "At least one product is required.",
        },
        {
          status: 422,
        }
      );
    }

    const productIds =
      body.items.map(
        (item: {
          productId:
            number;
        }) =>
          Number(
            item.productId
          )
      );

    const products =
      await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },

        include: {
          category: true,
          variants: true,
        },
      });

    const preparedItems =
      body.items.map(
        (item: {
          productId:
            number;

          variantId:
            | number
            | null;

          quantity:
            number;

          priceOverride:
            | number
            | null;
        }) => {
          const product =
            products.find(
              (product) =>
                product.id ===
                Number(
                  item.productId
                )
            );

          if (!product) {
            throw new Error(
              "One or more selected products are invalid."
            );
          }

          let variant:
            | (typeof product.variants)[number]
            | undefined;

          if (
            item.variantId
          ) {
            variant =
              product.variants.find(
                (variant) =>
                  variant.id ===
                  Number(
                    item.variantId
                  )
              );

            if (!variant) {
              throw new Error(
                `Invalid variant selected for ${product.name}.`
              );
            }
          }

          if (
            product.variants.some(
              (variant) =>
                variant.isActive
            ) &&
            !variant
          ) {
            throw new Error(
              `Please select a variant for ${product.name}.`
            );
          }

          const standardPrice =
            Number(
              product.standardPrice
            );

          const priceOverride =
            item.priceOverride ===
              null ||
            item.priceOverride ===
              undefined
              ? null
              : Number(
                  item.priceOverride
                );

          if (
            priceOverride !==
              null &&
            priceOverride < 0
          ) {
            throw new Error(
              "Price override cannot be negative."
            );
          }

          const finalPrice =
            priceOverride !==
            null
              ? priceOverride
              : standardPrice;

          const quantity =
            Math.max(
              1,
              Number(
                item.quantity
              )
            );

          return {
            productId:
              product.id,

            variantId:
              variant?.id ??
              null,

            productName:
              product.name,

            productModel:
              product.model,

            productDescription:
              product.description,

            categoryName:
              product.category
                .name,

            variantName:
              variant?.name ??
              null,

              annexureSnapshot:
  product.annexureContent,

            standardPrice,

            priceOverride,

            finalPrice,

            quantity,

            lineTotal:
              finalPrice *
              quantity,
          };
        }
      );

    const subtotal =
      preparedItems.reduce(
        (
          sum: number,
          item: typeof preparedItems[number]
        ) =>
          sum +
          item.lineTotal,

        0
      );

    const gstPercent =
      Number(
        body.gstPercent ??
          18
      );

    if (
      !Number.isFinite(
        gstPercent
      ) ||
      gstPercent < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid GST percentage.",
        },
        {
          status: 422,
        }
      );
    }

    const gstAmount =
      subtotal *
      (gstPercent / 100);

    const grandTotal =
      subtotal +
      gstAmount;

    const toEmails =
      parseEmails(
        String(
          customer.email ??
            ""
        )
      );

    const ccEmails =
      parseEmails(
        String(
          customer.cc ?? ""
        )
      );

    const nextStatus =
      saveAsDraft
        ? "DRAFT"
        : "PREVIEWED";

    const updated =
      await prisma.$transaction(
        async (tx) => {
          await tx.documentItem.deleteMany({
            where: {
              documentId,
            },
          });

          await tx.documentRecipient.deleteMany({
            where: {
              documentId,
            },
          });

          return tx.document.update({
            where: {
              id: documentId,
            },

            data: {
              documentType,

              status:
                nextStatus,

              approvedAt:
                null,

              customerNameFirm:
                nameFirmName,

              customerPhone:
                String(
                  customer.phone ??
                    ""
                ).trim() ||
                null,

              customerWhatsapp:
                String(
                  customer.whatsapp ??
                    ""
                ).trim() ||
                null,

              customerGST:
                String(
                  customer.gstNumber ??
                    ""
                ).trim() ||
                null,

              customerCity:
                String(
                  customer.city ??
                    ""
                ).trim() ||
                null,

              customerState:
                String(
                  customer.state ??
                    ""
                ).trim() ||
                null,

              addressLine1:
                String(
                  customer.addressLine1 ??
                    ""
                ).trim() ||
                null,

              addressLine2:
                String(
                  customer.addressLine2 ??
                    ""
                ).trim() ||
                null,

              addressLine3:
                String(
                  customer.addressLine3 ??
                    ""
                ).trim() ||
                null,

              subtotal,

              gstPercent,

              gstAmount,

              grandTotal,

              additionalNotes:
                String(
                  body.additionalNotes ??
                    ""
                ).trim() ||
                null,

                headerBannerSnapshot:
  settings.headerBanner || null,

footerBannerSnapshot:
  settings.footerBanner || null,

termsSnapshot:
  settings.terms || null,

warrantySnapshot:
  settings.warranty || null,

quoteFooterSnapshot:
  settings.quoteFooter || null,

signatureImageSnapshot:
  settings.signatureImage || null,

              items: {
                create:
                  preparedItems,
              },

              recipients: {
                create: [
                  ...toEmails.map(
                    (email) => ({
                      email,

                      type:
                        "TO" as const,
                    })
                  ),

                  ...ccEmails.map(
                    (email) => ({
                      email,

                      type:
                        "CC" as const,
                    })
                  ),
                ],
              },

              activities: {
                create: {
                  action:
                    saveAsDraft
                      ? "DOCUMENT_DRAFT_SAVED"
                      : "DOCUMENT_EDITED",

                  description:
                    saveAsDraft
                      ? `Draft saved by ${session.name}.`
                      : `Document edited by ${session.name}. Approval required again.`,
                },
              },
            },

            select: {
              id: true,

              documentNumber:
                true,

              status: true,
            },
          });
        }
      );

    return NextResponse.json({
      success: true,

      message:
        saveAsDraft
          ? "Draft saved successfully."
          : "Document updated successfully.",

      data: {
        id:
          updated.id,

        documentNumber:
          updated.documentNumber,

        status:
          updated.status,
      },
    });
  } catch (error) {
    console.error(
      "UPDATE DOCUMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to update document.",
      },
      {
        status: 500,
      }
    );
  }
}