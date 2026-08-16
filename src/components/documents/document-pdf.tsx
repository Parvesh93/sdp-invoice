import React from "react";

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  type DocumentProps,
} from "@react-pdf/renderer";

/* =========================================================
   TYPES
========================================================= */

type PdfItem = {
  productName: string;

  productModel: string | null;

  productDescription: string | null;

  variantName: string | null;

  categoryName: string | null;

  quantity: number;

  finalPrice: string;

  lineTotal: string;

  annexureContent?: string | null;
};

export type DocumentPdfProps = {
  documentNumber: string;

  documentType: "QUOTATION" | "ORDER_FORM";

  documentDate: Date;

  customerNameFirm: string;

  customerPhone: string | null;

  customerWhatsapp: string | null;

  customerGST: string | null;

  customerCity: string | null;

  customerState: string | null;

  addressLine1: string | null;

  addressLine2: string | null;

  addressLine3: string | null;

  subtotal: string;

  gstPercent: string;

  gstAmount: string;

  grandTotal: string;

  totalInWords?: string;

  additionalNotes: string | null;

  headerBanner?: string | null;

  footerBanner?: string | null;

  signatureImage?: string | null;

  quoteFooter?: string | null;

  termsContent?: string | null;

  warrantyContent?: string | null;

  items: PdfItem[];
};

/* =========================================================
   RICH TEXT TYPES
========================================================= */

type InlineNode = {
  text: string;

  bold?: boolean;

  italic?: boolean;

  underline?: boolean;
};

