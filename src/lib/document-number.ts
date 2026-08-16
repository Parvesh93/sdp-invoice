import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

function getFinancialYear(date = new Date()) {
  const year =
    date.getFullYear();

  const month =
    date.getMonth(); // Jan = 0

  const startYear =
    month >= 3
      ? year
      : year - 1;

  const endYear =
    startYear + 1;

  const endYearShort =
    String(endYear).slice(
      -2
    );

  return {
    startYear,
    endYear,

    label:
      `${startYear}-${endYearShort}`,
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
   * Financial year:
   *
   * 01-Apr-YYYY
   * to
   * 01-Apr-(YYYY + 1)
   */
  const financialYearStart =
    new Date(
      financialYear.startYear,
      3,
      1,
      0,
      0,
      0,
      0
    );

  const financialYearEnd =
    new Date(
      financialYear.endYear,
      3,
      1,
      0,
      0,
      0,
      0
    );

  /*
   * IMPORTANT:
   *
   * Previously this used:
   *
   * documentNumber: {
   *   startsWith: basePrefix
   * }
   *
   * Prisma converts startsWith into SQL LIKE.
   *
   * On Hostinger MariaDB this caused:
   *
   * Illegal mix of collations
   * utf8mb4_unicode_ci / utf8mb4_bin
   *
   * We therefore filter the financial year
   * using DateTime fields in SQL and perform
   * the prefix check in JavaScript.
   */
  const documents =
    await prisma.document.findMany({
      where: {
        documentDate: {
          gte:
            financialYearStart,

          lt:
            financialYearEnd,
        },
      },

      select: {
        documentNumber:
          true,
      },

      orderBy: {
        id: "desc",
      },
    });

  /*
   * Find the latest document using the
   * currently configured reference prefix.
   */
  const latestDocument =
    documents.find(
      (document) =>
        document.documentNumber.startsWith(
          basePrefix
        )
    );

  let nextSequence =
    1;

  if (
    latestDocument
  ) {
    const lastPart =
      latestDocument
        .documentNumber
        .split("/")
        .pop();

    const lastSequence =
      Number(
        lastPart
      );

    if (
      Number.isInteger(
        lastSequence
      ) &&
      lastSequence > 0
    ) {
      nextSequence =
        lastSequence +
        1;
    }
  }

  const paddedSequence =
    String(
      nextSequence
    ).padStart(
      4,
      "0"
    );

  return `${basePrefix}${paddedSequence}`;
}