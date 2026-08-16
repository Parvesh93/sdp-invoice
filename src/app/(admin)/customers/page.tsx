import Link from "next/link";

import { prisma } from "@/lib/prisma";

type CustomersPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const params =
    await searchParams;

  const query =
    String(
      params.q ?? ""
    ).trim();

  const customers =
    await prisma.customer.findMany({
      where: query
        ? {
            OR: [
              {
                nameFirmName: {
                  contains: query,
                },
              },

              {
                email: {
                  contains: query,
                },
              },

              {
                phone: {
                  contains: query,
                },
              },

              {
                whatsapp: {
                  contains: query,
                },
              },

              {
                gstNumber: {
                  contains: query,
                },
              },

              {
                city: {
                  contains: query,
                },
              },

              {
                state: {
                  contains: query,
                },
              },
            ],
          }
        : undefined,

      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Customers
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage customer and firm details used in quotations and order forms.
          </p>
        </div>

        <Link
          href="/customers/new"
          className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          + Add Customer
        </Link>
      </div>

      {/* Search */}

      <form
        method="GET"
        className="rounded-xl border border-slate-200 bg-white p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search name, email, phone, GST, city..."
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />

          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Search
          </button>

          {query && (
            <Link
              href="/customers"
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      {/* Table */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-250">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <TableHeading>
                  Customer / Firm
                </TableHeading>

                <TableHeading>
                  Contact
                </TableHeading>

                <TableHeading>
                  GST
                </TableHeading>

                <TableHeading>
                  Location
                </TableHeading>

                <TableHeading>
                  Documents
                </TableHeading>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-14 text-center"
                  >
                    <p className="text-sm font-medium text-slate-700">
                      No customers found.
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Add a customer or change the search.
                    </p>
                  </td>
                </tr>
              ) : (
                customers.map(
                  (customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
                    >
                      {/* Name */}

                      <td className="px-5 py-4 align-top">
                        <div className="font-medium text-slate-900">
                          {
                            customer.nameFirmName
                          }
                        </div>

                        {customer.email && (
                          <div className="mt-1 text-xs text-slate-500">
                            {
                              customer.email
                            }
                          </div>
                        )}
                      </td>

                      {/* Contact */}

                      <td className="px-5 py-4 align-top text-sm text-slate-700">
                        {customer.phone ? (
                          <div>
                            Phone:{" "}
                            {
                              customer.phone
                            }
                          </div>
                        ) : (
                          <div className="text-slate-400">
                            —
                          </div>
                        )}

                        {customer.whatsapp && (
                          <div className="mt-1 text-xs text-slate-500">
                            WhatsApp:{" "}
                            {
                              customer.whatsapp
                            }
                          </div>
                        )}
                      </td>

                      {/* GST */}

                      <td className="px-5 py-4 align-top text-sm text-slate-700">
                        {customer.gstNumber ||
                          "—"}
                      </td>

                      {/* Location */}

                      <td className="px-5 py-4 align-top text-sm text-slate-700">
                        {[
                          customer.city,
                          customer.state,
                        ]
                          .filter(Boolean)
                          .join(", ") ||
                          "—"}
                      </td>

                      {/* Documents */}

                      <td className="px-5 py-4 align-top">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {
                            customer
                              ._count
                              .documents
                          }{" "}
                          {customer
                            ._count
                            .documents ===
                          1
                            ? "document"
                            : "documents"}
                        </span>
                      </td>

                      {/* Actions */}

                      <td className="px-5 py-4 align-top">
                        <div className="flex justify-end gap-3">
                          <Link
                            href={`/customers/${customer.id}/edit`}
                            className="text-sm font-medium text-slate-700 hover:text-slate-950"
                          >
                            Edit
                          </Link>
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