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

async function resolveImageSource(
  value: string | null | undefined
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
    value.replace(/^\/+/, "");

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

export async function generateDocumentPdf(
  documentId: number
) {
  const document =
    await prisma.document.findUnique({
      where: {
        id: documentId,
      },

      include: {
        items: {
          orderBy: {
            id: "asc",
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
      },
    });

  if (!document) {
    throw new Error(
      "Document not found."
    );
  }

  const settings =
    await getSettings();

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

  const pdfElement =
    DocumentPdf({
      documentNumber:
        document.documentNumber,

      documentType:
        document.documentType,

      documentDate:
        document.documentDate,

      customerNameFirm:
        document.customerNameFirm,

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

      subtotal:
        document.subtotal.toString(),

      /* =====================================
         GST BREAKUP
      ===================================== */

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

      additionalNotes:
        document.additionalNotes,

      termsContent,

      warrantyContent,

      headerBanner,

      footerBanner,

      signatureImage,

      quoteFooter,

      items:
        document.items.map(
          (item) => ({
            productName:
              item.productName,

            productModel:
              item.productModel,

            productDescription:
              item.productDescription,

            variantName:
              item.variantName,

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