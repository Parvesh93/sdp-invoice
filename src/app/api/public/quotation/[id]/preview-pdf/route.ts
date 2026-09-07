import {
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";

import {
  generateDocumentPdf,
} from "@/lib/generate-document-pdf";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic =
  "force-dynamic";

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
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
      documentId <= 0
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

    /* =====================================================
       FIND DOCUMENT
    ===================================================== */

    const document =
      await prisma.document.findUnique({
        where: {
          id:
            documentId,
        },

        select: {
          id:
            true,

          documentType:
            true,

          status:
            true,
        },
      });

    /* =====================================================
       VALIDATE DOCUMENT
    ===================================================== */

    if (
      !document ||
      (
        document.documentType !==
          "QUOTATION" &&
        document.documentType !==
          "ORDER_FORM"
      )
    ) {
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
     * IMPORTANT:
     *
     * Do NOT require APPROVED status here.
     *
     * This is the PREVIEW endpoint, therefore
     * PREVIEWED documents must be renderable.
     */

    /* =====================================================
       GENERATE PDF
    ===================================================== */

    const {
      buffer,
      filename,
    } =
      await generateDocumentPdf(
        documentId
      );

    /* =====================================================
       RESPONSE
    ===================================================== */

    return new Response(
      new Uint8Array(
        buffer
      ),
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `inline; filename="${filename}"`,

          "Cache-Control":
            "no-store, no-cache, must-revalidate",

          Pragma:
            "no-cache",

          Expires:
            "0",
        },
      }
    );
  } catch (
    error
  ) {
    console.error(
      "PUBLIC DOCUMENT PREVIEW PDF ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof
            Error
            ? error.message
            : "Unable to generate document preview.",
      },
      {
        status: 500,
      }
    );
  }
}