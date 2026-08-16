import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

import {
  generateDocumentNumber,
} from "@/lib/document-number";

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
   CUSTOMER RESOLUTION

   Priority:

   1. GST
   2. Email
   3. Phone

   If nothing matches:
   -> create new Customer

   If customer exists:
   -> update master using non-empty incoming values
========================================================= */

async function resolveCustomer({
  nameFirmName,

  email,

  phone,

  whatsapp,

  gstNumber,

  city,

  state,

  addressLine1,

  addressLine2,

  addressLine3,
}: {
  nameFirmName: string;

  email: string | null;

  phone: string | null;

  whatsapp: string | null;

  gstNumber: string | null;

  city: string | null;

  state: string | null;

  addressLine1: string | null;

  addressLine2: string | null;

  addressLine3: string | null;
}) {
  let existingCustomer =
    null;

  /* -----------------------------------------------------
     1. GST MATCH
  ----------------------------------------------------- */

  if (gstNumber) {
    existingCustomer =
      await prisma.customer.findFirst({
        where: {
          gstNumber,
        },
      });
  }

  /* -----------------------------------------------------
     2. EMAIL MATCH
  ----------------------------------------------------- */

  if (
    !existingCustomer &&
    email
  ) {
    existingCustomer =
      await prisma.customer.findFirst({
        where: {
          email,
        },
      });
  }

  /* -----------------------------------------------------
     3. PHONE MATCH
  ----------------------------------------------------- */

  if (
    !existingCustomer &&
    phone
  ) {
    existingCustomer =
      await prisma.customer.findFirst({
        where: {
          phone,
        },
      });
  }

  /* -----------------------------------------------------
     EXISTING CUSTOMER
  ----------------------------------------------------- */

  if (existingCustomer) {
    /*
     * Refresh the customer master from the latest
     * document information.
     *
     * Empty document fields do NOT erase existing
     * customer information.
     */

    const customer =
      await prisma.customer.update({
        where: {
          id:
            existingCustomer.id,
        },

        data: {
          nameFirmName,

          email:
            email ??
            existingCustomer.email,

          phone:
            phone ??
            existingCustomer.phone,

          whatsapp:
            whatsapp ??
            existingCustomer.whatsapp,

          gstNumber:
            gstNumber ??
            existingCustomer.gstNumber,

          city:
            city ??
            existingCustomer.city,

          state:
            state ??
            existingCustomer.state,

          addressLine1:
            addressLine1 ??
            existingCustomer.addressLine1,

          addressLine2:
            addressLine2 ??
            existingCustomer.addressLine2,

          addressLine3:
            addressLine3 ??
            existingCustomer.addressLine3,
        },
      });

    return customer;
  }

  /* -----------------------------------------------------
     NEW CUSTOMER
  ----------------------------------------------------- */

  return prisma.customer.create({
    data: {
      nameFirmName,

      email,

      phone,

      whatsapp,

      gstNumber,

      city,

      state,

      addressLine1,

      addressLine2,

      addressLine3,
    },
  });
}

/* =========================================================
   CREATE DOCUMENT
========================================================= */

