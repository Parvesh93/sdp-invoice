import fs from "fs/promises";
import path from "path";

import {
  renderToBuffer,
} from "@react-pdf/renderer";

import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

import {
  amountToIndianWords,
} from "@/lib/number-to-words";

import DocumentPdf from "@/components/documents/document-pdf";

/* =========================================================
   IMAGE HELPER
========================================================= */

async function resolveImageSource(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return null;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  const cleanPath =
    value.replace(
      /^\/+/,
      ""
    );

  const absolutePath =
    path.join(
      process.cwd(),
      "public",
      cleanPath
    );

  try {
    const buffer =
      await fs.readFile(
        absolutePath
      );

    const extension =
      path
        .extname(
          absolutePath
        )
        .toLowerCase();

    let mimeType =
      "image/png";

    if (
      extension === ".jpg" ||
      extension === ".jpeg"
    ) {
      mimeType =
        "image/jpeg";
    }

    if (
      extension === ".webp"
    ) {
      mimeType =
        "image/webp";
    }

    return `data:${mimeType};base64,${buffer.toString(
      "base64"
    )}`;
  } catch (error) {
    console.error(
      "PDF IMAGE LOAD ERROR:",
      absolutePath,
      error
    );

    return null;
  }
}

/* =========================================================
   GENERATE PDF
========================================================= */

export async function generateDocumentPdf(
  documentId: number
) {
  const document =
    await prisma.document.findUnique({
      where: {
        id:
          documentId,
      },

      include: {
        items: {
          orderBy: {
            id:
              "asc",
          },

          include: {
            product: {
              select: {
                annexureContent:
                  true,
              },
            },
          },
        },

        recipients: {
          orderBy: {
            id:
              "asc",
          },
        },
      },
    });

  if (!document) {
    throw new Error(
      "Document not found."
    );
  }

  /* =======================================================
     SETTINGS
  ======================================================= */

  const settings =
    await getSettings();

  /* =======================================================
     DOCUMENT SNAPSHOT / FALLBACK SETTINGS
  ======================================================= */

  const termsContent =
    document.termsSnapshot ||
    settings.terms ||
    null;

  const warrantyContent =
    document.warrantySnapshot ||
    settings.warranty ||
    null;

  const rawHeaderBanner =
    document.headerBannerSnapshot ||
    settings.headerBanner ||
    null;

  const rawFooterBanner =
    document.footerBannerSnapshot ||
    settings.footerBanner ||
    null;

  const rawSignatureImage =
    document.signatureImageSnapshot ||
    settings.signatureImage ||
    null;

  const quoteFooter =
    document.quoteFooterSnapshot ||
    settings.quoteFooter ||
    null;

    const bankDetails =
  document.bankDetailsSnapshot ||
  settings.bankDetails ||
  null;

  /* =======================================================
     IMAGES
  ======================================================= */

  const headerBanner =
    await resolveImageSource(
      rawHeaderBanner
    );

  const footerBanner =
    await resolveImageSource(
      rawFooterBanner
    );

  const signatureImage =
    await resolveImageSource(
      rawSignatureImage
    );

  /* =======================================================
     PRIMARY TO EMAIL
  ======================================================= */

  const primaryToEmail =
    document.recipients.find(
      (
        recipient
      ) =>
        recipient.type ===
        "TO"
    )?.email ??
    null;

  /* =======================================================
     PDF
  ======================================================= */

  const pdfElement =
    DocumentPdf({
      /* -------------------------------------
         DOCUMENT
      ------------------------------------- */

      documentNumber:
        document.documentNumber,

      documentType:
        document.documentType,

      documentDate:
        document.documentDate,

      /* -------------------------------------
         CUSTOMER
      ------------------------------------- */

      customerNameFirm:
        document.customerNameFirm,

      customerEmail:
        primaryToEmail,

      customerPhone:
        document.customerPhone,

      customerWhatsapp:
        document.customerWhatsapp,

      customerGST:
        document.customerGST,

      customerCity:
        document.customerCity,

      customerState:
        document.customerState,

      addressLine1:
        document.addressLine1,

      addressLine2:
        document.addressLine2,

      addressLine3:
        document.addressLine3,

      /* -------------------------------------
         TOTALS
      ------------------------------------- */

      subtotal:
        document.subtotal.toString(),

      /* -------------------------------------
         GST
      ------------------------------------- */

      gstType:
        document.gstType,

      gstPercent:
        document.gstPercent.toString(),

      gstAmount:
        document.gstAmount.toString(),

      cgstPercent:
        document.cgstPercent.toString(),

      cgstAmount:
        document.cgstAmount.toString(),

      sgstPercent:
        document.sgstPercent.toString(),

      sgstAmount:
        document.sgstAmount.toString(),

      igstPercent:
        document.igstPercent.toString(),

      igstAmount:
        document.igstAmount.toString(),

      grandTotal:
        document.grandTotal.toString(),

      totalInWords:
        amountToIndianWords(
          document.grandTotal.toString()
        ),

      /* -------------------------------------
         NOTES
      ------------------------------------- */

      additionalNotes:
        document.additionalNotes,

      /* -------------------------------------
         CONTENT
      ------------------------------------- */

      termsContent,

      warrantyContent,

      quoteFooter,

      bankDetails,

      /* -------------------------------------
         IMAGES
      ------------------------------------- */

      headerBanner,

      footerBanner,

      signatureImage,

      /* -------------------------------------
         ITEMS
      ------------------------------------- */

      items:
        document.items.map(
          (
            item
          ) => ({
            productName:
              item.productName,

            productModel:
              item.productModel,

            productDescription:
              item.productDescription,

            /*
             * Variants are no longer part
             * of the quotation workflow.
             */
            variantName:
              null,

            categoryName:
              item.categoryName,

            quantity:
              item.quantity,

            finalPrice:
              item.finalPrice.toString(),

            lineTotal:
              item.lineTotal.toString(),

            annexureContent:
              item.annexureSnapshot ||
              item.product
                ?.annexureContent ||
              null,
          })
        ),
    });

  /* =======================================================
     RENDER BUFFER
  ======================================================= */

  const buffer =
    await renderToBuffer(
      pdfElement
    );

  return {
    document,

    buffer:
      Buffer.from(
        buffer
      ),

    filename:
      `${document.documentNumber}.pdf`,
  };
}