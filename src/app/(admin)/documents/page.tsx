import Link from "next/link";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type DocumentsPageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
    status?: string;
  }>;
};

function formatCurrency(
  value: number | string
) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatDate(
  value: Date | null
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const params =
    await searchParams;

  const query =
    String(params.q ?? "").trim();

  const type =
    String(params.type ?? "").trim();

  const status =
    String(params.status ?? "").trim();

  const documents =
    await prisma.document.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  {
                    documentNumber: {
                      contains:
                        query,
                    },
                  },

                  {
                    customerNameFirm: {
                      contains:
                        query,
                    },
                  },

                  {
                    customerPhone: {
                      contains:
                        query,
                    },
                  },

                  {
                    customerGST: {
                      contains:
                        query,
                    },
                  },

                  {
                    customerCity: {
                      contains:
                        query,
                    },
                  },
                ],
              }
            : {},

          type ===
          "QUOTATION"
            ? {
                documentType:
                  "QUOTATION",
              }
            : type ===
                "ORDER_FORM"
              ? {
                  documentType:
                    "ORDER_FORM",
                }
              : {},

          status ===
            "DRAFT" ||
          status ===
            "PREVIEWED" ||
          status ===
            "APPROVED" ||
          status ===
            "SENT"
            ? {
                status,
              }
            : {},
        ],
      },

      include: {
        createdBy: {
          select: {
            name: true,
          },
        },

        _count: {
          select: {
            items: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return (
    <div className="space-y-6">
      {/* ========================================= */}
      {/* PAGE HEADER */}
      {/* ========================================= */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quotations & Orders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Search, review and manage all quotation and order documents.
          </p>
        </div>

        <Link
          href="/documents/create"
          className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          + Create Document
        </Link>
      </div>

      {/* ========================================= */}
      {/* FILTERS */}
      {/* ========================================= */}

      <form
        method="GET"
        className="rounded-xl border border-slate-200 bg-white p-5"
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_200px_200px_auto]">
          {/* Search */}

          <div>
            <label
              htmlFor="q"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Search
            </label>

            <input
              id="q"
              name="q"
              defaultValue={
                query
              }
              placeholder="Document no., customer, phone, GST, city..."
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Type */}

          <div>
            <label
              htmlFor="type"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Document Type
            </label>

            <select
              id="type"
              name="type"
              defaultValue={
                type
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none"
            >
              <option value="">
                All Types
              </option>

              <option value="QUOTATION">
                Quotation
              </option>

              <option value="ORDER_FORM">
                Order Form
              </option>
            </select>
          </div>

          {/* Status */}

          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Status
            </label>

            <select
              id="status"
              name="status"
              defaultValue={
                status
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none"
            >
              <option value="">
                All Statuses
              </option>

              <option value="DRAFT">
                Draft
              </option>

              <option value="PREVIEWED">
                Previewed
              </option>

              <option value="APPROVED">
                Approved
              </option>

              <option value="SENT">
                Sent
              </option>
            </select>
          </div>

          {/* Filter button */}

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Filter
            </button>

            {(query ||
              type ||
              status) && (
              <Link
                href="/documents"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear
              </Link>
            )}
          </div>
        </div>
      </form>

      {/* ========================================= */}
      {/* SUMMARY */}
      {/* ========================================= */}

      <div className="flex items-center justify-between text-sm">
        <p className="text-slate-500">
          Showing{" "}
          <strong className="text-slate-800">
            {
              documents.length
            }
          </strong>{" "}
          {documents.length ===
          1
            ? "document"
            : "documents"}
        </p>
      </div>

      {/* ========================================= */}
      {/* DOCUMENT TABLE */}
      {/* ========================================= */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-275">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <TableHeading>
                  Document
                </TableHeading>

                <TableHeading>
                  Customer
                </TableHeading>

                <TableHeading>
                  Type
                </TableHeading>

                <TableHeading>
                  Products
                </TableHeading>

                <TableHeading>
                  Amount
                </TableHeading>

                <TableHeading>
                  Status
                </TableHeading>

                <TableHeading>
                  Created
                </TableHeading>

                <TableHeading>
                  Sent
                </TableHeading>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {documents.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-16 text-center"
                  >
                    <div className="text-sm font-medium text-slate-700">
                      No documents found.
                    </div>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                documents.map(
                  (
                    document
                  ) => (
                    <tr
                      key={
                        document.id
                      }
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
                    >
                      {/* Document Number */}

                      <td className="px-5 py-4 align-top">
                        <Link
                          href={`/documents/${document.id}/preview`}
                          className="text-sm font-semibold text-slate-900 hover:underline"
                        >
                          {
                            document.documentNumber
                          }
                        </Link>

                        <div className="mt-1 text-xs text-slate-400">
                          ID #
                          {
                            document.id
                          }
                        </div>
                      </td>

                      {/* Customer */}

                      <td className="px-5 py-4 align-top">
                        <div className="text-sm font-medium text-slate-800">
                          {
                            document.customerNameFirm
                          }
                        </div>

                        {(document.customerCity ||
                          document.customerState) && (
                          <div className="mt-1 text-xs text-slate-500">
                            {[
                              document.customerCity,
                              document.customerState,
                            ]
                              .filter(
                                Boolean
                              )
                              .join(
                                ", "
                              )}
                          </div>
                        )}

                        {document.customerPhone && (
                          <div className="mt-1 text-xs text-slate-400">
                            {
                              document.customerPhone
                            }
                          </div>
                        )}
                      </td>

                      {/* Type */}

                      <td className="px-5 py-4 align-top">
                        <DocumentTypeBadge
                          type={
                            document.documentType
                          }
                        />
                      </td>

                      {/* Product Count */}

                      <td className="px-5 py-4 align-top text-sm text-slate-700">
                        {
                          document
                            ._count
                            .items
                        }{" "}
                        {document
                          ._count
                          .items ===
                        1
                          ? "item"
                          : "items"}
                      </td>

                      {/* Amount */}

                      <td className="px-5 py-4 align-top">
                        <div className="text-sm font-semibold text-slate-900">
                          {formatCurrency(
                            document.grandTotal.toString()
                          )}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          incl.{" "}
                          {document.gstPercent.toString()}
                          % GST
                        </div>
                      </td>

                      {/* Status */}

                      <td className="px-5 py-4 align-top">
                        <StatusBadge
                          status={
                            document.status
                          }
                        />
                      </td>

                      {/* Created */}

                      <td className="px-5 py-4 align-top">
                        <div className="text-sm text-slate-700">
                          {formatDate(
                            document.createdAt
                          )}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          by{" "}
                          {
                            document.createdBy
                              .name
                          }
                        </div>
                      </td>

                      {/* Sent */}

                      <td className="px-5 py-4 align-top text-sm text-slate-600">
                        {formatDate(
                          document.sentAt
                        )}
                      </td>

                      {/* Actions */}

                      <td className="px-5 py-4 align-top">
                        <div className="flex justify-end gap-2">
                          {/* Draft */}

                          {document.status ===
                            "DRAFT" && (
                            <Link
                              href={`/documents/${document.id}/edit`}
                              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              Continue
                            </Link>
                          )}

                          {/* Edit Previewed/Approved */}

                          {(document.status ===
                            "PREVIEWED" ||
                            document.status ===
                              "APPROVED") && (
                            <Link
                              href={`/documents/${document.id}/edit`}
                              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              Edit
                            </Link>
                          )}

                          {/* Preview */}

                          <Link
                            href={`/documents/${document.id}/preview`}
                            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                          >
                            View
                          </Link>

                          {/* PDF */}

                          {(document.status ===
                            "APPROVED" ||
                            document.status ===
                              "SENT") && (
                            <a
                              href={`/api/documents/${document.id}/pdf`}
                              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              PDF
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TABLE HEADER
========================================================= */

function TableHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status:
    | "DRAFT"
    | "PREVIEWED"
    | "APPROVED"
    | "SENT";
}) {
  const classes = {
    DRAFT:
      "bg-slate-100 text-slate-700",

    PREVIEWED:
      "bg-amber-100 text-amber-700",

    APPROVED:
      "bg-emerald-100 text-emerald-700",

    SENT:
      "bg-blue-100 text-blue-700",
  };

  const labels = {
    DRAFT:
      "Draft",

    PREVIEWED:
      "Previewed",

    APPROVED:
      "Approved",

    SENT:
      "Sent",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${classes[status]}`}
    >
      {
        labels[
          status
        ]
      }
    </span>
  );
}

/* =========================================================
   TYPE BADGE
========================================================= */

function DocumentTypeBadge({
  type,
}: {
  type:
    | "QUOTATION"
    | "ORDER_FORM";
}) {
  if (
    type === "ORDER_FORM"
  ) {
    return (
      <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
        Order Form
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
      Quotation
    </span>
  );
}