type RichBlock =
  | {
      type: "h1" | "h2" | "h3" | "p";

      children: InlineNode[];
    }
  | {
      type: "bullet" | "number";

      children: InlineNode[];

      index?: number;
    };

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  /*
   * PAGE
   *
   * Header/footer are absolute, so page content needs
   * enough padding to stay clear of them.
   */

  page: {
    paddingTop: 96,

    paddingBottom: 82,

    paddingHorizontal: 36,

    fontFamily: "Helvetica",

    fontSize: 9,

    color: "#0f172a",

    backgroundColor: "#ffffff",
  },

  /* =====================================================
     HEADER
  ===================================================== */

  headerBanner: {
    position: "absolute",

    top: 0,

    left: 0,

    width: "100%",

    height: 82,

    objectFit: "fill",
  },

  fallbackHeader: {
    position: "absolute",

    top: 20,

    left: 36,

    right: 36,

    flexDirection: "row",

    justifyContent: "space-between",

    borderBottomWidth: 1.5,

    borderBottomColor: "#0f172a",

    paddingBottom: 10,
  },

  companyName: {
    fontSize: 18,

    fontFamily: "Helvetica-Bold",
  },

  companySubtitle: {
    marginTop: 4,

    fontSize: 8,

    color: "#64748b",
  },

  headerReference: {
    fontSize: 8,

    textAlign: "right",
  },

  /* =====================================================
     FOOTER
  ===================================================== */

  footerBanner: {
    position: "absolute",

    bottom: 14,

    left: 0,

    width: "100%",

    height: 52,

    objectFit: "fill",
  },

  footerMeta: {
    position: "absolute",

    bottom: 5,

    left: 14,

    right: 14,

    flexDirection: "row",

    justifyContent: "space-between",

    fontSize: 6.5,

    color: "#64748b",
  },

  /* =====================================================
     FIRST PAGE
  ===================================================== */

  documentMeta: {
    flexDirection: "row",

    justifyContent: "space-between",

    marginBottom: 8,

    fontSize: 8,

    color: "#475569",
  },

  titleWrapper: {
    alignItems: "center",

    marginTop: 2,

    marginBottom: 14,
  },

  title: {
    fontSize: 16,

    fontFamily: "Helvetica-Bold",

    textDecoration: "underline",
  },

  customerBlock: {
    marginBottom: 10,
  },

  customerName: {
    marginBottom: 3,

    fontSize: 10,

    fontFamily: "Helvetica-Bold",
  },

  normalLine: {
    marginBottom: 2,

    lineHeight: 1.3,

    color: "#334155",
  },

  subject: {
    marginTop: 8,

    marginBottom: 8,

    fontFamily: "Helvetica-Bold",

    lineHeight: 1.35,
  },

  intro: {
    marginBottom: 12,

    lineHeight: 1.45,

    color: "#334155",
  },

  /* =====================================================
     PRODUCT TABLE
  ===================================================== */

  table: {
    width: "100%",

    borderWidth: 1,

    borderColor: "#cbd5e1",
  },

  tableHeader: {
    flexDirection: "row",

    backgroundColor: "#f1f5f9",

    borderBottomWidth: 1,

    borderBottomColor: "#cbd5e1",
  },

  tableRow: {
    flexDirection: "row",

    borderBottomWidth: 1,

    borderBottomColor: "#cbd5e1",
  },

  productColumn: {
    width: "24%",

    padding: 6,

    borderRightWidth: 1,

    borderRightColor: "#cbd5e1",
  },

  descriptionColumn: {
    width: "30%",

    padding: 6,

    borderRightWidth: 1,

    borderRightColor: "#cbd5e1",
  },

  rateColumn: {
    width: "17%",

    padding: 6,

    textAlign: "right",

    borderRightWidth: 1,

    borderRightColor: "#cbd5e1",
  },

  quantityColumn: {
    width: "10%",

    padding: 6,

    textAlign: "center",

    borderRightWidth: 1,

    borderRightColor: "#cbd5e1",
  },

  amountColumn: {
    width: "19%",

    padding: 6,

    textAlign: "right",
  },

  headingCell: {
    fontSize: 7,

    fontFamily: "Helvetica-Bold",

    color: "#475569",
  },

  productName: {
    fontSize: 8,

    fontFamily: "Helvetica-Bold",
  },

  productMeta: {
    marginTop: 2.5,

    fontSize: 7,

    color: "#64748b",
  },

  descriptionText: {
    fontSize: 8,

    lineHeight: 1.3,

    color: "#334155",
  },

  summaryRow: {
    flexDirection: "row",

    borderTopWidth: 1,

    borderTopColor: "#cbd5e1",
  },

  grandTotalRow: {
    flexDirection: "row",

    borderTopWidth: 1.5,

    borderTopColor: "#0f172a",
  },

  summaryLabel: {
    width: "81%",

    padding: 6,

    textAlign: "right",

    borderRightWidth: 1,

    borderRightColor: "#cbd5e1",

    fontFamily: "Helvetica-Bold",
  },

  summaryAmount: {
    width: "19%",

    padding: 6,

    textAlign: "right",

    fontFamily: "Helvetica-Bold",
  },

  totalWords: {
    marginTop: 10,

    fontSize: 8,

    lineHeight: 1.4,
  },

  note: {
    marginTop: 8,

    fontSize: 8,

    lineHeight: 1.4,
  },

  /* =====================================================
     SIGNATURE
  ===================================================== */

  signatureWrapper: {
    marginTop: 16,

    alignItems: "flex-start",
  },

  signatureTitle: {
    marginBottom: 4,

    fontFamily: "Helvetica-Bold",
  },

  signatureImage: {
    width: 100,

    height: 42,

    objectFit: "contain",

    marginTop: 4,

    marginBottom: 3,
  },

  signatureLabel: {
    fontFamily: "Helvetica-Bold",
  },

  /* =====================================================
     SECONDARY PAGE TITLES
  ===================================================== */

  pageTitleWrapper: {
    alignItems: "center",

    marginBottom: 18,
  },

  pageTitle: {
    fontSize: 15,

    fontFamily: "Helvetica-Bold",
  },

  titleRule: {
    marginTop: 6,

    width: 70,

    borderBottomWidth: 1.5,

    borderBottomColor: "#0f172a",
  },

  /* =====================================================
     ANNEXURE
  ===================================================== */

  annexureMachine: {
    marginBottom: 4,

    fontSize: 13,

    fontFamily: "Helvetica-Bold",

    textAlign: "center",
  },

  annexureModel: {
    marginBottom: 3,

    fontSize: 9,

    textAlign: "center",

    color: "#475569",
  },

  annexureVariant: {
    marginBottom: 14,

    fontSize: 8,

    textAlign: "center",

    color: "#64748b",
  },

  sectionHeading: {
    marginTop: 9,

    marginBottom: 5,

    fontSize: 10,

    fontFamily: "Helvetica-Bold",
  },

  /* =====================================================
     RICH TEXT
  ===================================================== */

  richParagraph: {
    marginBottom: 6,

    fontSize: 9,

    lineHeight: 1.4,

    color: "#334155",
  },

  richHeading1: {
    marginTop: 10,

    marginBottom: 6,

    fontSize: 13,

    lineHeight: 1.3,

    fontFamily: "Helvetica-Bold",
  },

  richHeading2: {
    marginTop: 9,

    marginBottom: 5,

    fontSize: 11,

    lineHeight: 1.3,

    fontFamily: "Helvetica-Bold",
  },

  richHeading3: {
    marginTop: 8,

    marginBottom: 4,

    fontSize: 10,

    lineHeight: 1.3,

    fontFamily: "Helvetica-Bold",
  },

  listRow: {
    flexDirection: "row",

    marginBottom: 4,

    paddingLeft: 6,
  },

  listBullet: {
    width: 18,

    fontSize: 9,

    lineHeight: 1.4,
  },

  listText: {
    flex: 1,

    fontSize: 9,

    lineHeight: 1.4,

    color: "#334155",
  },
});

