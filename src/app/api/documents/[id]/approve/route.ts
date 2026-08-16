import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const session = await getSession();

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

    const { id } = await params;

    const documentId = Number(id);

    if (!Number.isInteger(documentId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid document ID.",
        },
        {
          status: 400,
        }
      );
    }

    const existingDocument =
      await prisma.document.findUnique({
        where: {
          id: documentId,
        },
      });

    if (!existingDocument) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (existingDocument.status === "SENT") {
      return NextResponse.json(
        {
          success: false,
          message:
            "A sent document cannot be approved again.",
        },
        {
          status: 400,
        }
      );
    }

    const document = await prisma.document.update({
      where: {
        id: documentId,
      },

      data: {
        status: "APPROVED",
        approvedAt: new Date(),

        activities: {
          create: {
            action: "DOCUMENT_APPROVED",
            description: `Document approved by ${session.name}`,
          },
        },
      },

      select: {
        id: true,
        documentNumber: true,
        status: true,
        approvedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Document approved successfully.",
      document,
    });
  } catch (error) {
    console.error("APPROVE DOCUMENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to approve document.",
      },
      {
        status: 500,
      }
    );
  }
}