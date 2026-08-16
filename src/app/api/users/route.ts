import {
  NextRequest,
  NextResponse,
} from "next/server";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    if (session.role !== "ADMIN") {
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

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be at least 8 characters.",
        },
        {
          status: 422,
        }
      );
    }

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A user with this email already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    const user =
      await prisma.user.create({
        data: {
          name,
          email,
          password:
            hashedPassword,
          role,
          isActive,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "User created successfully.",
        data: user,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE USER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to create user.",
      },
      {
        status: 500,
      }
    );
  }
}