export async function POST(
  request: NextRequest
) {
  try {
    /* =========================================
       AUTHENTICATION
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
       CUSTOMER INPUT
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

    /*
     * Email field may contain multiple
     * comma/semicolon-separated recipients.
     */

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

    /*
     * Customer master stores one primary email.
     *
     * The document recipient list can still
     * contain multiple To / CC emails.
     */

    const primaryEmail =
      toEmails[0] ??
      null;

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
       PRODUCTS
    ========================================= */

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
          productId: number;
        }) =>
          Number(
            item.productId
          )
      );

    /*
     * Reject invalid product IDs.
     */

    if (
      productIds.some(
        (id: number) =>
          !Number.isInteger(
            id
          ) ||
          id <= 0
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
            in: productIds,
          },

          isActive:
            true,
        },

        include: {
          category:
            true,

          variants:
            true,
        },
      });

    /*
     * Same product may appear more than once,
     * therefore compare against unique IDs.
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
            "One or more selected products are invalid or inactive.",
        },
        {
          status: 422,
        }
      );
    }

    /* =========================================
       PREPARE DOCUMENT ITEMS
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
              (product) =>
                product.id ===
                Number(
                  item.productId
                )
            );

          if (!product) {
            throw new Error(
              "Product not found."
            );
          }

          /* -----------------------------------------
             VARIANT
          ----------------------------------------- */

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
                (variant) =>
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
              (variant) =>
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

          /* -----------------------------------------
             STANDARD PRICE
          ----------------------------------------- */

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

          /* -----------------------------------------
             PRICE OVERRIDE
          ----------------------------------------- */

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
            (!Number.isFinite(
              priceOverride
            ) ||
              priceOverride <
                0)
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

          /* -----------------------------------------
             QUANTITY
          ----------------------------------------- */

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

          /* -----------------------------------------
             ITEM SNAPSHOT
          ----------------------------------------- */

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
       TOTALS
    ========================================= */

    const subtotal =
      preparedItems.reduce(
        (
          total: number,

          item: {
            lineTotal:
              number;
          }
        ) =>
          total +
          item.lineTotal,

        0
      );

    /*
     * Form value wins.
     *
     * If absent, use Settings GST.
     */

    const gstPercent =
      Number(
        body.gstPercent ??
          settings.gst ??
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

    const gstAmount =
      subtotal *
      (gstPercent /
        100);

    const grandTotal =
      subtotal +
      gstAmount;

    /* =========================================
       CUSTOMER MASTER
    ========================================= */

    /*
     * IMPORTANT:
     *
     * Any customer entered directly while
     * creating a document is automatically
     * added to / linked with Customer master.
     */

    const masterCustomer =
      await resolveCustomer({
        nameFirmName,

        email:
          primaryEmail,

        phone:
          customerPhone,

        whatsapp:
          customerWhatsapp,

        gstNumber:
          customerGST,

        city:
          customerCity,

        state:
          customerState,

        addressLine1:
          customerAddressLine1,

        addressLine2:
          customerAddressLine2,

        addressLine3:
          customerAddressLine3,
      });

    /* =========================================
       DOCUMENT NUMBER
    ========================================= */

    const documentNumber =
      await generateDocumentNumber();

    /* =========================================
       DOCUMENT STATUS
    ========================================= */

    const status =
      saveAsDraft
        ? "DRAFT"
        : "PREVIEWED";

    /* =========================================
       CREATE DOCUMENT
    ========================================= */

    const document =
      await prisma.document.create({
        data: {
          documentNumber,

          documentType,

          status,

          /* -------------------------------------
             CUSTOMER RELATION
          ------------------------------------- */

          customerId:
            masterCustomer.id,

          /* -------------------------------------
             CUSTOMER SNAPSHOT

             This deliberately remains separate
             from Customer master.

             Editing Customer later will NOT
             change this historical document.
          ------------------------------------- */

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

          /* -------------------------------------
             TOTALS
          ------------------------------------- */

          subtotal,

          gstPercent,

          gstAmount,

          grandTotal,

          additionalNotes:
            cleanString(
              body.additionalNotes
            ),

          /* -------------------------------------
             SETTINGS SNAPSHOT
          ------------------------------------- */

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

          /* -------------------------------------
             CREATOR
          ------------------------------------- */

          createdById:
            session.userId,

          /* -------------------------------------
             ITEMS
          ------------------------------------- */

          items: {
            create:
              preparedItems,
          },

          /* -------------------------------------
             RECIPIENTS
          ------------------------------------- */

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

          /* -------------------------------------
             ACTIVITY
          ------------------------------------- */

          activities: {
            create: {
              action:
                saveAsDraft
                  ? "DOCUMENT_DRAFT_SAVED"
                  : "DOCUMENT_CREATED",

              description:
                saveAsDraft
                  ? `Draft saved by ${session.name}. Customer linked to ${masterCustomer.nameFirmName}.`
                  : `Document created by ${session.name} and sent for preview. Customer linked to ${masterCustomer.nameFirmName}.`,
            },
          },
        },

        select: {
          id: true,

          documentNumber:
            true,

          documentType:
            true,

          status:
            true,

          customerId:
            true,
        },
      });

    /* =========================================
       SUCCESS
    ========================================= */

    return NextResponse.json(
      {
        success: true,

        message:
          saveAsDraft
            ? "Draft saved successfully."
            : "Document created successfully.",

        data:
          document,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE DOCUMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to create document.",
      },
      {
        status: 500,
      }
    );
  }
}