"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

type CustomerFormProps = {
  customer?: {
    id: number;

    nameFirmName: string;

    email: string | null;

    phone: string | null;

    whatsapp: string | null;

    gstNumber: string | null;

    city: string | null;

    state: string | null;

    addressLine1: string | null;

    addressLine2: string | null;

    addressLine3: string | null;
  };
};

export default function CustomerForm({
  customer,
}: CustomerFormProps) {
  const router =
    useRouter();

  const isEditing =
    Boolean(customer);

  const [form, setForm] =
    useState({
      nameFirmName:
        customer?.nameFirmName ??
        "",

      email:
        customer?.email ?? "",

      phone:
        customer?.phone ?? "",

      whatsapp:
        customer?.whatsapp ??
        "",

      gstNumber:
        customer?.gstNumber ??
        "",

      city:
        customer?.city ?? "",

      state:
        customer?.state ?? "",

      addressLine1:
        customer?.addressLine1 ??
        "",

      addressLine2:
        customer?.addressLine2 ??
        "",

      addressLine3:
        customer?.addressLine3 ??
        "",
    });

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  function updateField(
    field:
      keyof typeof form,

    value: string
  ) {
    setForm(
      (current) => ({
        ...current,

        [field]: value,
      })
    );
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);

    setError("");

    try {
      const url =
        isEditing
          ? `/api/customers/${customer!.id}`
          : "/api/customers";

      const response =
        await fetch(url, {
          method:
            isEditing
              ? "PUT"
              : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              form
            ),
        });

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ??
            "Unable to save customer."
        );
      }

      router.push(
        "/customers"
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-6"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Field
          label="Name / Firm Name *"
          value={
            form.nameFirmName
          }
          required
          onChange={(value) =>
            updateField(
              "nameFirmName",
              value
            )
          }
        />

        <Field
          label="Email"
          type="email"
          value={
            form.email
          }
          onChange={(value) =>
            updateField(
              "email",
              value
            )
          }
        />

        <Field
          label="Phone"
          value={
            form.phone
          }
          onChange={(value) =>
            updateField(
              "phone",
              value
            )
          }
        />

        <Field
          label="WhatsApp"
          value={
            form.whatsapp
          }
          onChange={(value) =>
            updateField(
              "whatsapp",
              value
            )
          }
        />

        <Field
          label="GST Number"
          value={
            form.gstNumber
          }
          onChange={(value) =>
            updateField(
              "gstNumber",
              value
            )
          }
        />

        <Field
          label="City"
          value={
            form.city
          }
          onChange={(value) =>
            updateField(
              "city",
              value
            )
          }
        />

        <Field
          label="State"
          value={
            form.state
          }
          onChange={(value) =>
            updateField(
              "state",
              value
            )
          }
        />
      </div>

      <div className="space-y-4">
        <Field
          label="Address Line 1"
          value={
            form.addressLine1
          }
          onChange={(value) =>
            updateField(
              "addressLine1",
              value
            )
          }
        />

        <Field
          label="Address Line 2"
          value={
            form.addressLine2
          }
          onChange={(value) =>
            updateField(
              "addressLine2",
              value
            )
          }
        />

        <Field
          label="Address Line 3"
          value={
            form.addressLine3
          }
          onChange={(value) =>
            updateField(
              "addressLine3",
              value
            )
          }
        />
      </div>

      <div className="flex gap-3 border-t border-slate-200 pt-6">
        <button
          type="submit"
          disabled={
            loading
          }
          className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : isEditing
              ? "Update Customer"
              : "Add Customer"}
        </button>

        <button
          type="button"
          disabled={
            loading
          }
          onClick={() =>
            router.push(
              "/customers"
            )
          }
          className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
  type = "text",
}: {
  label: string;

  value: string;

  onChange:
    (value: string) =>
      void;

  required?: boolean;

  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        required={
          required
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
      />
    </div>
  );
}