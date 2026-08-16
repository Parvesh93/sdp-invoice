"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type DocumentSendFormProps = {
  documentId: number;
  documentNumber: string;
  defaultTo: string;
  defaultCc: string;
  alreadySent: boolean;
};

export default function DocumentSendForm({
  documentId,
  documentNumber,
  defaultTo,
  defaultCc,
  alreadySent,
}: DocumentSendFormProps) {
  const router = useRouter();

  const [to, setTo] = useState(defaultTo);
  const [cc, setCc] = useState(defaultCc);

  const [subject, setSubject] = useState(
    `SDP Machines - ${documentNumber}`
  );

  const [message, setMessage] = useState(
    `Dear Customer,

Please find attached ${documentNumber} from SDP Machines.

Regards,
SDP Machines`
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/documents/${documentId}/send`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            to,
            cc,
            subject,
            message,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") ?? "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          `Send API returned ${response.status}. Check the API route and terminal.`
        );
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ?? "Unable to send document."
        );
      }

      setSuccess("Document sent successfully.");

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send document."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {alreadySent && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
          This document has already been sent. You can send
          it again if required.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div>
        <label
          htmlFor="to"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          To *
        </label>

        <input
          id="to"
          type="email"
          value={to}
          onChange={(event) =>
            setTo(event.target.value)
          }
          required
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          placeholder="customer@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="cc"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          CC
        </label>

        <input
          id="cc"
          value={cc}
          onChange={(event) =>
            setCc(event.target.value)
          }
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          placeholder="accounts@example.com, manager@example.com"
        />

        <p className="mt-1 text-xs text-slate-400">
          Separate multiple email addresses with commas.
        </p>
      </div>

      <div>
        <label
          htmlFor="subject"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Subject *
        </label>

        <input
          id="subject"
          value={subject}
          onChange={(event) =>
            setSubject(event.target.value)
          }
          required
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Message
        </label>

        <textarea
          id="message"
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          rows={7}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Sending..."
          : alreadySent
            ? "Send Again"
            : "Send Document"}
      </button>
    </form>
  );
}