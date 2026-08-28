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

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
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
          success:
            false,

          message:
            "Invalid quotation ID.",
        },
        {
          status:
            400,
        }
      );
    }

    const quotation =
      await prisma.document.findFirst({
        where: {
          id:
            documentId,

          documentType:
            "QUOTATION",
        },

        select: {
          id:
            true,

          status:
            true,
        },
      });

    if (!quotation) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Quotation not found.",
        },
        {
          status:
            404,
        }
      );
    }

    if (
      quotation.status !==
        "APPROVED" &&
      quotation.status !==
        "SENT"
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Quotation must be approved before downloading.",
        },
        {
          status:
            400,
        }
      );
    }

    const {
      buffer,
      filename,
    } =
      await generateDocumentPdf(
        documentId
      );

    return new Response(
      new Uint8Array(
        buffer
      ),
      {
        status:
          200,

        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `attachment; filename="${filename}"`,

          "Cache-Control":
            "no-store, no-cache, must-revalidate",

          Pragma:
            "no-cache",

          Expires:
            "0",
        },
      }
    );
  } catch (error) {
    console.error(
      "PUBLIC PDF ERROR:",
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
            : "Unable to generate quotation PDF.",
      },
      {
        status:
          500,
      }
    );
  }
}