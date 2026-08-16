import { NextResponse } from "next/server";

import { verifyMailConnection } from "@/lib/mail";

export async function GET() {
  try {
    await verifyMailConnection();

    return NextResponse.json({
      success: true,
      message: "SMTP connection successful.",
    });
  } catch (error) {
    console.error("SMTP TEST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "SMTP connection failed.",
      },
      {
        status: 500,
      }
    );
  }
}