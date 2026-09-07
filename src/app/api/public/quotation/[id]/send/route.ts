import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";

import {
  getMailFrom,
  mailTransporter,
} from "@/lib/mail";

import {
  generateDocumentPdf,
} from "@/lib/generate-document-pdf";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

/* =========================================================
   SEND DOCUMENT
========================================================= */

export async function POST(
  request: NextRequest,
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
       LOAD PUBLIC DOCUMENT
    ===================================================== */

    const publicDocument =
      await prisma.document.findUnique({
        where: {
          id:
            documentId,
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

          customerNameFirm:
            true,
        },
      });

    /* =====================================================
       VALIDATE DOCUMENT TYPE
    ===================================================== */

    if (
      !publicDocument ||
      (
        publicDocument.documentType !==
          "QUOTATION" &&
        publicDocument.documentType !==
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

    /* =====================================================
       VALIDATE STATUS
    ===================================================== */

    if (
      publicDocument.status !==
        "APPROVED" &&
      publicDocument.status !==
        "SENT"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Document must be approved before sending.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       DOCUMENT LABEL
    ===================================================== */

    const documentLabel =
      publicDocument.documentType ===
      "ORDER_FORM"
        ? "Order Form"
        : "Quotation";

    /* =====================================================
       REQUEST BODY
    ===================================================== */

    const body =
      await request.json();

    const toEmails =
      parseEmails(
        String(
          body.to ??
            ""
        )
      );

    const ccEmails =
      parseEmails(
        String(
          body.cc ??
            ""
        )
      );

    const subject =
      String(
        body.subject ??
          ""
      ).trim();

    const message =
      String(
        body.message ??
          ""
      ).trim();

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (
      toEmails.length ===
      0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "At least one recipient email is required.",
        },
        {
          status: 422,
        }
      );
    }

    if (!subject) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Email subject is required.",
        },
        {
          status: 422,
        }
      );
    }

    /* =====================================================
       GENERATE PDF
    ===================================================== */

    const {
      document,
      buffer,
      filename,
    } =
      await generateDocumentPdf(
        documentId
      );

    /* =====================================================
       EMAIL
    ===================================================== */

    await mailTransporter.sendMail({
      from:
        getMailFrom(),

      to:
        toEmails,

      cc:
        ccEmails.length >
        0
          ? ccEmails
          : undefined,

      subject,

      text:
        message ||
        `Please find attached ${documentLabel} ${document.documentNumber}.`,

      attachments: [
        {
          filename,

          content:
            buffer,

          contentType:
            "application/pdf",
        },
      ],
    });

    /* =====================================================
       UPDATE DOCUMENT
    ===================================================== */

    await prisma.document.update({
      where: {
        id:
          documentId,
      },

      data: {
        status:
          "SENT",

        sentAt:
          new Date(),

        activities: {
          create: {
            action:
              "DOCUMENT_SENT",

            description:
              `${documentLabel} sent from public document workflow to ${toEmails.join(
                ", "
              )}${
                ccEmails.length
                  ? `; CC: ${ccEmails.join(
                      ", "
                    )}`
                  : ""
              }.`,
          },
        },
      },
    });

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json({
      success:
        true,

      message:
        `${documentLabel} sent successfully.`,

      data: {
        id:
          publicDocument.id,

        documentNumber:
          publicDocument.documentNumber,

        documentType:
          publicDocument.documentType,

        status:
          "SENT",
      },
    });
  } catch (
    error
  ) {
    console.error(
      "PUBLIC DOCUMENT SEND ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof
            Error
            ? error.message
            : "Unable to send document.",
      },
      {
        status: 500,
      }
    );
  }
}