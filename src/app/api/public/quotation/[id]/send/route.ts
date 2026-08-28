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

function parseEmails(
  value: string
) {
  return value
    .split(/[;,]/)
    .map(
      (
        email
      ) =>
        email
          .trim()
          .toLowerCase()
    )
    .filter(
      Boolean
    );
}

export async function POST(
  request: NextRequest,
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
            "Quotation must be approved before sending.",
        },
        {
          status:
            400,
        }
      );
    }

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

    if (
      toEmails.length ===
      0
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "At least one recipient email is required.",
        },
        {
          status:
            422,
        }
      );
    }

    if (!subject) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Email subject is required.",
        },
        {
          status:
            422,
        }
      );
    }

    const {
      document,
      buffer,
      filename,
    } =
      await generateDocumentPdf(
        documentId
      );

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
        `Please find attached ${document.documentNumber}.`,

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
              `Quotation sent from public quotation workflow to ${toEmails.join(
                ", "
              )}${
                ccEmails.length
                  ? `; CC: ${ccEmails.join(
                      ", "
                    )}`
                  : ""
              }`,
          },
        },
      },
    });

    return NextResponse.json({
      success:
        true,

      message:
        "Quotation sent successfully.",
    });
  } catch (error) {
    console.error(
      "PUBLIC QUOTATION SEND ERROR:",
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
            : "Unable to send quotation.",
      },
      {
        status:
          500,
      }
    );
  }
}