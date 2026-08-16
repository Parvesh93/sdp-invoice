import Link from "next/link";

import {
  FileText,
  ShoppingCart,
  CheckCircle2,
  Send,
  Users,
  Package,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

function formatCurrency(
  value: number | string
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(Number(value));
}

function formatDate(
  date: Date
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

export default async function DashboardPage() {
  const [
    quotationCount,
    orderFormCount,
    approvedCount,
    sentCount,
    customerCount,
    productCount,
    recentDocuments,
  ] = await Promise.all([
    prisma.document.count({
      where: {
        documentType:
          "QUOTATION",
      },
    }),

    prisma.document.count({
      where: {
        documentType:
          "ORDER_FORM",
      },
    }),

    prisma.document.count({
      where: {
        status:
          "APPROVED",
      },
    }),

    prisma.document.count({
      where: {
        status:
          "SENT",
      },
    }),

    prisma.customer.count(),

    prisma.product.count({
      where: {
        isActive:
          true,
      },
    }),

    prisma.document.findMany({
      take: 8,

      orderBy: {
        createdAt:
          "desc",
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
    }),
  ]);

  const stats = [
    {
      label:
        "Quotations",

      value:
        quotationCount,

      icon:
        FileText,
    },

    {
      label:
        "Order Forms",

      value:
        orderFormCount,

      icon:
        ShoppingCart,
    },

    {
      label:
        "Approved",

      value:
        approvedCount,

      icon:
        CheckCircle2,
    },

    {
      label:
        "Sent",

      value:
        sentCount,

      icon:
        Send,
    },

    {
      label:
        "Customers",

      value:
        customerCount,

      icon:
        Users,
    },

    {
      label:
        "Active Products",

      value:
        productCount,

      icon:
        Package,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ====================================== */}
      {/* PAGE HEADER */}
      {/* ====================================== */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Overview of quotations, orders and recent activity.
          </p>
        </div>

        <Link
          href="/documents/create"
          className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          + Create Document
        </Link>
      </div>

      {/* ====================================== */}
      {/* STATS */}
      {/* ====================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(
          ({
            label,
            value,
            icon:
              Icon,
          }) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-500">
                    {label}
                  </div>

                  <div className="mt-2 text-3xl font-bold text-slate-900">
                    {value}
                  </div>
                </div>

                <div className="rounded-lg bg-slate-100 p-3 text-slate-700">
                  <Icon
                    size={20}
                  />
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* ====================================== */}
      {/* RECENT DOCUMENTS */}
      {/* ====================================== */}

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="font-semibold text-slate-900">
              Recent Documents
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest quotations and order forms.
            </p>
          </div>

          <Link
            href="/documents"
            className="text-sm font-medium text-slate-700 hover:text-slate-950"
          >
            View All
          </Link>
        </div>

        {recentDocuments.length ===
        0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-700">
              No documents yet.
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Create your first quotation or order form.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-237.5">
              <thead className="bg-slate-50">
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
                    Amount
                  </TableHeading>

                  <TableHeading>
                    Status
                  </TableHeading>

                  <TableHeading>
                    Created
                  </TableHeading>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentDocuments.map(
                  (
                    document
                  ) => (
                    <tr
                      key={
                        document.id
                      }
                      className="border-t border-slate-100 hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="text-sm font-semibold text-slate-900">
                          {
                            document.documentNumber
                          }
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
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
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-slate-800">
                          {
                            document.customerNameFirm
                          }
                        </div>

                        {(document.customerCity ||
                          document.customerState) && (
                          <div className="mt-1 text-xs text-slate-400">
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
                      </td>

                      <td className="px-5 py-4">
                        <DocumentTypeBadge
                          type={
                            document.documentType
                          }
                        />
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                        {formatCurrency(
                          document.grandTotal.toString()
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={
                            document.status
                          }
                        />
                      </td>

                      <td className="px-5 py-4">
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

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/documents/${document.id}/preview`}
                          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ====================================== */
/* TABLE HEADING */
/* ====================================== */

function TableHeading({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

/* ====================================== */
/* DOCUMENT TYPE */
/* ====================================== */

function DocumentTypeBadge({
  type,
}: {
  type:
    | "QUOTATION"
    | "ORDER_FORM";
}) {
  if (
    type ===
    "ORDER_FORM"
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

/* ====================================== */
/* STATUS */
/* ====================================== */

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
      {labels[status]}
    </span>
  );
}