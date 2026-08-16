import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getSession } from "@/lib/auth";
import {
  SETTING_KEYS,
  saveSetting,
} from "@/lib/settings";

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

    const body =
      await request.json();

    const gst =
      Number(body.gst);

    if (
      !Number.isFinite(gst) ||
      gst < 0 ||
      gst > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "GST must be between 0 and 100.",
        },
        {
          status: 422,
        }
      );
    }

    await Promise.all([
      saveSetting(
        SETTING_KEYS.GST,
        gst.toString(),
        "number"
      ),

      saveSetting(
        SETTING_KEYS.TERMS,
        String(
          body.terms ?? ""
        ),
        "editor"
      ),

      saveSetting(
        SETTING_KEYS.WARRANTY,
        String(
          body.warranty ?? ""
        ),
        "editor"
      ),

      saveSetting(
        SETTING_KEYS.QUOTE_FOOTER,
        String(
          body.quoteFooter ?? ""
        ),
        "editor"
      ),

      saveSetting(
        SETTING_KEYS.REFERENCE_PREFIX,
        String(
          body.referencePrefix ??
            "SDPM/RJ/OE"
        ).trim(),
        "text"
      ),
    ]);

    return NextResponse.json({
      success: true,

      message:
        "Settings updated successfully.",
    });
  } catch (error) {
    console.error(
      "UPDATE SETTINGS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to update settings.",
      },
      {
        status: 500,
      }
    );
  }
}