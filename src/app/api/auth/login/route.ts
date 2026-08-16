import bcrypt from "bcryptjs";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const email =
      String(
        body.email ?? ""
      )
        .trim()
        .toLowerCase();

    const password =
      String(
        body.password ?? ""
      );

    if (
      !email ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email and password are required.",
        },
        {
          status: 422,
        }
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    /*
     * Do not reveal whether the email exists.
     */
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid email or password.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * Inactive users cannot log in.
     */
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account is inactive. Please contact an administrator.",
        },
        {
          status: 403,
        }
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid email or password.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * user.role is now either:
     *
     * ADMIN
     * STAFF
     */
    await createSession({
      userId:
        user.id,

      email:
        user.email,

      name:
        user.name,

      role:
        user.role,
    });

    return NextResponse.json({
      success: true,
      message:
        "Login successful.",
    });
  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while logging in.",
      },
      {
        status: 500,
      }
    );
  }
}