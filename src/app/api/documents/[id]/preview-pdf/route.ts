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
          message:
            "Invalid document ID.",
        },
        {
          status: 400,
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
      new Uint8Array(buffer),
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `inline; filename="${filename}"`,

          "Cache-Control":
            "private, no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "PREVIEW PDF ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to generate preview.",
      },
      {
        status: 500,
      }
    );
  }
}