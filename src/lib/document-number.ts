import { prisma } from "@/lib/prisma";

import {
  getStateCode,
} from "@/lib/india-states";

function getFinancialYear(
  date = new Date()
) {
  const year =
    date.getFullYear();

  const month =
    date.getMonth();

  /*
   * Indian FY:
   * April -> March
   */
  const startYear =
    month >= 3
      ? year
      : year - 1;

  const endYear =
    startYear + 1;

  return {
    startYear,
    endYear,

    label:
      `${String(
        startYear
      ).slice(-2)}-${String(
        endYear
      ).slice(-2)}`,
  };
}

function cleanInitials(
  value:
    string
) {
  return value
    .trim()
    .toUpperCase()
    .replace(
      /[^A-Z]/g,
      ""
    );
}

export async function generateDocumentNumber({
  customerState,
  issuerInitials,
}: {
  customerState:
    string;

  issuerInitials:
    string;
}) {
  const stateCode =
    getStateCode(
      customerState
    );

  if (!stateCode) {
    throw new Error(
      "Please select a valid Indian state."
    );
  }

  const initials =
    cleanInitials(
      issuerInitials
    );

  if (!initials) {
    throw new Error(
      "Issuer initials are required."
    );
  }

  const financialYear =
    getFinancialYear();

  const basePrefix =
    `SDPM/${stateCode}/${financialYear.label}/${initials}/`;

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
   * Avoid SQL startsWith because of the
   * MariaDB collation issue we encountered.
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
        id:
          "desc",
      },
    });

  /*
   * Global FY sequence:
   *
   * SDPM/RJ/26-27/PT/001
   * SDPM/AP/26-27/AS/002
   * SDPM/RJ/26-27/PT/003
   *
   * Sequence does not reset by state/issuer.
   */
  let highestSequence =
    0;

  for (
    const document of
    documents
  ) {
    const parts =
      document.documentNumber.split(
        "/"
      );

    const lastPart =
      parts[
        parts.length - 1
      ];

    const sequence =
      Number(
        lastPart
      );

    if (
      Number.isInteger(
        sequence
      ) &&
      sequence >
        highestSequence
    ) {
      highestSequence =
        sequence;
    }
  }

  const nextSequence =
    highestSequence +
    1;

  const paddedSequence =
    String(
      nextSequence
    ).padStart(
      3,
      "0"
    );

  return `${basePrefix}${paddedSequence}`;
}