import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import { prisma } from "@/lib/prisma";
import { formatIndianCurrency } from "@/lib/currency";

import PublicQuotationSendForm from "@/components/documents/public-quotation-send-form";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic =
  "force-dynamic";

export default async function PublicQuotationActionsPage({
  params,
}: PageProps) {
  const { id } =
    await params;

  const documentId =
    Number(id);

  if (
    !Number.isInteger(
      documentId
    )
  ) {
    notFound();
  }

  const document =
    await prisma.document.findFirst({
      where: {
        id:
          documentId,

        documentType:
          "QUOTATION",
      },

      include: {
        recipients:
          true,

        items: {
          orderBy: {
            id:
              "asc",
          },
        },
      },
    });

  if (!document) {
    notFound();
  }

  if (
    document.status ===
    "DRAFT"
  ) {
    redirect(
      `/quotation/${document.id}/preview`
    );
  }

  if (
    document.status ===
    "PREVIEWED"
  ) {
    redirect(
      `/quotation/${document.id}/preview`
    );
  }

  const toRecipient =
    document.recipients.find(
      (
        recipient
      ) =>
        recipient.type ===
        "TO"
    )?.email ?? "";

  const ccRecipients =
    document.recipients
      .filter(
        (
          recipient
        ) =>
          recipient.type ===
          "CC"
      )
      .map(
        (
          recipient
        ) =>
          recipient.email
      )
      .join(", ");

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <div>
            <div className="text-xl font-bold text-slate-950">
              SDP Machines
            </div>

            <div className="mt-0.5 text-xs uppercase tracking-[0.18em] text-slate-400">
              Quotation Generator
            </div>
          </div>

          <Link
            href="/quotation"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Create New Quotation
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-5 py-8 lg:px-8">
        {/* Page Header */}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Approved Quotation
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Download or send the approved quotation to the customer.
            </p>
          </div>

          <Link
            href={`/quotation/${document.id}/preview`}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View Quotation
          </Link>
        </div>

        {/* Document Information */}

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-6">
            <div>
              <div className="text-lg font-semibold text-slate-900">
                {
                  document.documentNumber
                }
              </div>

              <div className="mt-1 text-sm text-slate-500">
                {
                  document.customerNameFirm
                }
              </div>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                document.status ===
                "SENT"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {
                document.status
              }
            </span>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Customer
              </div>

              <div className="mt-2 font-medium text-slate-900">
                {
                  document.customerNameFirm
                }
              </div>

              {toRecipient && (
                <div className="mt-1 text-sm text-slate-500">
                  {
                    toRecipient
                  }
                </div>
              )}
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Document Type
              </div>

              <div className="mt-2 font-medium text-slate-900">
                Quotation
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Grand Total
              </div>

              <div className="mt-2 text-xl font-bold text-slate-900">
                {formatIndianCurrency(
                  document.grandTotal.toString()
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* PDF */}

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Download PDF
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Download the approved quotation as a PDF for
              printing or sharing manually.
            </p>

            <a
              href={`/api/public/quotation/${document.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-lg bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Download PDF
            </a>
          </section>

          {/* Email */}

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Send Email
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Send the approved quotation directly to the customer.
            </p>

            <div className="mt-6">
              <PublicQuotationSendForm
                documentId={
                  document.id
                }
                documentNumber={
                  document.documentNumber
                }
                defaultTo={
                  toRecipient
                }
                defaultCc={
                  ccRecipients
                }
                alreadySent={
                  document.status ===
                  "SENT"
                }
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}