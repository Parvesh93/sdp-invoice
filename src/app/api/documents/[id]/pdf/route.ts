import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getSession } from "@/lib/auth";
import {
  generateDocumentPdf,
} from "@/lib/generate-document-pdf";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
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
          message: "Unauthorized.",
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

    /*
     * ONE shared PDF generator.
     *
     * Preview, Download and Email now all use:
     *
     * generateDocumentPdf()
     */
    const {
      document,
      buffer,
      filename,
    } =
      await generateDocumentPdf(
        documentId
      );

    if (
      document.status !== "APPROVED" &&
      document.status !== "SENT"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Document must be approved before downloading.",
        },
        {
          status: 400,
        }
      );
    }

    return new Response(
      new Uint8Array(buffer),
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `attachment; filename="${filename}"`,

          /*
           * Critical during development.
           * Prevents Chrome from serving an old PDF.
           */
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",

          Pragma:
            "no-cache",

          Expires:
            "0",
        },
      }
    );
  } catch (error) {
    console.error(
      "DOWNLOAD PDF ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to generate PDF.",
      },
      {
        status: 500,
      }
    );
  }
}