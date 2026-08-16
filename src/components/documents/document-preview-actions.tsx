"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  documentId: number;
  currentStatus: string;
};

export default function DocumentPreviewActions({
  documentId,
  currentStatus,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function approveDocument() {
    const confirmed = window.confirm(
      "Are you sure you want to approve this document?"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/documents/${documentId}/approve`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const contentType =
        response.headers.get("content-type") ?? "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();

        console.error(
          "NON JSON APPROVE RESPONSE:",
          response.status,
          text
        );

        throw new Error(
          `Approve API returned ${response.status}. Check the API route and terminal.`
        );
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ?? "Unable to approve document."
        );
      }

      router.push(`/documents/${documentId}/actions`);
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (currentStatus === "APPROVED") {
    return (
      <button
        type="button"
        onClick={() =>
          router.push(`/documents/${documentId}/actions`)
        }
        className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
      >
        Continue
      </button>
    );
  }

  if (currentStatus === "SENT") {
    return (
      <button
        type="button"
        onClick={() =>
          router.push(`/documents/${documentId}/actions`)
        }
        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        View Actions
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={approveDocument}
        disabled={loading}
        className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Approving..." : "Approve & Proceed"}
      </button>

      {error && (
        <p className="mt-2 max-w-sm text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}