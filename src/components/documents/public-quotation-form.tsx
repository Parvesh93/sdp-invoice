"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

/* =========================================================
   TYPES
========================================================= */

type GstType =
  | "CGST_SGST"
  | "IGST";

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: number;

  name: string;

  model: string | null;

  description: string | null;

  categoryId: number;

  standardPrice: string;
};

type ProductRow = {
  categoryId: string;

  productId: string;

  standardPrice: string;

  priceOverride: string;

  quantity: number;
};

type Props = {
  categories: Category[];

  products: Product[];

  companyState: string;

  defaultGstPercent: string;

  defaultGstType: string;
};

/* =========================================================
   HELPERS
========================================================= */

function createEmptyRow(): ProductRow {
  return {
    categoryId: "",

    productId: "",

    standardPrice: "",

    priceOverride: "",

    quantity: 1,
  };
}

function formatCurrency(
  value: number
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",

      minimumFractionDigits:
        2,

      maximumFractionDigits:
        2,
    }
  ).format(value);
}

function formatPercent(
  value: number
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      maximumFractionDigits:
        2,
    }
  ).format(value);
}

function normalizeState(
  value:
    | string
    | null
    | undefined
) {
  return String(
    value ?? ""
  )
    .trim()
    .toLowerCase()
    .replace(
      /\s+/g,
      " "
    );
}

function determineGstType({
  customerState,
  companyState,
  fallback,
}: {
  customerState:
    | string
    | null
    | undefined;

  companyState:
    | string
    | null
    | undefined;

  fallback:
    string;
}): GstType {
  const customer =
    normalizeState(
      customerState
    );

  const company =
    normalizeState(
      companyState
    );

  if (
    customer &&
    company
  ) {
    return customer ===
      company
      ? "CGST_SGST"
      : "IGST";
  }

  return fallback ===
    "IGST"
    ? "IGST"
    : "CGST_SGST";
}

/* =========================================================
   COMPONENT
========================================================= */

