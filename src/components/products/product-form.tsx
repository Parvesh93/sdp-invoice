"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import RichTextEditor from "@/components/editor/rich-text-editor";

type CategoryOption = {
  id: number;
  name: string;
};

type ProductFormProps = {
  categories: CategoryOption[];

  product?: {
    id: number;
    name: string;
    model: string | null;
    description: string | null;

    annexureContent: string | null;

    standardPrice: string;
    categoryId: number;

    isActive: boolean;

    variants: {
      id: number;
      name: string;
      isActive: boolean;
    }[];
  };
};

export default function ProductForm({
  categories,
  product,
}: ProductFormProps) {
  const router = useRouter();

  const isEditing = Boolean(product);

  const [name, setName] = useState(
    product?.name ?? ""
  );

  const [model, setModel] = useState(
    product?.model ?? ""
  );

  const [categoryId, setCategoryId] =
    useState(
      product?.categoryId?.toString() ?? ""
    );

  const [
    standardPrice,
    setStandardPrice,
  ] = useState(
    product?.standardPrice ?? ""
  );

  const [
    description,
    setDescription,
  ] = useState(
    product?.description ?? ""
  );

  const [
    annexureContent,
    setAnnexureContent,
  ] = useState(
    product?.annexureContent ?? ""
  );

  const [variants, setVariants] =
    useState<string[]>(
      product?.variants
        ?.filter(
          (variant) =>
            variant.isActive
        )
        .map(
          (variant) =>
            variant.name
        ) ?? []
    );

  const [
    newVariant,
    setNewVariant,
  ] = useState("");

  const [isActive, setIsActive] =
    useState(
      product?.isActive ?? true
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  function addVariant() {
    const value =
      newVariant.trim();

    if (!value) {
      return;
    }

    if (
      variants.some(
        (variant) =>
          variant.toLowerCase() ===
          value.toLowerCase()
      )
    ) {
      setNewVariant("");
      return;
    }

    setVariants((current) => [
      ...current,
      value,
    ]);

    setNewVariant("");
  }

  function removeVariant(
    index: number
  ) {
    setVariants((current) =>
      current.filter(
        (_, variantIndex) =>
          variantIndex !== index
      )
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const url = isEditing
        ? `/api/products/${product!.id}`
        : "/api/products";

      const response = await fetch(url, {
        method: isEditing
          ? "PUT"
          : "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          name,
          model,
          categoryId,
          standardPrice,
          description,
          annexureContent,
          variants,
          isActive,
        }),
      });

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ??
            "Unable to save product."
        );
      }

      router.push("/products");
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
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Basic details */}
      <section className="space-y-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Product Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Basic machine details used in quotations.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="Product Name *"
            value={name}
            required
            onChange={setName}
            placeholder="Automatic Block Cutting Machine"
          />

          <Field
            label="Model"
            value={model}
            onChange={setModel}
            placeholder="SDP-BC-1200"
          />

          <div>
            <Label>
              Category *
            </Label>

            <select
              value={categoryId}
              onChange={(event) =>
                setCategoryId(
                  event.target.value
                )
              }
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            >
              <option value="">
                Select Category
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <Label>
              Standard Price *
            </Label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                ₹
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  standardPrice
                }
                onChange={(
                  event
                ) =>
                  setStandardPrice(
                    event.target
                      .value
                  )
                }
                required
                className="w-full rounded-lg border border-slate-300 py-3 pl-9 pr-4 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        <div>
          <Label>
            Description
          </Label>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            rows={5}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            placeholder="Description shown in quotation product table..."
          />
        </div>
      </section>

      {/* Variants */}
      <section className="border-t border-slate-200 pt-8">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Sub-types / Variants
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Optional specifications such as blade count,
            machine size or configuration.
          </p>
        </div>

        <div className="mt-5 max-w-2xl">
          <div className="flex gap-3">
            <input
              value={newVariant}
              onChange={(event) =>
                setNewVariant(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  event.preventDefault();
                  addVariant();
                }
              }}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              placeholder="Example: 12 Blade"
            />

            <button
              type="button"
              onClick={addVariant}
              className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Add Variant
            </button>
          </div>

          {variants.length > 0 && (
            <div className="mt-4 space-y-2">
              {variants.map(
                (
                  variant,
                  index
                ) => (
                  <div
                    key={`${variant}-${index}`}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <span className="text-sm font-medium text-slate-700">
                      {variant}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removeVariant(
                          index
                        )
                      }
                      className="text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* Annexure */}
      <section className="border-t border-slate-200 pt-8">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Product Annexure
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Technical specifications, salient features and
            extra items. This content will be appended to the
            final PDF when the product is selected.
          </p>
        </div>

        <div className="mt-5">
          <RichTextEditor
            value={
              annexureContent
            }
            onChange={
              setAnnexureContent
            }
          />
        </div>
      </section>

      {/* Status */}
      <section className="border-t border-slate-200 pt-8">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(event) =>
                setIsActive(
                  event.target
                    .checked
                )
              }
              className="mt-1 h-4 w-4"
            />

            <div>
              <label
                htmlFor="isActive"
                className="cursor-pointer text-sm font-medium text-slate-800"
              >
                Active Product
              </label>

              <p className="mt-1 text-xs text-slate-500">
                Inactive products will not appear in new
                quotation or order forms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-3 border-t border-slate-200 pt-6">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-950 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : isEditing
              ? "Update Product"
              : "Add Product"}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() =>
            router.push(
              "/products"
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

function Label({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>

      <input
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
      />
    </div>
  );
}