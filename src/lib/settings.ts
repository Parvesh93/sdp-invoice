import { prisma } from "@/lib/prisma";

export const SETTING_KEYS = {
  GST: "gst",

  TERMS: "terms",

  WARRANTY: "warranty",

  HEADER_BANNER: "header_banner",

  FOOTER_BANNER: "footer_banner",

  QUOTE_FOOTER: "quote_footer",

  SIGNATURE_IMAGE: "signature_image",

  REFERENCE_PREFIX: "reference_prefix",
} as const;

export async function getSetting(
  key: string,
  fallback: string | null = null
) {
  const setting =
    await prisma.setting.findUnique({
      where: {
        key,
      },
    });

  return setting?.value ?? fallback;
}

export async function getSettings() {
  const settings =
    await prisma.setting.findMany();

  const map = new Map(
    settings.map((setting) => [
      setting.key,
      setting.value ?? "",
    ])
  );

  return {
    gst:
      map.get(SETTING_KEYS.GST) ??
      "18",

    terms:
      map.get(SETTING_KEYS.TERMS) ??
      "",

    warranty:
      map.get(SETTING_KEYS.WARRANTY) ??
      "",

    headerBanner:
      map.get(
        SETTING_KEYS.HEADER_BANNER
      ) ?? "",

    footerBanner:
      map.get(
        SETTING_KEYS.FOOTER_BANNER
      ) ?? "",

    quoteFooter:
      map.get(
        SETTING_KEYS.QUOTE_FOOTER
      ) ?? "",

    signatureImage:
      map.get(
        SETTING_KEYS.SIGNATURE_IMAGE
      ) ?? "",

    referencePrefix:
      map.get(
        SETTING_KEYS.REFERENCE_PREFIX
      ) ?? "SDPM/RJ/OE",
  };
}

export async function saveSetting(
  key: string,
  value: string,
  type = "text"
) {
  return prisma.setting.upsert({
    where: {
      key,
    },

    update: {
      value,
      type,
    },

    create: {
      key,
      value,
      type,
    },
  });
}