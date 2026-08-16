import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

function getFinancialYear(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth(); // Jan = 0

  const startYear =
    month >= 3
      ? year
      : year - 1;

  const endYear =
    startYear + 1;

  const endYearShort =
    String(endYear).slice(-2);

  return {
    startYear,
    endYear,
    label: `${startYear}-${endYearShort}`,
  };
}

export async function generateDocumentNumber() {
  const settings =
    await getSettings();

  const prefix =
    settings.referencePrefix?.trim() ||
    "SDPM/RJ/OE";

  const financialYear =
    getFinancialYear();

  const basePrefix =
    `${prefix}/${financialYear.label}/`;

  /*
   * Find the latest document belonging
   * to this financial year.
   */
  const latestDocument =
    await prisma.document.findFirst({
      where: {
        documentNumber: {
          startsWith: basePrefix,
        },
      },

      select: {
        documentNumber: true,
      },

      orderBy: {
        id: "desc",
      },
    });

  let nextSequence = 1;

  if (latestDocument) {
    const lastPart =
      latestDocument.documentNumber
        .split("/")
        .pop();

    const lastSequence =
      Number(lastPart);

    if (
      Number.isInteger(lastSequence) &&
      lastSequence > 0
    ) {
      nextSequence =
        lastSequence + 1;
    }
  }

  const paddedSequence =
    String(nextSequence).padStart(
      4,
      "0"
    );

  return `${basePrefix}${paddedSequence}`;
}