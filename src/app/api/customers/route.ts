import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function clean(
  value: unknown
) {
  const result =
    String(
      value ?? ""
    ).trim();

  return result || null;
}

export async function POST(
  request: NextRequest
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

    const customer =
      await prisma.customer.create({
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

    return NextResponse.json(
      {
        success: true,

        message:
          "Customer created successfully.",

        data: {
          id:
            customer.id,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE CUSTOMER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to create customer.",
      },
      {
        status: 500,
      }
    );
  }
}