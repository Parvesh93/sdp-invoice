import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import DocumentPreviewActions from "@/components/documents/document-preview-actions";

type PreviewPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PreviewDocumentPage({
  params,
}: PreviewPageProps) {
  const { id } = await params;

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
    await prisma.document.findUnique({
      where: {
        id: documentId,
      },

      include: {
        recipients: true,

         activities: {
        orderBy: {
          createdAt: "desc",
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

  

  const toRecipients =
    document.recipients.filter(
      (recipient) =>
        recipient.type === "TO"
    );

  const ccRecipients =
    document.recipients.filter(
      (recipient) =>
        recipient.type === "CC"
    );

    

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Document Preview
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review the complete generated document before approval.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {document.status !==
            "SENT" && (
            <Link
              href={`/documents/${document.id}/edit`}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Edit Document
            </Link>
          )}

          <DocumentPreviewActions
            documentId={
              document.id
            }
            currentStatus={
              document.status
            }
          />
        </div>
      </div>

      {/* Document Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4">
        <div>
          <p className="text-sm font-medium text-slate-900">
            {
              document.documentNumber
            }
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Created by{" "}
            {
              document.createdBy
                .name
            }
          </p>
        </div>

        <StatusBadge
          status={
            document.status
          }
        />
      </div>

      {/* Actual PDF Preview */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
        <iframe
          src={`/api/documents/${document.id}/preview-pdf`}
          title={`Preview ${document.documentNumber}`}
          className="h-[calc(100vh-220px)] min-h-225 w-full bg-slate-200"
        />
      </div>

      {/* Email Recipients */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">
          Email Recipients
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Email is optional while creating the document.
        </p>

        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">
              To
            </p>

            <div className="mt-2 space-y-1">
              {toRecipients.length ===
              0 ? (
                <p className="text-sm text-slate-400">
                  No recipient specified.
                </p>
              ) : (
                toRecipients.map(
                  (recipient) => (
                    <p
                      key={
                        recipient.id
                      }
                      className="text-sm text-slate-700"
                    >
                      {
                        recipient.email
                      }
                    </p>
                  )
                )
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">
              CC
            </p>

            <div className="mt-2 space-y-1">
              {ccRecipients.length ===
              0 ? (
                <p className="text-sm text-slate-400">
                  No CC recipients
                </p>
              ) : (
                ccRecipients.map(
                  (recipient) => (
                    <p
                      key={
                        recipient.id
                      }
                      className="text-sm text-slate-700"
                    >
                      {
                        recipient.email
                      }
                    </p>
                  )
                )
              )}
            </div>
          </div>
        </div>

        
      </div>

{/* Activity History */}
<div className="rounded-xl border border-slate-200 bg-white p-6">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="font-semibold text-slate-900">
        Activity History
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Audit trail for this document.
      </p>
    </div>
  </div>

  <div className="mt-6">
    {document.activities.length === 0 ? (
      <p className="text-sm text-slate-400">
        No activity recorded.
      </p>
    ) : (
      <div className="space-y-0">
        {document.activities.map((activity, index) => (
          <div
            key={activity.id}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {/* Timeline line */}
            {index !== document.activities.length - 1 && (
              <div className="absolute left-1.75 top-5 h-full w-px bg-slate-200" />
            )}

            {/* Dot */}
            <div className="relative mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-slate-400 bg-white" />

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-900">
                  {formatActivityLabel(activity.action)}
                </p>

                <p className="text-xs text-slate-400">
                  {formatDateTime(activity.createdAt)}
                </p>
              </div>

              {activity.description && (
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {activity.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>

    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  let classes =
    "bg-slate-100 text-slate-700";

  if (
    status === "PREVIEWED"
  ) {
    classes =
      "bg-amber-100 text-amber-700";
  }

  if (
    status === "APPROVED"
  ) {
    classes =
      "bg-emerald-100 text-emerald-700";
  }

  if (
    status === "SENT"
  ) {
    classes =
      "bg-blue-100 text-blue-700";
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${classes}`}
    >
      {status}
    </span>
  );
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatActivityLabel(action: string) {
  const labels: Record<string, string> = {
    DOCUMENT_CREATED: "Document Created",
    DOCUMENT_DRAFT_SAVED: "Draft Saved",
    DOCUMENT_EDITED: "Document Edited",
    DOCUMENT_APPROVED: "Document Approved",
    DOCUMENT_SENT: "Document Sent",
  };

  return (
    labels[action] ??
    action
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ")
  );
}