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

type GstType =
  | "CGST_SGST"
  | "IGST";

/* =========================================================
   HELPERS
========================================================= */

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

function cleanString(
  value: unknown
) {
  const cleaned =
    String(
      value ?? ""
    ).trim();

  return cleaned || null;
}

function cleanUppercase(
  value: unknown
) {
  const cleaned =
    String(
      value ?? ""
    )
      .trim()
      .toUpperCase();

  return cleaned || null;
}

/* =========================================================
   GST HELPERS
========================================================= */

function normalizeState(
  value:
    | string
    | null
    | undefined
) {
  return String(
    value ?? ""
  )
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeGstType(
  value:
    | string
    | null
    | undefined
): GstType {
  return value === "IGST"
    ? "IGST"
    : "CGST_SGST";
}

function determineGstType({
  customerState,
  companyState,
  fallback,
}: {
  customerState:
    | string
    | null
    | undefined;

  companyState:
    | string
    | null
    | undefined;

  fallback:
    | string
    | null
    | undefined;
}): GstType {
  const normalizedCustomerState =
    normalizeState(
      customerState
    );

  const normalizedCompanyState =
    normalizeState(
      companyState
    );

  /*
   * If both states are available,
   * the state comparison is authoritative.
   */
  if (
    normalizedCustomerState &&
    normalizedCompanyState
  ) {
    return normalizedCustomerState ===
      normalizedCompanyState
      ? "CGST_SGST"
      : "IGST";
  }

  /*
   * If either state is missing,
   * fall back to Settings.
   */
  return normalizeGstType(
    fallback
  );
}

/* =========================================================
   UPDATE DOCUMENT
========================================================= */

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    /* =========================================
       AUTH
    ========================================= */

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

    /* =========================================
       DOCUMENT ID
    ========================================= */

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

    /* =========================================
       EXISTING DOCUMENT
    ========================================= */

    const existingDocument =
      await prisma.document.findUnique({
        where: {
          id:
            documentId,
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

    /*
     * Once sent, preserve the final document.
     */
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

    /* =========================================
       REQUEST
    ========================================= */

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

    /* =========================================
       CUSTOMER
    ========================================= */

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

    const customerPhone =
      cleanString(
        customer.phone
      );

    const customerWhatsapp =
      cleanString(
        customer.whatsapp
      );

    const customerGST =
      cleanUppercase(
        customer.gstNumber
      );

    const customerCity =
      cleanString(
        customer.city
      );

    const customerState =
      cleanString(
        customer.state
      );

    const customerAddressLine1 =
      cleanString(
        customer.addressLine1
      );

    const customerAddressLine2 =
      cleanString(
        customer.addressLine2
      );

    const customerAddressLine3 =
      cleanString(
        customer.addressLine3
      );

    /* =========================================
       EMAILS
    ========================================= */

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
          customer.cc ??
            ""
        )
      );

    /* =========================================
       ITEMS
    ========================================= */

    if (
      !Array.isArray(
        body.items
      ) ||
      body.items.length ===
        0
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

    if (
      productIds.some(
        (
          productId: number
        ) =>
          !Number.isInteger(
            productId
          ) ||
          productId <= 0
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "One or more selected products are invalid.",
        },
        {
          status: 422,
        }
      );
    }

    /* =========================================
       LOAD PRODUCTS
    ========================================= */

    const products =
      await prisma.product.findMany({
        where: {
          id: {
            in:
              productIds,
          },
        },

        include: {
          category:
            true,

          variants:
            true,
        },
      });

    /*
     * Same product can appear multiple times,
     * so compare against unique IDs.
     */
    if (
      products.length !==
      new Set(
        productIds
      ).size
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "One or more selected products are invalid.",
        },
        {
          status: 422,
        }
      );
    }

    /* =========================================
       PREPARE ITEMS
    ========================================= */

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
            | string
            | null;
        }) => {
          const product =
            products.find(
              (
                product
              ) =>
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

          /* -------------------------------------
             VARIANT
          ------------------------------------- */

          let variant:
            | (typeof product.variants)[number]
            | undefined;

          if (
            item.variantId !==
              null &&
            item.variantId !==
              undefined &&
            Number(
              item.variantId
            ) > 0
          ) {
            variant =
              product.variants.find(
                (
                  variant
                ) =>
                  variant.id ===
                    Number(
                      item.variantId
                    ) &&
                  variant.isActive
              );

            if (!variant) {
              throw new Error(
                `Invalid or inactive variant selected for ${product.name}.`
              );
            }
          }

          const hasActiveVariants =
            product.variants.some(
              (
                variant
              ) =>
                variant.isActive
            );

          if (
            hasActiveVariants &&
            !variant
          ) {
            throw new Error(
              `Please select a variant for ${product.name}.`
            );
          }

          /* -------------------------------------
             STANDARD PRICE
          ------------------------------------- */

          const standardPrice =
            Number(
              product.standardPrice
            );

          if (
            !Number.isFinite(
              standardPrice
            ) ||
            standardPrice < 0
          ) {
            throw new Error(
              `Invalid standard price for ${product.name}.`
            );
          }

          /* -------------------------------------
             PRICE OVERRIDE
          ------------------------------------- */

          const priceOverride =
            item.priceOverride ===
              null ||
            item.priceOverride ===
              undefined ||
            String(
              item.priceOverride
            ).trim() === ""
              ? null
              : Number(
                  item.priceOverride
                );

          if (
            priceOverride !==
              null &&
            (
              !Number.isFinite(
                priceOverride
              ) ||
              priceOverride < 0
            )
          ) {
            throw new Error(
              `Invalid price override for ${product.name}.`
            );
          }

          const finalPrice =
            priceOverride !==
            null
              ? priceOverride
              : standardPrice;

          /* -------------------------------------
             QUANTITY
          ------------------------------------- */

          const quantity =
            Number(
              item.quantity
            );

          if (
            !Number.isInteger(
              quantity
            ) ||
            quantity < 1
          ) {
            throw new Error(
              `Quantity must be at least 1 for ${product.name}.`
            );
          }

          /* -------------------------------------
             ITEM SNAPSHOT
          ------------------------------------- */

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
              product.category.name,

            variantName:
              variant?.name ??
              null,

            annexureSnapshot:
              product.annexureContent ??
              null,

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

    /* =========================================
       SUBTOTAL
    ========================================= */

    const subtotal =
      preparedItems.reduce(
        (
          sum: number,

          item:
            (typeof preparedItems)[number]
        ) =>
          sum +
          item.lineTotal,

        0
      );

    /* =========================================
       GST PERCENTAGE
    ========================================= */

    const gstPercent =
      Number(
        body.gstPercent ??
          settings.gst ??
          existingDocument
            .gstPercent ??
          18
      );

    if (
      !Number.isFinite(
        gstPercent
      ) ||
      gstPercent < 0 ||
      gstPercent > 100
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "GST percentage must be between 0 and 100.",
        },
        {
          status: 422,
        }
      );
    }

    /* =========================================
       AUTOMATIC GST TYPE

       Company State == Customer State
       -> CGST + SGST

       Company State != Customer State
       -> IGST
    ========================================= */

    const gstType =
      determineGstType({
        customerState,

        companyState:
          settings.companyState,

        fallback:
          settings.gstType ??
          existingDocument.gstType,
      });

    /* =========================================
       GST BREAKUP
    ========================================= */

    const cgstPercent =
      gstType ===
      "CGST_SGST"
        ? gstPercent /
          2
        : 0;

    const sgstPercent =
      gstType ===
      "CGST_SGST"
        ? gstPercent /
          2
        : 0;

    const igstPercent =
      gstType ===
      "IGST"
        ? gstPercent
        : 0;

    const cgstAmount =
      subtotal *
      (
        cgstPercent /
        100
      );

    const sgstAmount =
      subtotal *
      (
        sgstPercent /
        100
      );

    const igstAmount =
      subtotal *
      (
        igstPercent /
        100
      );

    /*
     * Total GST is the combined
     * tax amount regardless of type.
     */
    const gstAmount =
      cgstAmount +
      sgstAmount +
      igstAmount;

    const grandTotal =
      subtotal +
      gstAmount;

    /* =========================================
       STATUS
    ========================================= */

    const nextStatus =
      saveAsDraft
        ? "DRAFT"
        : "PREVIEWED";

    /* =========================================
       TRANSACTION
    ========================================= */

    const updated =
      await prisma.$transaction(
        async (
          tx
        ) => {
          /*
           * Existing item/recipient snapshots
           * are replaced with the newly edited
           * values.
           */

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
              id:
                documentId,
            },

            data: {
              /* ---------------------------------
                 DOCUMENT
              --------------------------------- */

              documentType,

              status:
                nextStatus,

              /*
               * Editing requires approval again.
               */
              approvedAt:
                null,

              /* ---------------------------------
                 CUSTOMER SNAPSHOT
              --------------------------------- */

              customerNameFirm:
                nameFirmName,

              customerPhone,

              customerWhatsapp,

              customerGST,

              customerCity,

              customerState,

              addressLine1:
                customerAddressLine1,

              addressLine2:
                customerAddressLine2,

              addressLine3:
                customerAddressLine3,

              /* ---------------------------------
                 TOTALS
              --------------------------------- */

              subtotal,

              gstType,

              gstPercent,

              cgstPercent,

              cgstAmount,

              sgstPercent,

              sgstAmount,

              igstPercent,

              igstAmount,

              gstAmount,

              grandTotal,

              additionalNotes:
                cleanString(
                  body.additionalNotes
                ),

              /* ---------------------------------
                 SETTINGS SNAPSHOT
              --------------------------------- */

              headerBannerSnapshot:
                settings.headerBanner ||
                null,

              footerBannerSnapshot:
                settings.footerBanner ||
                null,

              termsSnapshot:
                settings.terms ||
                null,

              warrantySnapshot:
                settings.warranty ||
                null,

              quoteFooterSnapshot:
                settings.quoteFooter ||
                null,

              signatureImageSnapshot:
                settings.signatureImage ||
                null,

              /* ---------------------------------
                 ITEMS
              --------------------------------- */

              items: {
                create:
                  preparedItems,
              },

              /* ---------------------------------
                 RECIPIENTS
              --------------------------------- */

              recipients: {
                create: [
                  ...toEmails.map(
                    (
                      email
                    ) => ({
                      email,

                      type:
                        "TO" as const,
                    })
                  ),

                  ...ccEmails.map(
                    (
                      email
                    ) => ({
                      email,

                      type:
                        "CC" as const,
                    })
                  ),
                ],
              },

              /* ---------------------------------
                 ACTIVITY
              --------------------------------- */

              activities: {
                create: {
                  action:
                    saveAsDraft
                      ? "DOCUMENT_DRAFT_SAVED"
                      : "DOCUMENT_EDITED",

                  description:
                    saveAsDraft
                      ? `Draft saved by ${session.name}. GST type: ${gstType}.`
                      : `Document edited by ${session.name}. Approval required again. GST type: ${gstType}.`,
                },
              },
            },

            select: {
              id:
                true,

              documentNumber:
                true,

              status:
                true,

              gstType:
                true,

              gstPercent:
                true,

              cgstPercent:
                true,

              cgstAmount:
                true,

              sgstPercent:
                true,

              sgstAmount:
                true,

              igstPercent:
                true,

              igstAmount:
                true,

              gstAmount:
                true,

              grandTotal:
                true,
            },
          });
        }
      );

    /* =========================================
       RESPONSE
    ========================================= */

    return NextResponse.json({
      success:
        true,

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

        gstType:
          updated.gstType,

        gstPercent:
          updated.gstPercent,

        cgstPercent:
          updated.cgstPercent,

        cgstAmount:
          updated.cgstAmount,

        sgstPercent:
          updated.sgstPercent,

        sgstAmount:
          updated.sgstAmount,

        igstPercent:
          updated.igstPercent,

        igstAmount:
          updated.igstAmount,

        gstAmount:
          updated.gstAmount,

        grandTotal:
          updated.grandTotal,
      },
    });
  } catch (error) {
    console.error(
      "UPDATE DOCUMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        message:
          error instanceof
            Error
            ? error.message
            : "Unable to update document.",
      },
      {
        status:
          500,
      }
    );
  }
}