export default function PublicQuotationForm({
  categories,
  products,
  companyState,
  defaultGstPercent,
  defaultGstType,
}: Props) {
  const [
    customer,
    setCustomer,
  ] = useState({
    nameFirmName: "",
    email: "",
    cc: "",
    phone: "",
    whatsapp: "",
    gstNumber: "",
    city: "",
    state: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
  });

  const [
    rows,
    setRows,
  ] =
    useState<ProductRow[]>([
      createEmptyRow(),
    ]);

  const [
    additionalNotes,
    setAdditionalNotes,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    pdfUrl,
    setPdfUrl,
  ] = useState<string | null>(
    null
  );

  const [
    filename,
    setFilename,
  ] = useState(
    "quotation.pdf"
  );

  const [
    documentNumber,
    setDocumentNumber,
  ] = useState("");

  const gstPercent =
    Number(
      defaultGstPercent ||
        18
    );

  const gstType =
    determineGstType({
      customerState:
        customer.state,

      companyState,

      fallback:
        defaultGstType,
    });

  /* =======================================================
     CUSTOMER
  ======================================================= */

  function updateCustomer(
    field:
      keyof typeof customer,

    value: string
  ) {
    setCustomer(
      (
        current
      ) => ({
        ...current,

        [field]:
          value,
      })
    );
  }

  /* =======================================================
     PRODUCT ROWS
  ======================================================= */

  function updateRow(
    index: number,

    field:
      keyof ProductRow,

    value:
      | string
      | number
  ) {
    setRows(
      (
        current
      ) => {
        const copy =
          [
            ...current,
          ];

        copy[index] = {
          ...copy[
            index
          ],

          [field]:
            value,
        };

        return copy;
      }
    );
  }

  function handleCategoryChange(
    index: number,

    categoryId: string
  ) {
    setRows(
      (
        current
      ) => {
        const copy =
          [
            ...current,
          ];

        copy[index] = {
          ...copy[
            index
          ],

          categoryId,

          productId:
            "",

          standardPrice:
            "",

          priceOverride:
            "",
        };

        return copy;
      }
    );
  }

  function handleProductChange(
    index: number,

    productId: string
  ) {
    const product =
      products.find(
        (
          item
        ) =>
          item.id ===
          Number(
            productId
          )
      );

    setRows(
      (
        current
      ) => {
        const copy =
          [
            ...current,
          ];

        copy[index] = {
          ...copy[
            index
          ],

          productId,

          standardPrice:
            product
              ?.standardPrice ??
            "",

          priceOverride:
            "",
        };

        return copy;
      }
    );
  }

  function addRow() {
    setRows(
      (
        current
      ) => [
        ...current,

        createEmptyRow(),
      ]
    );
  }

  function removeRow(
    index: number
  ) {
    setRows(
      (
        current
      ) =>
        current.filter(
          (
            _,
            rowIndex
          ) =>
            rowIndex !==
            index
        )
    );
  }

  function getFinalPrice(
    row:
      ProductRow
  ) {
    if (
      row.priceOverride !==
      ""
    ) {
      const override =
        Number(
          row.priceOverride
        );

      if (
        Number.isFinite(
          override
        )
      ) {
        return override;
      }
    }

    return Number(
      row.standardPrice ||
        0
    );
  }

  function getLineTotal(
    row:
      ProductRow
  ) {
    return (
      getFinalPrice(
        row
      ) *
      Number(
        row.quantity ||
          1
      )
    );
  }

  /* =======================================================
     TOTALS
  ======================================================= */

  const subtotal =
    useMemo(
      () =>
        rows.reduce(
          (
            sum,
            row
          ) =>
            sum +
            getLineTotal(
              row
            ),

          0
        ),

      [
        rows,
      ]
    );

  const cgstPercent =
    gstType ===
    "CGST_SGST"
      ? gstPercent /
        2
      : 0;

  const sgstPercent =
    gstType ===
    "CGST_SGST"
      ? gstPercent /
        2
      : 0;

  const igstPercent =
    gstType ===
    "IGST"
      ? gstPercent
      : 0;

  const cgstAmount =
    subtotal *
    (
      cgstPercent /
      100
    );

  const sgstAmount =
    subtotal *
    (
      sgstPercent /
      100
    );

  const igstAmount =
    subtotal *
    (
      igstPercent /
      100
    );

  const gstAmount =
    cgstAmount +
    sgstAmount +
    igstAmount;

  const grandTotal =
    subtotal +
    gstAmount;

  /* =======================================================
     BASE64 -> PDF
  ======================================================= */

  function createPdfUrl(
    base64:
      string
  ) {
    const binary =
      window.atob(
        base64
      );

    const bytes =
      new Uint8Array(
        binary.length
      );

    for (
      let i = 0;
      i <
      binary.length;
      i++
    ) {
      bytes[i] =
        binary.charCodeAt(
          i
        );
    }

    const blob =
      new Blob(
        [
          bytes,
        ],
        {
          type:
            "application/pdf",
        }
      );

    return URL.createObjectURL(
      blob
    );
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (
        !customer.nameFirmName.trim()
      ) {
        throw new Error(
          "Name / Firm Name is required."
        );
      }

      const validRows =
        rows.filter(
          (
            row
          ) =>
            row.productId !==
            ""
        );

      if (
        validRows.length ===
        0
      ) {
        throw new Error(
          "Please select at least one product."
        );
      }

      const response =
        await fetch(
          "/api/public/quotation",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                customer,

                additionalNotes,

                items:
                  validRows.map(
                    (
                      row
                    ) => ({
                      productId:
                        Number(
                          row.productId
                        ),

                      quantity:
                        Number(
                          row.quantity
                        ),

                      priceOverride:
                        row.priceOverride ===
                        ""
                          ? null
                          : Number(
                              row.priceOverride
                            ),
                    })
                  ),
              }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          result.message ??
            "Unable to generate quotation."
        );
      }

      if (
        pdfUrl
      ) {
        URL.revokeObjectURL(
          pdfUrl
        );
      }

      const newUrl =
        createPdfUrl(
          result.data.pdfBase64
        );

      setPdfUrl(
        newUrl
      );

      setFilename(
        result.data.filename
      );

      setDocumentNumber(
        result.data.documentNumber
      );

      setTimeout(
        () => {
          document
            .getElementById(
              "quotation-preview"
            )
            ?.scrollIntoView({
              behavior:
                "smooth",
            });
        },

        100
      );
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
      setLoading(false);
    }
  }

  return (
    <>
      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-6"
      >
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =================================================
            CUSTOMER
        ================================================= */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Customer Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the customer or firm information for this quotation.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <InputField
              label="Name / Firm Name *"
              value={
                customer.nameFirmName
              }
              required
              onChange={(
                value
              ) =>
                updateCustomer(
                  "nameFirmName",
                  value
                )
              }
            />

            <InputField
              label="Email / To"
              value={
                customer.email
              }
              onChange={(
                value
              ) =>
                updateCustomer(
                  "email",
                  value
                )
              }
            />

            <InputField
              label="CC"
              value={
                customer.cc
              }
              onChange={(
                value
              ) =>
                updateCustomer(
                  "cc",
                  value
                )
              }
            />

            <InputField
              label="Phone"
              value={
                customer.phone
              }
              onChange={(
                value
              ) =>
                updateCustomer(
                  "phone",
                  value
                )
              }
            />

            <InputField
              label="WhatsApp"
              value={
                customer.whatsapp
              }
              onChange={(
                value
              ) =>
                updateCustomer(
                  "whatsapp",
                  value
                )
              }
            />

            <InputField
              label="GST Number"
              value={
                customer.gstNumber
              }
              onChange={(
                value
              ) =>
                updateCustomer(
                  "gstNumber",
                  value
                )
              }
            />

            <InputField
              label="City"
              value={
                customer.city
              }
              onChange={(
                value
              ) =>
                updateCustomer(
                  "city",
                  value
                )
              }
            />

            <InputField
              label="State"
              value={
                customer.state
              }
              onChange={(
                value
              ) =>
                updateCustomer(
                  "state",
                  value
                )
              }
            />

            <InputField
              label="Address Line 1"
              value={
                customer.addressLine1
              }
              onChange={(
                value
              ) =>
                updateCustomer(
                  "addressLine1",
                  value
                )
              }
            />

            <InputField
              label="Address Line 2"
              value={
                customer.addressLine2
              }
              onChange={(
                value
              ) =>
                updateCustomer(
                  "addressLine2",
                  value
                )
              }
            />

            <InputField
              label="Address Line 3"
              value={
                customer.addressLine3
              }
              onChange={(
                value
              ) =>
                updateCustomer(
                  "addressLine3",
                  value
                )
              }
            />
          </div>

          <div
            className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
              gstType ===
              "CGST_SGST"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-blue-200 bg-blue-50 text-blue-700"
            }`}
          >
            <strong>
              {gstType ===
              "CGST_SGST"
                ? `CGST ${formatPercent(
                    cgstPercent
                  )}% + SGST ${formatPercent(
                    sgstPercent
                  )}%`
                : `IGST ${formatPercent(
                    igstPercent
                  )}%`}
            </strong>

            <span className="ml-2 text-xs opacity-75">
              automatically calculated from customer state
            </span>
          </div>
        </section>

        {/* =================================================
            PRODUCTS
        ================================================= */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Products
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select category and machine.
          </p>

          <div className="mt-6 space-y-4">
            {rows.map(
              (
                row,
                index
              ) => {
                const availableProducts =
                  products.filter(
                    (
                      product
                    ) =>
                      product.categoryId ===
                      Number(
                        row.categoryId
                      )
                  );

                return (
                  <div
                    key={
                      index
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                      <SelectField
                        label="Category"
                        value={
                          row.categoryId
                        }
                        onChange={(
                          value
                        ) =>
                          handleCategoryChange(
                            index,
                            value
                          )
                        }
                        options={categories.map(
                          (
                            category
                          ) => ({
                            value:
                              category.id.toString(),

                            label:
                              category.name,
                          })
                        )}
                        placeholder="Select Category"
                      />

                      <SelectField
                        label="Product"
                        value={
                          row.productId
                        }
                        disabled={
                          !row.categoryId
                        }
                        onChange={(
                          value
                        ) =>
                          handleProductChange(
                            index,
                            value
                          )
                        }
                        options={availableProducts.map(
                          (
                            product
                          ) => ({
                            value:
                              product.id.toString(),

                            label:
                              product.model
                                ? `${product.name} - ${product.model}`
                                : product.name,
                          })
                        )}
                        placeholder="Select Product"
                      />

                      <div>
                        <Label>
                          Standard Price
                        </Label>

                        <input
                          readOnly
                          value={
                            row.standardPrice
                              ? formatCurrency(
                                  Number(
                                    row.standardPrice
                                  )
                                )
                              : ""
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3"
                        />
                      </div>

                      <div>
                        <Label>
                          Price Override
                        </Label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            row.priceOverride
                          }
                          onChange={(
                            event
                          ) =>
                            updateRow(
                              index,
                              "priceOverride",
                              event.target.value
                            )
                          }
                          placeholder="Optional"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3"
                        />
                      </div>

                      <div>
                        <Label>
                          Qty
                        </Label>

                        <input
                          type="number"
                          min="1"
                          value={
                            row.quantity
                          }
                          onChange={(
                            event
                          ) =>
                            updateRow(
                              index,
                              "quantity",
                              Math.max(
                                1,
                                Number(
                                  event.target.value
                                )
                              )
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3"
                        />
                      </div>

                      <div>
                        <Label>
                          Line Total
                        </Label>

                        <input
                          readOnly
                          value={formatCurrency(
                            getLineTotal(
                              row
                            )
                          )}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-medium"
                        />
                      </div>
                    </div>

                    {rows.length >
                      1 && (
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            removeRow(
                              index
                            )
                          }
                          className="text-sm font-medium text-red-600"
                        >
                          Remove Product
                        </button>
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>

          <button
            type="button"
            onClick={
              addRow
            }
            className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            + Add More Product
          </button>
        </section>

        {/* =================================================
            NOTES / TOTAL
        ================================================= */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              <Label>
                Additional Notes
              </Label>

              <textarea
                rows={6}
                value={
                  additionalNotes
                }
                onChange={(
                  event
                ) =>
                  setAdditionalNotes(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
                placeholder="Optional notes..."
              />
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <SummaryRow
                label="Subtotal"
                value={formatCurrency(
                  subtotal
                )}
              />

              {gstType ===
              "CGST_SGST" ? (
                <>
                  <SummaryRow
                    label={`CGST ${formatPercent(
                      cgstPercent
                    )}%`}
                    value={formatCurrency(
                      cgstAmount
                    )}
                  />

                  <SummaryRow
                    label={`SGST ${formatPercent(
                      sgstPercent
                    )}%`}
                    value={formatCurrency(
                      sgstAmount
                    )}
                  />
                </>
              ) : (
                <SummaryRow
                  label={`IGST ${formatPercent(
                    igstPercent
                  )}%`}
                  value={formatCurrency(
                    igstAmount
                  )}
                />
              )}

              <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-lg">
                <strong>
                  Grand Total
                </strong>

                <strong>
                  {formatCurrency(
                    grandTotal
                  )}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end pb-4">
          <button
            type="submit"
            disabled={
              loading
            }
            className="rounded-xl bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Generating Quotation..."
              : "Generate Quotation"}
          </button>
        </div>
      </form>

      {/* =================================================
          PDF PREVIEW
      ================================================= */}

      {pdfUrl && (
        <section
          id="quotation-preview"
          className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Quotation Generated
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {documentNumber}
              </p>
            </div>

            <a
              href={
                pdfUrl
              }
              download={
                filename
              }
              className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Download PDF
            </a>
          </div>

          <iframe
            src={
              pdfUrl
            }
            title="Quotation Preview"
            className="h-[800px] w-full rounded-xl border border-slate-200"
          />
        </section>
      )}
    </>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function Label({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

function InputField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;

  value: string;

  onChange:
    (
      value:
        string
    ) => void;

  required?:
    boolean;
}) {
  return (
    <div>
      <Label>
        {label}
      </Label>

      <input
        value={
          value
        }
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
        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: {
  label: string;

  value: string;

  onChange:
    (
      value:
        string
    ) => void;

  options: {
    value: string;
    label: string;
  }[];

  placeholder:
    string;

  disabled?:
    boolean;
}) {
  return (
    <div>
      <Label>
        {label}
      </Label>

      <select
        value={
          value
        }
        disabled={
          disabled
        }
        required
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 disabled:bg-slate-100"
      >
        <option value="">
          {placeholder}
        </option>

        {options.map(
          (
            option
          ) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {
                option.label
              }
            </option>
          )
        )}
      </select>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="mb-3 flex justify-between gap-4 text-sm">
      <span className="text-slate-500">
        {label}
      </span>

      <strong className="text-right text-slate-900">
        {value}
      </strong>
    </div>
  );
}