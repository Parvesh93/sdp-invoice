import {
  NextRequest,
  NextResponse,
} from "next/server";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    /* =========================================
       AUTH
    ========================================= */

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

    if (
      session.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Administrator access is required.",
        },
        {
          status: 403,
        }
      );
    }

    /* =========================================
       USER ID
    ========================================= */

    const { id } =
      await context.params;

    const userId =
      Number(id);

    if (
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid user ID.",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================================
       EXISTING USER
    ========================================= */

    const existingUser =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* =========================================
       REQUEST
    ========================================= */

    const body =
      await request.json();

    const name =
      String(
        body.name ?? ""
      ).trim();

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

    const role:
      | "ADMIN"
      | "STAFF" =
      body.role === "ADMIN"
        ? "ADMIN"
        : "STAFF";

    const isActive =
      body.isActive !== false;

    /* =========================================
       VALIDATION
    ========================================= */

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name is required.",
        },
        {
          status: 422,
        }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email is required.",
        },
        {
          status: 422,
        }
      );
    }

    if (
      password &&
      password.length < 8
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "New password must be at least 8 characters.",
        },
        {
          status: 422,
        }
      );
    }

    /* =========================================
       SELF PROTECTION
    ========================================= */

    if (
      userId ===
        session.userId &&
      !isActive
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot deactivate your own account.",
        },
        {
          status: 422,
        }
      );
    }

    if (
      userId ===
        session.userId &&
      role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot remove your own administrator role.",
        },
        {
          status: 422,
        }
      );
    }

    /* =========================================
       DUPLICATE EMAIL
    ========================================= */

    const userWithEmail =
      await prisma.user.findFirst({
        where: {
          email,

          id: {
            not: userId,
          },
        },
      });

    if (userWithEmail) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Another user already uses this email address.",
        },
        {
          status: 409,
        }
      );
    }

    /* =========================================
       UPDATE DATA
    ========================================= */

    const updateData: {
      name: string;
      email: string;
      role:
        | "ADMIN"
        | "STAFF";
      isActive: boolean;
      password?: string;
    } = {
      name,
      email,
      role,
      isActive,
    };

    /* =========================================
       PASSWORD RESET
    ========================================= */

    if (password) {
      updateData.password =
        await bcrypt.hash(
          password,
          12
        );
    }

    /* =========================================
       UPDATE USER
    ========================================= */

    const user =
      await prisma.user.update({
        where: {
          id: userId,
        },

        data:
          updateData,

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

    return NextResponse.json({
      success: true,

      message:
        password
          ? "User and password updated successfully."
          : "User updated successfully.",

      data:
        user,
    });
  } catch (error) {
    console.error(
      "UPDATE USER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to update user.",
      },
      {
        status: 500,
      }
    );
  }
}