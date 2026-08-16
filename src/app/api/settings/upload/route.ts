import {
  NextRequest,
  NextResponse,
} from "next/server";

import fs from "fs/promises";
import path from "path";

import { getSession } from "@/lib/auth";
import {
  SETTING_KEYS,
  saveSetting,
} from "@/lib/settings";

const allowedFields = {
  header_banner:
    SETTING_KEYS.HEADER_BANNER,

  footer_banner:
    SETTING_KEYS.FOOTER_BANNER,

  signature_image:
    SETTING_KEYS.SIGNATURE_IMAGE,
} as const;

export async function POST(
  request: NextRequest
) {
  try {
    const session =
      await getSession();

    if (
      !session ||
      session.role !== "ADMIN"
    ) {
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

    const formData =
      await request.formData();

    const field =
      String(
        formData.get("field") ??
          ""
      ) as keyof typeof allowedFields;

    const file =
      formData.get("file");

    if (
      !field ||
      !allowedFields[field]
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid upload field.",
        },
        {
          status: 422,
        }
      );
    }

    if (
      !(file instanceof File)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Image file is required.",
        },
        {
          status: 422,
        }
      );
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only image uploads are allowed.",
        },
        {
          status: 422,
        }
      );
    }

    const maxSize =
      5 * 1024 * 1024;

    if (
      file.size > maxSize
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Image must be less than 5 MB.",
        },
        {
          status: 422,
        }
      );
    }

    const originalExtension =
      path
        .extname(file.name)
        .toLowerCase() ||
      ".png";

    const safeName =
      `${field}-${Date.now()}${originalExtension}`;

    const uploadDirectory =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "settings"
      );

    await fs.mkdir(
      uploadDirectory,
      {
        recursive: true,
      }
    );

    const buffer =
      Buffer.from(
        await file.arrayBuffer()
      );

    await fs.writeFile(
      path.join(
        uploadDirectory,
        safeName
      ),
      buffer
    );

    const publicPath =
      `/uploads/settings/${safeName}`;

    await saveSetting(
      allowedFields[field],
      publicPath,
      "image"
    );

    return NextResponse.json({
      success: true,

      message:
        "Image uploaded successfully.",

      path: publicPath,
    });
  } catch (error) {
    console.error(
      "SETTING UPLOAD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to upload image.",
      },
      {
        status: 500,
      }
    );
  }
}