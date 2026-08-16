import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function clean(
  value: unknown
) {
  const result =
    String(
      value ?? ""
    ).trim();

  return result || null;
}

export async function PUT(
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

    const customerId =
      Number(id);

    if (
      !Number.isInteger(
        customerId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid customer ID.",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

    const nameFirmName =
      String(
        body.nameFirmName ??
          ""
      ).trim();

    if (!nameFirmName) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Name / Firm Name is required.",
        },
        {
          status: 422,
        }
      );
    }

    const existing =
      await prisma.customer.findUnique({
        where: {
          id:
            customerId,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Customer not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.customer.update({
      where: {
        id:
          customerId,
      },

      data: {
        nameFirmName,

        email:
          clean(
            body.email
          ),

        phone:
          clean(
            body.phone
          ),

        whatsapp:
          clean(
            body.whatsapp
          ),

        gstNumber:
          clean(
            body.gstNumber
          ),

        city:
          clean(
            body.city
          ),

        state:
          clean(
            body.state
          ),

        addressLine1:
          clean(
            body.addressLine1
          ),

        addressLine2:
          clean(
            body.addressLine2
          ),

        addressLine3:
          clean(
            body.addressLine3
          ),
      },
    });

    return NextResponse.json({
      success: true,

      message:
        "Customer updated successfully.",
    });
  } catch (error) {
    console.error(
      "UPDATE CUSTOMER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to update customer.",
      },
      {
        status: 500,
      }
    );
  }
}