const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function convertBelowHundred(
  number: number
) {
  if (number < 20) {
    return ones[number];
  }

  const ten =
    Math.floor(number / 10);

  const remainder =
    number % 10;

  return [
    tens[ten],
    ones[remainder],
  ]
    .filter(Boolean)
    .join(" ");
}

function convertBelowThousand(
  number: number
) {
  const parts: string[] = [];

  if (number >= 100) {
    const hundreds =
      Math.floor(number / 100);

    parts.push(
      `${ones[hundreds]} Hundred`
    );

    number %= 100;
  }

  if (number > 0) {
    parts.push(
      convertBelowHundred(number)
    );
  }

  return parts.join(" ");
}

function convertIntegerToWords(
  number: number
) {
  if (number === 0) {
    return "Zero";
  }

  const parts: string[] = [];

  /*
   * Crore
   */
  if (number >= 10000000) {
    const crore =
      Math.floor(
        number / 10000000
      );

    parts.push(
      `${convertIntegerToWords(
        crore
      )} Crore`
    );

    number %= 10000000;
  }

  /*
   * Lakh
   */
  if (number >= 100000) {
    const lakh =
      Math.floor(
        number / 100000
      );

    parts.push(
      `${convertBelowHundred(
        lakh
      )} Lakh`
    );

    number %= 100000;
  }

  /*
   * Thousand
   */
  if (number >= 1000) {
    const thousand =
      Math.floor(
        number / 1000
      );

    parts.push(
      `${convertBelowHundred(
        thousand
      )} Thousand`
    );

    number %= 1000;
  }

  /*
   * Hundreds + remainder
   */
  if (number > 0) {
    parts.push(
      convertBelowThousand(
        number
      )
    );
  }

  return parts
    .filter(Boolean)
    .join(" ");
}

export function amountToIndianWords(
  value:
    | number
    | string
) {
  const amount =
    Number(value);

  if (
    !Number.isFinite(amount)
  ) {
    return "";
  }

  const normalized =
    Math.max(
      0,
      Math.round(
        amount * 100
      ) / 100
    );

  const rupees =
    Math.floor(normalized);

  const paise =
    Math.round(
      (normalized - rupees) *
        100
    );

  let result =
    `Rupees ${convertIntegerToWords(
      rupees
    )}`;

  if (paise > 0) {
    result +=
      ` and ${convertIntegerToWords(
        paise
      )} Paise`;
  }

  result += " Only";

  return result;
}