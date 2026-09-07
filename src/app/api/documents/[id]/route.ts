import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

import {
  rebuildDocumentNumber,
} from "@/lib/document-number";

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

function cleanIssuerInitials(
  value: unknown
) {
  return String(
    value ?? ""
  )
    .trim()
    .toUpperCase()
    .replace(
      /[^A-Z]/g,
      ""
    )
    .slice(
      0,
      4
    );
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
    .replace(
      /\s+/g,
      " "
    );
}

function normalizeGstType(
  value:
    | string
    | null
    | undefined
): GstType {
  return value ===
    "IGST"
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

  if (
    normalizedCustomerState &&
    normalizedCompanyState
  ) {
    return normalizedCustomerState ===
      normalizedCompanyState
      ? "CGST_SGST"
      : "IGST";
  }

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
    /* =====================================================
       AUTH
    ===================================================== */

    const session =
      await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Unauthorized.",
        },
        {
          status:
            401,
        }
      );
    }

    /* =====================================================
       DOCUMENT ID
    ===================================================== */

    const { id } =
      await context.params;

    const documentId =
      Number(id);

    if (
      !Number.isInteger(
        documentId
      ) ||
      documentId <=
        0
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Invalid document ID.",
        },
        {
          status:
            400,
        }
      );
    }

    /* =====================================================
       EXISTING DOCUMENT
    ===================================================== */

    const existingDocument =
      await prisma.document.findUnique({
        where: {
          id:
            documentId,
        },
      });

    if (
      !existingDocument
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Document not found.",
        },
        {
          status:
            404,
        }
      );
    }

    if (
      existingDocument.status ===
      "SENT"
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Sent documents cannot be edited.",
        },
        {
          status:
            400,
        }
      );
    }

    /* =====================================================
       BODY / SETTINGS
    ===================================================== */

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

    /* =====================================================
       ISSUER INITIALS
    ===================================================== */

    const issuerInitials =
      cleanIssuerInitials(
        body.issuerInitials
      );

    if (
      !issuerInitials
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Issuer initials are required.",
        },
        {
          status:
            422,
        }
      );
    }

    /* =====================================================
       CUSTOMER
    ===================================================== */

    const customer =
      body.customer ??
      {};

    const nameFirmName =
      String(
        customer.nameFirmName ??
          ""
      ).trim();

    if (
      !nameFirmName
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Name / Firm Name is required.",
        },
        {
          status:
            422,
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

    if (
      !customerState
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Customer state is required.",
        },
        {
          status:
            422,
        }
      );
    }

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

    /* =====================================================
       REBUILD DOCUMENT NUMBER

       Example:

       Existing:
       SDPM/JK/26-27/MB/016

       State changed to Gujarat:
       SDPM/GJ/26-27/MB/016

       Issuer changed to PT:
       SDPM/GJ/26-27/PT/016

       Financial year and sequence remain unchanged.
    ===================================================== */

    const updatedDocumentNumber =
      rebuildDocumentNumber({
        existingDocumentNumber:
          existingDocument.documentNumber,

        customerState,

        issuerInitials,
      });

    /* =====================================================
       PRODUCTS
    ===================================================== */

    if (
      !Array.isArray(
        body.items
      ) ||
      body.items.length ===
        0
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "At least one product is required.",
        },
        {
          status:
            422,
        }
      );
    }

    const productIds =
      body.items.map(
        (
          item: {
            productId:
              number;
          }
        ) =>
          Number(
            item.productId
          )
      );

    if (
      productIds.some(
        (
          productId:
            number
        ) =>
          !Number.isInteger(
            productId
          ) ||
          productId <=
            0
      )
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "One or more selected products are invalid.",
        },
        {
          status:
            422,
        }
      );
    }

    /* =====================================================
       LOAD PRODUCTS
    ===================================================== */

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
        },
      });

    if (
      products.length !==
      new Set(
        productIds
      ).size
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "One or more selected products are invalid.",
        },
        {
          status:
            422,
        }
      );
    }

    /* =====================================================
       PREPARE ITEMS
    ===================================================== */

    const preparedItems =
      body.items.map(
        (
          item: {
            productId:
              number;

            quantity:
              number;

            priceOverride:
              | number
              | string
              | null;
          }
        ) => {
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

          if (
            !product
          ) {
            throw new Error(
              "One or more selected products are invalid."
            );
          }

          const standardPrice =
            Number(
              product.standardPrice
            );

          if (
            !Number.isFinite(
              standardPrice
            ) ||
            standardPrice <
              0
          ) {
            throw new Error(
              `Invalid standard price for ${product.name}.`
            );
          }

          const priceOverride =
            item.priceOverride ===
              null ||
            item.priceOverride ===
              undefined ||
            String(
              item.priceOverride
            ).trim() ===
              ""
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
              priceOverride <
                0
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

          const quantity =
            Number(
              item.quantity
            );

          if (
            !Number.isInteger(
              quantity
            ) ||
            quantity <
              1
          ) {
            throw new Error(
              `Quantity must be at least 1 for ${product.name}.`
            );
          }

          return {
            productId:
              product.id,

            variantId:
              null,

            variantName:
              null,

            productName:
              product.name,

            productModel:
              product.model,

            productDescription:
              product.description,

            categoryName:
              product.category.name,

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

    /* =====================================================
       SUBTOTAL
    ===================================================== */

    const subtotal =
      preparedItems.reduce(
        (
          sum:
            number,

          item: {
            lineTotal:
              number;
          }
        ) =>
          sum +
          item.lineTotal,

        0
      );

    /* =====================================================
       GST

       Existing GST rate is preserved.

       GST type is recalculated if customer state changes.
    ===================================================== */

    const gstPercent =
      Number(
        existingDocument.gstPercent
      );

    if (
      !Number.isFinite(
        gstPercent
      ) ||
      gstPercent <
        0 ||
      gstPercent >
        100
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Invalid GST percentage on this document.",
        },
        {
          status:
            500,
        }
      );
    }

    const gstType =
      determineGstType({
        customerState,

        companyState:
          settings.companyState,

        fallback:
          existingDocument.gstType ??
          settings.gstType,
      });

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

    const gstAmount =
      cgstAmount +
      sgstAmount +
      igstAmount;

    const grandTotal =
      subtotal +
      gstAmount;

    /* =====================================================
       NEXT STATUS
    ===================================================== */

    const nextStatus =
      saveAsDraft
        ? "DRAFT"
        : "PREVIEWED";

    /* =====================================================
       UPDATE
    ===================================================== */

    const updated =
      await prisma.$transaction(
        async (
          tx
        ) => {
          /* ---------------------------------------------
             REMOVE OLD ITEMS
          --------------------------------------------- */

          await tx.documentItem.deleteMany({
            where: {
              documentId,
            },
          });

          /* ---------------------------------------------
             REMOVE OLD RECIPIENTS
          --------------------------------------------- */

          await tx.documentRecipient.deleteMany({
            where: {
              documentId,
            },
          });

          /* ---------------------------------------------
             UPDATE DOCUMENT
          --------------------------------------------- */

          return tx.document.update({
            where: {
              id:
                documentId,
            },

            data: {
              /* -----------------------------------------
                 REFERENCE NUMBER
              ----------------------------------------- */

              documentNumber:
                updatedDocumentNumber,

              documentType,

              issuerInitials,

              status:
                nextStatus,

              /*
               * Editing requires approval again.
               */
              approvedAt:
                null,

              /* -----------------------------------------
                 CUSTOMER
              ----------------------------------------- */

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

              /* -----------------------------------------
                 TOTALS
              ----------------------------------------- */

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

              /* -----------------------------------------
                 NOTES
              ----------------------------------------- */

              additionalNotes:
                cleanString(
                  body.additionalNotes
                ),

              /* -----------------------------------------
                 SNAPSHOTS
              ----------------------------------------- */

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

              bankDetailsSnapshot:
                documentType ===
                "ORDER_FORM"
                  ? settings.bankDetails ||
                    null
                  : null,

              signatureImageSnapshot:
                settings.signatureImage ||
                null,

              /* -----------------------------------------
                 ITEMS
              ----------------------------------------- */

              items: {
                create:
                  preparedItems,
              },

              /* -----------------------------------------
                 RECIPIENTS
              ----------------------------------------- */

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

              /* -----------------------------------------
                 ACTIVITY
              ----------------------------------------- */

              activities: {
                create: {
                  action:
                    saveAsDraft
                      ? "DOCUMENT_DRAFT_SAVED"
                      : "DOCUMENT_EDITED",

                  description:
                    saveAsDraft
                      ? `Draft saved by ${session.name}. Reference updated from ${existingDocument.documentNumber} to ${updatedDocumentNumber}. Issuer: ${issuerInitials}. GST type: ${gstType}.`
                      : `Document edited by ${session.name}. Approval required again. Reference updated from ${existingDocument.documentNumber} to ${updatedDocumentNumber}. Issuer: ${issuerInitials}. GST type: ${gstType}.`,
                },
              },
            },

            select: {
              id:
                true,

              documentNumber:
                true,

              documentType:
                true,

              issuerInitials:
                true,

              status:
                true,

              customerState:
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

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json({
      success:
        true,

      message:
        saveAsDraft
          ? "Draft saved successfully."
          : "Document updated successfully.",

      data:
        updated,
    });
  } catch (
    error
  ) {
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