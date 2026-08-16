import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import DocumentSendForm from "@/components/documents/document-send-form";
import { formatIndianCurrency } from "@/lib/currency";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DocumentActionsPage({
  params,
}: PageProps) {
  const { id } = await params;

  const documentId = Number(id);

  if (!Number.isInteger(documentId)) {
    notFound();
  }

  const document = await prisma.document.findUnique({
    where: {
      id: documentId,
    },

    include: {
      recipients: true,

      items: {
        orderBy: {
          id: "asc",
        },
      },

      createdBy: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!document) {
    notFound();
  }

  // Draft documents must first be previewed.
  if (document.status === "DRAFT") {
    redirect(`/documents/${document.id}/edit`);
  }

  // Previewed documents must first be approved.
  if (document.status === "PREVIEWED") {
    redirect(`/documents/${document.id}/preview`);
  }

  const toRecipient =
    document.recipients.find(
      (recipient) => recipient.type === "TO"
    )?.email ?? "";

  const ccRecipients = document.recipients
    .filter(
      (recipient) => recipient.type === "CC"
    )
    .map((recipient) => recipient.email)
    .join(", ");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Approved Document
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Download or send the approved document to the
            customer.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/documents/${document.id}/preview`}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View Document
          </Link>

          <Link
            href="/documents"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to Documents
          </Link>
        </div>
      </div>

      {/* Document Information */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-6">
          <div>
            <div className="text-lg font-semibold text-slate-900">
              {document.documentNumber}
            </div>

            <div className="mt-1 text-sm text-slate-500">
              Created by {document.createdBy.name}
            </div>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              document.status === "SENT"
                ? "bg-blue-100 text-blue-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {document.status}
          </span>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Customer
            </div>

            <div className="mt-2 font-medium text-slate-900">
              {document.customerNameFirm}
            </div>

            {toRecipient && (
              <div className="mt-1 text-sm text-slate-500">
                {toRecipient}
              </div>
            )}
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Document Type
            </div>

            <div className="mt-2 font-medium text-slate-900">
              {document.documentType === "QUOTATION"
                ? "Quotation"
                : "Order Form"}
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
            Download the approved document as a PDF for
            printing or sharing manually.
          </p>

          <a
            href={`/api/documents/${document.id}/pdf`}
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
            Send the approved document directly to the
            customer.
          </p>

          <div className="mt-6">
            <DocumentSendForm
              documentId={document.id}
              documentNumber={document.documentNumber}
              defaultTo={toRecipient}
              defaultCc={ccRecipients}
              alreadySent={document.status === "SENT"}
            />
          </div>
        </section>
      </div>
    </div>
  );
}