import {
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  {
    params,
  }: RouteContext
) {
  try {
    const { id } =
      await params;

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

    const existingDocument =
      await prisma.document.findFirst({
        where: {
          id:
            documentId,

          documentType:
            "QUOTATION",
        },
      });

    if (!existingDocument) {
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
      existingDocument.status ===
      "SENT"
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "A sent quotation cannot be approved again.",
        },
        {
          status:
            400,
        }
      );
    }

    const document =
      await prisma.document.update({
        where: {
          id:
            documentId,
        },

        data: {
          status:
            "APPROVED",

          approvedAt:
            new Date(),

          activities: {
            create: {
              action:
                "DOCUMENT_APPROVED",

              description:
                "Quotation approved from public quotation workflow.",
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

          approvedAt:
            true,
        },
      });

    return NextResponse.json({
      success:
        true,

      message:
        "Quotation approved successfully.",

      document,
    });
  } catch (error) {
    console.error(
      "PUBLIC APPROVE QUOTATION ERROR:",
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
            : "Unable to approve quotation.",
      },
      {
        status:
          500,
      }
    );
  }
}