"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

type Props = {
  documentId:
    number;

  currentStatus:
    string;

  documentType:
    "QUOTATION" |
    "ORDER_FORM";
};

export default function PublicQuotationPreviewActions({
  documentId,
  currentStatus,
  documentType,
}: Props) {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] = useState(
    false
  );

  const [
    error,
    setError,
  ] = useState(
    ""
  );

  const documentLabel =
    documentType ===
    "ORDER_FORM"
      ? "order form"
      : "quotation";

  async function approveDocument() {
    const confirmed =
      window.confirm(
        `Are you sure you want to approve this ${documentLabel}?`
      );

    if (
      !confirmed
    ) {
      return;
    }

    setLoading(
      true
    );

    setError(
      ""
    );

    try {
      const response =
        await fetch(
          `/api/public/quotation/${documentId}/approve`,
          {
            method:
              "POST",

            headers: {
              Accept:
                "application/json",
            },
          }
        );

      const result =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          result.message ??
            `Unable to approve ${documentLabel}.`
        );
      }

      router.push(
        `/quotation/${documentId}/actions`
      );

      router.refresh();
    } catch (
      error
    ) {
      setError(
        error instanceof
          Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  if (
    currentStatus ===
      "APPROVED" ||
    currentStatus ===
      "SENT"
  ) {
    return (
      <button
        type="button"
        onClick={() =>
          router.push(
            `/quotation/${documentId}/actions`
          )
        }
        className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
      >
        Continue
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={
          approveDocument
        }
        disabled={
          loading
        }
        className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Approving..."
          : "Approve & Proceed"}
      </button>

      {error && (
        <p className="mt-2 max-w-sm text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}