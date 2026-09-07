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
            "Invalid document ID.",
        },
        {
          status:
            400,
        }
      );
    }

    const existingDocument =
      await prisma.document.findUnique({
        where: {
          id:
            documentId,
        },
      });

    if (
      !existingDocument ||
      (
        existingDocument.documentType !==
          "QUOTATION" &&
        existingDocument.documentType !==
          "ORDER_FORM"
      )
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
            "A sent document cannot be approved again.",
        },
        {
          status:
            400,
        }
      );
    }

    const documentLabel =
      existingDocument.documentType ===
      "ORDER_FORM"
        ? "Order Form"
        : "Quotation";

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
                `${documentLabel} approved from public document workflow.`,
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
        `${documentLabel} approved successfully.`,

      document,
    });
  } catch (
    error
  ) {
    console.error(
      "PUBLIC APPROVE DOCUMENT ERROR:",
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
            : "Unable to approve document.",
      },
      {
        status:
          500,
      }
    );
  }
}