/* =========================================================
   FORMAT HELPERS
========================================================= */

function formatMoney(value: string) {
  return `Rs. ${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,

    maximumFractionDigits: 2,
  }).format(Number(value))}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",

    month: "short",

    year: "numeric",
  }).format(date);
}

function getSubject(
  documentType: "QUOTATION" | "ORDER_FORM"
) {
  return documentType === "QUOTATION"
    ? "Sub:- QUOTATION FOR AUTOMATIC STONE PROCESSING MACHINES"
    : "Sub:- ORDER FORM FOR AUTOMATIC STONE PROCESSING MACHINES";
}

function getIntroText(
  documentType: "QUOTATION" | "ORDER_FORM"
) {
  if (documentType === "QUOTATION") {
    return "Dear Sir/Ma'am, We are submitting herewith our quotation for stone processing machine as desired by you. The quotations are as under: -";
  }

  return "Dear Sir/Ma'am, We are submitting herewith our order form for stone processing machine as desired by you. The order is as under: -";
}

/* =========================================================
   HTML ENTITY DECODER
========================================================= */

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")

    .replace(/&amp;/gi, "&")

    .replace(/&lt;/gi, "<")

    .replace(/&gt;/gi, ">")

    .replace(/&quot;/gi, '"')

    .replace(/&#39;/gi, "'")

    .replace(/&apos;/gi, "'")

    .replace(/&rsquo;/gi, "'")

    .replace(/&lsquo;/gi, "'")

    .replace(/&rdquo;/gi, '"')

    .replace(/&ldquo;/gi, '"')

    .replace(/&ndash;/gi, "–")

    .replace(/&mdash;/gi, "—")

    .replace(/&bull;/gi, "•");
}

/* =========================================================
   INLINE HTML PARSER

   Converts:

   Hello <strong>World</strong>

   into:

   [
     { text: "Hello " },
     { text: "World", bold: true }
   ]
========================================================= */

function parseInlineHtml(html: string): InlineNode[] {
  const nodes: InlineNode[] = [];

  let bold = false;

  let italic = false;

  let underline = false;

  /*
   * Split on inline formatting tags.
   */

  const parts = html.split(
    /(<\/?(?:strong|b|em|i|u)[^>]*>|<br\s*\/?>)/gi
  );

  for (const part of parts) {
    if (!part) {
      continue;
    }

    const lower = part.toLowerCase();

    /*
     * Bold
     */

    if (
      lower.startsWith("<strong") ||
      lower.startsWith("<b")
    ) {
      bold = true;

      continue;
    }

    if (
      lower === "</strong>" ||
      lower === "</b>"
    ) {
      bold = false;

      continue;
    }

    /*
     * Italic
     */

    if (
      lower.startsWith("<em") ||
      lower.startsWith("<i")
    ) {
      italic = true;

      continue;
    }

    if (
      lower === "</em>" ||
      lower === "</i>"
    ) {
      italic = false;

      continue;
    }

    /*
     * Underline
     */

    if (lower.startsWith("<u")) {
      underline = true;

      continue;
    }

    if (lower === "</u>") {
      underline = false;

      continue;
    }

    /*
     * BR
     */

    if (/^<br\s*\/?>$/i.test(part)) {
      nodes.push({
        text: "\n",

        bold,

        italic,

        underline,
      });

      continue;
    }

    /*
     * Remove any remaining inline HTML.
     */

    const text = decodeHtml(
      part.replace(/<[^>]+>/g, "")
    );

    if (!text) {
      continue;
    }

    nodes.push({
      text,

      bold,

      italic,

      underline,
    });
  }

  return nodes;
}

/* =========================================================
   CHECK INLINE CONTENT
========================================================= */

function hasInlineText(nodes: InlineNode[]) {
  return nodes.some(
    (node) => node.text.trim().length > 0
  );
}

/* =========================================================
   HTML -> BLOCKS

   Important:
   This parser processes HTML in SOURCE ORDER.

   It therefore avoids the old problem where all lists
   appeared before all paragraphs.
========================================================= */

function htmlToBlocks(
  html?: string | null
): RichBlock[] {
  if (!html) {
    return [];
  }

  const blocks: RichBlock[] = [];

  /*
   * Normalize HTML slightly.
   */

  const normalized = html
    .replace(/\r\n/g, "\n")

    .replace(/\r/g, "\n");

  /*
   * Find top-level block tags in their original order.
   */

  const blockRegex =
    /<(h1|h2|h3|p|ul|ol)[^>]*>([\s\S]*?)<\/\1>/gi;

  const matches = [
    ...normalized.matchAll(blockRegex),
  ];

  /*
   * If TipTap returned plain text instead of HTML.
   */

  if (matches.length === 0) {
    const plain = decodeHtml(
      normalized.replace(/<[^>]*>/g, "")
    ).trim();

    if (plain) {
      return [
        {
          type: "p",

          children: [
            {
              text: plain,
            },
          ],
        },
      ];
    }

    return [];
  }

  for (const match of matches) {
    const tag = match[1].toLowerCase();

    const content = match[2];

    /*
     * HEADINGS / PARAGRAPHS
     */

    if (
      tag === "h1" ||
      tag === "h2" ||
      tag === "h3" ||
      tag === "p"
    ) {
      const children =
        parseInlineHtml(content);

      if (!hasInlineText(children)) {
        continue;
      }

      blocks.push({
        type: tag,

        children,
      });

      continue;
    }

    /*
     * LISTS
     */

    if (tag === "ul" || tag === "ol") {
      const itemRegex =
        /<li[^>]*>([\s\S]*?)<\/li>/gi;

      const items = [
        ...content.matchAll(itemRegex),
      ];

      items.forEach((item, index) => {
        const children =
          parseInlineHtml(item[1]);

        if (!hasInlineText(children)) {
          return;
        }

        blocks.push({
          type:
            tag === "ol"
              ? "number"
              : "bullet",

          children,

          index: index + 1,
        });
      });
    }
  }

  return blocks;
}

/* =========================================================
   INLINE PDF TEXT
========================================================= */

function InlinePdfText({
  nodes,
}: {
  nodes: InlineNode[];
}) {
  return (
    <>
      {nodes.map((node, index) => {
        /*
         * Helvetica doesn't have a built-in
         * bold + italic name exposed consistently
         * across all React-PDF environments.

         * Bold takes priority here.
         */

        let fontFamily = "Helvetica";

        if (node.bold) {
          fontFamily = "Helvetica-Bold";
        } else if (node.italic) {
          fontFamily = "Helvetica-Oblique";
        }

        return (
          <Text
            key={index}
            style={{
              fontFamily,

              textDecoration:
                node.underline
                  ? "underline"
                  : undefined,
            }}
          >
            {node.text}
          </Text>
        );
      })}
    </>
  );
}

/* =========================================================
   RICH PDF CONTENT
========================================================= */

function RichPdfContent({
  html,
}: {
  html?: string | null;
}) {
  const blocks =
    htmlToBlocks(html);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <View>
      {blocks.map((block, index) => {
        /*
         * H1
         */

        if (block.type === "h1") {
          return (
            <Text
              key={index}
              style={styles.richHeading1}
            >
              <InlinePdfText
                nodes={block.children}
              />
            </Text>
          );
        }

        /*
         * H2
         */

        if (block.type === "h2") {
          return (
            <Text
              key={index}
              style={styles.richHeading2}
            >
              <InlinePdfText
                nodes={block.children}
              />
            </Text>
          );
        }

        /*
         * H3
         */

        if (block.type === "h3") {
          return (
            <Text
              key={index}
              style={styles.richHeading3}
            >
              <InlinePdfText
                nodes={block.children}
              />
            </Text>
          );
        }

        /*
         * BULLET
         */

        if (block.type === "bullet") {
          return (
            <View
              key={index}
              style={styles.listRow}
              wrap={false}
            >
              <Text
                style={styles.listBullet}
              >
                •
              </Text>

              <Text
                style={styles.listText}
              >
                <InlinePdfText
                  nodes={block.children}
                />
              </Text>
            </View>
          );
        }

        /*
         * NUMBERED LIST
         */

        if (block.type === "number") {
          return (
            <View
              key={index}
              style={styles.listRow}
              wrap={false}
            >
              <Text
                style={styles.listBullet}
              >
                {block.index}.
              </Text>

              <Text
                style={styles.listText}
              >
                <InlinePdfText
                  nodes={block.children}
                />
              </Text>
            </View>
          );
        }

        /*
         * PARAGRAPH
         */

        return (
          <Text
            key={index}
            style={styles.richParagraph}
          >
            <InlinePdfText
              nodes={block.children}
            />
          </Text>
        );
      })}
    </View>
  );
}

/* =========================================================
   HEADER
========================================================= */

function PdfHeader({
  headerBanner,

  documentNumber,

  documentDate,
}: {
  headerBanner?: string | null;

  documentNumber: string;

  documentDate: Date;
}) {
  /*
   * Uploaded header artwork.
   */

  if (headerBanner) {
    return (
      <Image
        fixed
        src={headerBanner}
        style={styles.headerBanner}
      />
    );
  }

  /*
   * Fallback if Settings has no header image.
   */

  return (
    <View
      fixed
      style={styles.fallbackHeader}
    >
      <View>
        <Text style={styles.companyName}>
          SDP MACHINES
        </Text>

        <Text
          style={styles.companySubtitle}
        >
          Quotation & Order Management
        </Text>
      </View>

      <View>
        <Text
          style={styles.headerReference}
        >
          {documentNumber}
        </Text>

        <Text
          style={[
            styles.headerReference,

            {
              marginTop: 3,
            },
          ]}
        >
          {formatDate(documentDate)}
        </Text>
      </View>
    </View>
  );
}

/* =========================================================
   FOOTER
========================================================= */

function PdfFooter({
  footerBanner,

  documentNumber,
}: {
  footerBanner?: string | null;

  documentNumber: string;
}) {
  return (
    <>
      {footerBanner && (
        <Image
          fixed
          src={footerBanner}
          style={styles.footerBanner}
        />
      )}

      <View
        fixed
        style={styles.footerMeta}
      >
        <Text>{documentNumber}</Text>

        <Text
          render={({
            pageNumber,

            totalPages,
          }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
        />
      </View>
    </>
  );
}

/* =========================================================
   COMMON PDF PAGE
========================================================= */

function PdfPage({
  children,

  props,
}: {
  children: React.ReactNode;

  props: DocumentPdfProps;
}) {
  return (
    <Page
      size="A4"
      style={styles.page}
      wrap
    >
      <PdfHeader
        headerBanner={
          props.headerBanner
        }
        documentNumber={
          props.documentNumber
        }
        documentDate={
          props.documentDate
        }
      />

      {children}

      <PdfFooter
        footerBanner={
          props.footerBanner
        }
        documentNumber={
          props.documentNumber
        }
      />
    </Page>
  );
}

/* =========================================================
   DOCUMENT
========================================================= */

export default function DocumentPdf(
  props: DocumentPdfProps
): React.ReactElement<DocumentProps> {
  return (
    <Document>
      {/* =================================================
          PAGE 1
      ================================================= */}

      <PdfPage props={props}>
        {/* Reference + Date */}

        <View
          style={styles.documentMeta}
        >
          <Text>
            Ref: {props.documentNumber}
          </Text>

          <Text>
            Date:{" "}
            {formatDate(
              props.documentDate
            )}
          </Text>
        </View>

        {/* Document Title */}

        <View
          style={styles.titleWrapper}
        >
          <Text style={styles.title}>
            {props.documentType ===
            "QUOTATION"
              ? "QUOTATION"
              : "ORDER FORM"}
          </Text>
        </View>

        {/* =================================================
            CUSTOMER
        ================================================= */}

        <View
          style={styles.customerBlock}
        >
          <Text
            style={styles.customerName}
          >
            M/s.{" "}
            {props.customerNameFirm}
          </Text>

          {props.addressLine1 && (
            <Text
              style={styles.normalLine}
            >
              {props.addressLine1}
            </Text>
          )}

          {props.addressLine2 && (
            <Text
              style={styles.normalLine}
            >
              {props.addressLine2}
            </Text>
          )}

          {props.addressLine3 && (
            <Text
              style={styles.normalLine}
            >
              {props.addressLine3}
            </Text>
          )}

          {(props.customerCity ||
            props.customerState) && (
            <Text
              style={styles.normalLine}
            >
              {[
                props.customerCity,

                props.customerState,
              ]
                .filter(Boolean)
                .join(", ")}
            </Text>
          )}

          {props.customerGST && (
            <Text
              style={styles.normalLine}
            >
              GST No:{" "}
              {props.customerGST}
            </Text>
          )}

          {props.customerPhone && (
            <Text
              style={styles.normalLine}
            >
              Phone:{" "}
              {props.customerPhone}
            </Text>
          )}

          {props.customerWhatsapp && (
            <Text
              style={styles.normalLine}
            >
              WhatsApp:{" "}
              {props.customerWhatsapp}
            </Text>
          )}
        </View>

        {/* =================================================
            SUBJECT
        ================================================= */}

        <Text style={styles.subject}>
          {getSubject(
            props.documentType
          )}
        </Text>

        {/* =================================================
            INTRODUCTION
        ================================================= */}

        <Text style={styles.intro}>
          {getIntroText(
            props.documentType
          )}
        </Text>

        {/* =================================================
            PRODUCT TABLE
        ================================================= */}

        <View style={styles.table}>
          {/* Header */}

          <View
            style={styles.tableHeader}
            wrap={false}
          >
            <Text
              style={[
                styles.productColumn,

                styles.headingCell,
              ]}
            >
              PRODUCT / MODEL
            </Text>

            <Text
              style={[
                styles.descriptionColumn,

                styles.headingCell,
              ]}
            >
              DESCRIPTION
            </Text>

            <Text
              style={[
                styles.rateColumn,

                styles.headingCell,
              ]}
            >
              RATE
            </Text>

            <Text
              style={[
                styles.quantityColumn,

                styles.headingCell,
              ]}
            >
              QTY
            </Text>

            <Text
              style={[
                styles.amountColumn,

                styles.headingCell,
              ]}
            >
              SUBTOTAL
            </Text>
          </View>

          {/* Products */}

          {props.items.map(
            (item, index) => (
              <View
                key={`product-${index}`}
                style={styles.tableRow}
                wrap={false}
              >
                {/* Product */}

                <View
                  style={
                    styles.productColumn
                  }
                >
                  <Text
                    style={
                      styles.productName
                    }
                  >
                    {item.productName}
                  </Text>

                  {item.productModel && (
                    <Text
                      style={
                        styles.productMeta
                      }
                    >
                      Model:{" "}
                      {
                        item.productModel
                      }
                    </Text>
                  )}

                  {item.variantName && (
                    <Text
                      style={
                        styles.productMeta
                      }
                    >
                      Variant:{" "}
                      {
                        item.variantName
                      }
                    </Text>
                  )}
                </View>

                {/* Description */}

                <View
                  style={
                    styles.descriptionColumn
                  }
                >
                  <Text
                    style={
                      styles.descriptionText
                    }
                  >
                    {item.productDescription ||
                      item.productName}
                  </Text>
                </View>

                {/* Rate */}

                <Text
                  style={
                    styles.rateColumn
                  }
                >
                  {formatMoney(
                    item.finalPrice
                  )}
                </Text>

                {/* Quantity */}

                <Text
                  style={
                    styles.quantityColumn
                  }
                >
                  {item.quantity}
                </Text>

                {/* Amount */}

                <Text
                  style={
                    styles.amountColumn
                  }
                >
                  {formatMoney(
                    item.lineTotal
                  )}
                </Text>
              </View>
            )
          )}

          {/* =================================================
              TOTAL
          ================================================= */}

          <View
            style={styles.summaryRow}
            wrap={false}
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              Total
            </Text>

            <Text
              style={
                styles.summaryAmount
              }
            >
              {formatMoney(
                props.subtotal
              )}
            </Text>
          </View>

          {/* =================================================
              GST
          ================================================= */}

          <View
            style={styles.summaryRow}
            wrap={false}
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              GST {props.gstPercent}%
            </Text>

            <Text
              style={
                styles.summaryAmount
              }
            >
              {formatMoney(
                props.gstAmount
              )}
            </Text>
          </View>

          {/* =================================================
              GRAND TOTAL
          ================================================= */}

          <View
            style={
              styles.grandTotalRow
            }
            wrap={false}
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              Grand Total
            </Text>

            <Text
              style={
                styles.summaryAmount
              }
            >
              {formatMoney(
                props.grandTotal
              )}
            </Text>
          </View>
        </View>

        {/* =================================================
            TOTAL IN WORDS
        ================================================= */}

        {props.totalInWords && (
          <Text
            style={styles.totalWords}
          >
            Total in Words:{" "}
            {props.totalInWords}
          </Text>
        )}

        {/* =================================================
            NOTES
        ================================================= */}

        {props.additionalNotes && (
          <Text style={styles.note}>
            Note:{" "}
            {props.additionalNotes}
          </Text>
        )}

        {/* =================================================
            QUOTATION FOOTER CONTENT
        ================================================= */}

        {props.quoteFooter && (
          <View
            style={{
              marginTop: 12,
            }}
          >
            <RichPdfContent
              html={props.quoteFooter}
            />
          </View>
        )}

        {/* =================================================
            SIGNATURE
        ================================================= */}

        <View
          style={
            styles.signatureWrapper
          }
          wrap={false}
        >
          {!props.quoteFooter && (
            <Text
              style={
                styles.signatureTitle
              }
            >
              For: SDP Machines
            </Text>
          )}

          {props.signatureImage && (
            <Image
              src={
                props.signatureImage
              }
              style={
                styles.signatureImage
              }
            />
          )}

          <Text
            style={
              styles.signatureLabel
            }
          >
            AUTH. SIGNATORY
          </Text>
        </View>
      </PdfPage>

      {/* =================================================
          TERMS & CONDITIONS
      ================================================= */}

      {props.termsContent && (
        <PdfPage props={props}>
          <View
            style={
              styles.pageTitleWrapper
            }
            wrap={false}
          >
            <Text
              style={styles.pageTitle}
            >
              TERMS & CONDITIONS
            </Text>

            <View
              style={styles.titleRule}
            />
          </View>

          <RichPdfContent
            html={
              props.termsContent
            }
          />
        </PdfPage>
      )}

      {/* =================================================
          WARRANTY
      ================================================= */}

      {props.warrantyContent && (
        <PdfPage props={props}>
          <View
            style={
              styles.pageTitleWrapper
            }
            wrap={false}
          >
            <Text
              style={styles.pageTitle}
            >
              WARRANTY
            </Text>

            <View
              style={styles.titleRule}
            />
          </View>

          <RichPdfContent
            html={
              props.warrantyContent
            }
          />
        </PdfPage>
      )}

      {/* =================================================
          ANNEXURES
      ================================================= */}

      {props.items.map(
        (item, index) => {
          if (
            !item.annexureContent
          ) {
            return null;
          }

          return (
            <PdfPage
              key={`annexure-${index}`}
              props={props}
            >
              {/* Annexure title */}

              <View
                style={
                  styles.pageTitleWrapper
                }
                wrap={false}
              >
                <Text
                  style={
                    styles.pageTitle
                  }
                >
                  ANNEXURE
                </Text>

                <View
                  style={
                    styles.titleRule
                  }
                />
              </View>

              {/* Product */}

              <Text
                style={
                  styles.annexureMachine
                }
              >
                {item.productName}
              </Text>

              {/* Model */}

              {item.productModel && (
                <Text
                  style={
                    styles.annexureModel
                  }
                >
                  Model:{" "}
                  {item.productModel}
                </Text>
              )}

              {/* Variant */}

              {item.variantName && (
                <Text
                  style={
                    styles.annexureVariant
                  }
                >
                  Variant:{" "}
                  {item.variantName}
                </Text>
              )}

              {/* Product Description */}

              {item.productDescription && (
                <>
                  <Text
                    style={
                      styles.sectionHeading
                    }
                  >
                    MACHINE DESCRIPTION
                  </Text>

                  <Text
                    style={
                      styles.richParagraph
                    }
                  >
                    {
                      item.productDescription
                    }
                  </Text>
                </>
              )}

              {/* Annexure Rich Text */}

              <RichPdfContent
                html={
                  item.annexureContent
                }
              />
            </PdfPage>
          );
        }
      )}
    </Document>
  );
}