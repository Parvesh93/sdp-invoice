"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

/* =========================================================
   TYPES
========================================================= */

type Category = {
  id: number;
  name: string;
};

type ProductVariant = {
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

  variants: ProductVariant[];
};

type CustomerOption = {
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

type ExistingDocument = {
  id: number;

  documentType:
    | "QUOTATION"
    | "ORDER_FORM";

  customer: {
    nameFirmName: string;

    email: string;

    cc: string;

    phone: string;

    whatsapp: string;

    gstNumber: string;

    city: string;

    state: string;

    addressLine1: string;

    addressLine2: string;

    addressLine3: string;
  };

  gstPercent: string;

  additionalNotes: string;

  items: {
    productId: number;

    categoryId: number;

    variantId:
      | number
      | null;

    standardPrice: string;

    priceOverride: string;

    quantity: number;
  }[];
};

type ProductRow = {
  categoryId: string;

  productId: string;

  variantId: string;

  standardPrice: string;

  priceOverride: string;

  quantity: number;
};

type Props = {
  categories: Category[];

  products: Product[];

  customers?: CustomerOption[];

  document?: ExistingDocument;
};

/* =========================================================
   HELPERS
========================================================= */

function createEmptyRow(): ProductRow {
  return {
    categoryId: "",

    productId: "",

    variantId: "",

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

      minimumFractionDigits: 2,

      maximumFractionDigits: 2,
    }
  ).format(value);
}

/* =========================================================
   COMPONENT
========================================================= */

export default function DocumentForm({
  categories,
  products,
  customers = [],
  document,
}: Props) {
  const router =
    useRouter();

  const isEditing =
    Boolean(document);

  /* =======================================================
     DOCUMENT TYPE
  ======================================================= */

  const [
    documentType,
    setDocumentType,
  ] = useState<
    "QUOTATION" | "ORDER_FORM"
  >(
    document?.documentType ??
      "QUOTATION"
  );

  /* =======================================================
     SUBMIT MODE
  ======================================================= */

  const [
    submitMode,
    setSubmitMode,
  ] = useState<
    "draft" | "preview"
  >("preview");

  /* =======================================================
     CUSTOMER MASTER SELECTION
  ======================================================= */

  const [
    selectedCustomerId,
    setSelectedCustomerId,
  ] = useState("");

  /* =======================================================
     CUSTOMER SNAPSHOT
  ======================================================= */

  const [
    customer,
    setCustomer,
  ] = useState({
    nameFirmName:
      document?.customer
        .nameFirmName ?? "",

    email:
      document?.customer
        .email ?? "",

    cc:
      document?.customer
        .cc ?? "",

    phone:
      document?.customer
        .phone ?? "",

    whatsapp:
      document?.customer
        .whatsapp ?? "",

    gstNumber:
      document?.customer
        .gstNumber ?? "",

    city:
      document?.customer
        .city ?? "",

    state:
      document?.customer
        .state ?? "",

    addressLine1:
      document?.customer
        .addressLine1 ?? "",

    addressLine2:
      document?.customer
        .addressLine2 ?? "",

    addressLine3:
      document?.customer
        .addressLine3 ?? "",
  });

  /* =======================================================
     PRODUCTS
  ======================================================= */

  const [
    rows,
    setRows,
  ] =
    useState<ProductRow[]>(
      document?.items?.length
        ? document.items.map(
            (item) => ({
              categoryId:
                item.categoryId.toString(),

              productId:
                item.productId.toString(),

              variantId:
                item.variantId
                  ? item.variantId.toString()
                  : "",

              standardPrice:
                item.standardPrice,

              priceOverride:
                item.priceOverride,

              quantity:
                item.quantity,
            })
          )
        : [createEmptyRow()]
    );

  /* =======================================================
     TOTALS
  ======================================================= */

  const [
    gstPercent,
    setGstPercent,
  ] = useState(
    Number(
      document?.gstPercent ??
        18
    )
  );

  const [
    additionalNotes,
    setAdditionalNotes,
  ] = useState(
    document?.additionalNotes ??
      ""
  );

  /* =======================================================
     UI
  ======================================================= */

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /* =======================================================
     CUSTOMER HELPERS
  ======================================================= */

  function updateCustomer(
    field:
      keyof typeof customer,

    value: string
  ) {
    setCustomer(
      (current) => ({
        ...current,

        [field]:
          value,
      })
    );
  }

  function handleExistingCustomerChange(
    customerId: string
  ) {
    setSelectedCustomerId(
      customerId
    );

    /*
     * User selected:
     *
     * "Enter New Customer / Firm"
     *
     * Do not clear the existing values automatically.
     * This avoids accidental data loss.
     */
    if (!customerId) {
      return;
    }

    const selected =
      customers.find(
        (item) =>
          item.id ===
          Number(customerId)
      );

    if (!selected) {
      return;
    }

    setCustomer({
      nameFirmName:
        selected.nameFirmName,

      email:
        selected.email ??
        "",

      /*
       * CC is document-specific.
       */
      cc: "",

      phone:
        selected.phone ??
        "",

      whatsapp:
        selected.whatsapp ??
        "",

      gstNumber:
        selected.gstNumber ??
        "",

      city:
        selected.city ??
        "",

      state:
        selected.state ??
        "",

      addressLine1:
        selected.addressLine1 ??
        "",

      addressLine2:
        selected.addressLine2 ??
        "",

      addressLine3:
        selected.addressLine3 ??
        "",
    });
  }

  function clearCustomerForm() {
    setSelectedCustomerId(
      ""
    );

    setCustomer({
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
  }

  /* =======================================================
     PRODUCT HELPERS
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
      (current) => {
        const copy =
          [...current];

        copy[index] = {
          ...copy[index],

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
      (current) => {
        const copy =
          [...current];

        copy[index] = {
          ...copy[index],

          categoryId,

          productId:
            "",

          variantId:
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
    const selectedProduct =
      products.find(
        (product) =>
          product.id ===
          Number(productId)
      );

    setRows(
      (current) => {
        const copy =
          [...current];

        copy[index] = {
          ...copy[index],

          productId,

          variantId:
            "",

          standardPrice:
            selectedProduct
              ?.standardPrice ??
            "",

          priceOverride:
            "",
        };

        return copy;
      }
    );
  }

  function addProductRow() {
    setRows(
      (current) => [
        ...current,

        createEmptyRow(),
      ]
    );
  }

  function removeProductRow(
    index: number
  ) {
    if (
      rows.length <= 1
    ) {
      return;
    }

    setRows(
      (current) =>
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
    row: ProductRow
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
    row: ProductRow
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
    useMemo(() => {
      return rows.reduce(
        (
          sum,
          row
        ) =>
          sum +
          getLineTotal(
            row
          ),

        0
      );
    }, [rows]);

  const gstAmount =
    subtotal *
    (Number(
      gstPercent
    ) /
      100);

  const grandTotal =
    subtotal +
    gstAmount;

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);

    setError("");

    try {
      /* ---------------------------------------
         CUSTOMER
      --------------------------------------- */

      if (
        !customer.nameFirmName.trim()
      ) {
        throw new Error(
          "Name / Firm Name is required."
        );
      }

      /* ---------------------------------------
         ITEMS
      --------------------------------------- */

      const validRows =
        rows.filter(
          (row) =>
            row.productId !==
            ""
        );

      if (
        validRows.length ===
        0
      ) {
        throw new Error(
          "Please add at least one product."
        );
      }

      /* ---------------------------------------
         VARIANTS
      --------------------------------------- */

      for (
        const row of
        validRows
      ) {
        const product =
          products.find(
            (product) =>
              product.id ===
              Number(
                row.productId
              )
          );

        if (
          product &&
          product.variants
            .length >
            0 &&
          !row.variantId
        ) {
          throw new Error(
            `Please select a variant for ${product.name}.`
          );
        }
      }

      /* ---------------------------------------
         API
      --------------------------------------- */

      const url =
        isEditing
          ? `/api/documents/${document!.id}`
          : "/api/documents";

      const response =
        await fetch(
          url,
          {
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
                {
                  documentType,

                  /*
                   * We intentionally send
                   * the customer snapshot.
                   *
                   * The Create API resolves /
                   * creates the master Customer.
                   */
                  customer,

                  /*
                   * Optional hint.
                   *
                   * Currently the backend's
                   * GST/email/phone matching
                   * handles master resolution.
                   *
                   * Keeping this in the payload
                   * makes later backend optimization
                   * easy.
                   */
                  selectedCustomerId:
                    selectedCustomerId
                      ? Number(
                          selectedCustomerId
                        )
                      : null,

                  gstPercent,

                  additionalNotes,

                  saveAsDraft:
                    submitMode ===
                    "draft",

                  items:
                    validRows.map(
                      (
                        row
                      ) => ({
                        productId:
                          Number(
                            row.productId
                          ),

                        variantId:
                          row.variantId
                            ? Number(
                                row.variantId
                              )
                            : null,

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
                }
              ),
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        !contentType?.includes(
          "application/json"
        )
      ) {
        const text =
          await response.text();

        console.error(
          "DOCUMENT API NON JSON:",
          response.status,
          text
        );

        throw new Error(
          `Document API returned ${response.status}.`
        );
      }

      const result =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          result.message ??
            "Unable to save document."
        );
      }

      const documentId =
        result.data.id;

      /* ---------------------------------------
         REDIRECT
      --------------------------------------- */

      if (
        submitMode ===
        "draft"
      ) {
        router.push(
          "/documents"
        );
      } else {
        router.push(
          `/documents/${documentId}/preview`
        );
      }

      router.refresh();
    } catch (error) {
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

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-6"
    >
      {/* Error */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =================================================
          1. DOCUMENT TYPE
      ================================================= */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          1. Document Type
        </h2>

        <div className="mt-4 flex gap-3">
          <DocumentTypeButton
            active={
              documentType ===
              "QUOTATION"
            }
            onClick={() =>
              setDocumentType(
                "QUOTATION"
              )
            }
          >
            Quotation
          </DocumentTypeButton>

          <DocumentTypeButton
            active={
              documentType ===
              "ORDER_FORM"
            }
            onClick={() =>
              setDocumentType(
                "ORDER_FORM"
              )
            }
          >
            Order Form
          </DocumentTypeButton>
        </div>
      </section>

      {/* =================================================
          2. CUSTOMER
      ================================================= */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            2. Customer Details
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select an existing customer or enter a new customer below.
          </p>
        </div>

        {/* Existing Customer Selector */}

<div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
  <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
    {/* Customer Dropdown */}
    <div>
      <Label>
        Select Existing Customer
      </Label>

      <select
        value={selectedCustomerId}
        onChange={(event) =>
          handleExistingCustomerChange(
            event.target.value
          )
        }
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
      >
        <option value="">
          Enter New Customer / Firm
        </option>

        {customers.map(
          (customerOption) => (
            <option
              key={customerOption.id}
              value={customerOption.id}
            >
              {customerOption.nameFirmName}

              {customerOption.city
                ? ` — ${customerOption.city}`
                : ""}

              {customerOption.phone
                ? ` — ${customerOption.phone}`
                : ""}
            </option>
          )
        )}
      </select>

      <p className="mt-2 text-xs text-slate-500">
        Selecting a customer will auto-fill the fields below.
        You can still edit the details for this document.
      </p>
    </div>

    {/* New Customer Button */}
    <div className="lg:pt-[30px]">
      <button
        type="button"
        onClick={clearCustomerForm}
        className="w-full whitespace-nowrap rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 lg:w-auto"
      >
        New Customer
      </button>
    </div>
  </div>

  {/* Existing Customer Message */}
  {selectedCustomerId && (
    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      Existing customer selected. Details have been loaded below.
    </div>
  )}

  {/* New Customer Message */}
  {!selectedCustomerId && !isEditing && (
    <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
      If this is a new customer, they will automatically be
      added to the Customer directory when the document is
      saved.
    </div>
  )}
</div>

        {/* Customer fields */}

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
            placeholder="sales@example.com, owner@example.com"
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
            placeholder="accounts@example.com"
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
      </section>

      {/* =================================================
          3. PRODUCTS
      ================================================= */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          3. Products
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Select category, product and variant. Override pricing only when required.
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

              const selectedProduct =
                products.find(
                  (
                    product
                  ) =>
                    product.id ===
                    Number(
                      row.productId
                    )
                );

              const variants =
                selectedProduct
                  ?.variants ??
                [];

              return (
                <div
                  key={
                    index
                  }
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="grid gap-4 xl:grid-cols-7">
                    {/* Category */}

                    <div>
                      <Label>
                        Category
                      </Label>

                      <select
                        value={
                          row.categoryId
                        }
                        required
                        onChange={(
                          event
                        ) =>
                          handleCategoryChange(
                            index,

                            event
                              .target
                              .value
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3"
                      >
                        <option value="">
                          Select Category
                        </option>

                        {categories.map(
                          (
                            category
                          ) => (
                            <option
                              key={
                                category.id
                              }
                              value={
                                category.id
                              }
                            >
                              {
                                category.name
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* Product */}

                    <div>
                      <Label>
                        Product
                      </Label>

                      <select
                        value={
                          row.productId
                        }
                        required
                        disabled={
                          !row.categoryId
                        }
                        onChange={(
                          event
                        ) =>
                          handleProductChange(
                            index,

                            event
                              .target
                              .value
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 disabled:bg-slate-100"
                      >
                        <option value="">
                          Select Product
                        </option>

                        {availableProducts.map(
                          (
                            product
                          ) => (
                            <option
                              key={
                                product.id
                              }
                              value={
                                product.id
                              }
                            >
                              {
                                product.name
                              }
                              {product.model
                                ? ` - ${product.model}`
                                : ""}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* Variant */}

                    <div>
                      <Label>
                        Variant
                      </Label>

                      <select
                        value={
                          row.variantId
                        }
                        disabled={
                          !row.productId ||
                          variants.length ===
                            0
                        }
                        required={
                          variants.length >
                          0
                        }
                        onChange={(
                          event
                        ) =>
                          updateRow(
                            index,

                            "variantId",

                            event
                              .target
                              .value
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 disabled:bg-slate-100"
                      >
                        <option value="">
                          {variants.length ===
                          0
                            ? "No Variant"
                            : "Select Variant"}
                        </option>

                        {variants.map(
                          (
                            variant
                          ) => (
                            <option
                              key={
                                variant.id
                              }
                              value={
                                variant.id
                              }
                            >
                              {
                                variant.name
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* Standard Price */}

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
                        placeholder="₹0.00"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3"
                      />
                    </div>

                    {/* Override */}

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

                            event
                              .target
                              .value
                          )
                        }
                        placeholder="Optional"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3"
                      />
                    </div>

                    {/* Quantity */}

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
                                event
                                  .target
                                  .value
                              )
                            )
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3"
                      />
                    </div>

                    {/* Total */}

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

                  {/* Product Info */}

                  {selectedProduct && (
                    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <div className="text-xs font-semibold uppercase text-slate-400">
                            Model
                          </div>

                          <div className="mt-1 text-sm font-medium text-slate-700">
                            {selectedProduct.model ||
                              "—"}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-semibold uppercase text-slate-400">
                            Description
                          </div>

                          <div className="mt-1 text-sm text-slate-600">
                            {selectedProduct.description ||
                              "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Remove */}

                  {rows.length >
                    1 && (
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          removeProductRow(
                            index
                          )
                        }
                        className="text-sm font-medium text-red-600 hover:text-red-800"
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
            addProductRow
          }
          className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          + Add More Product
        </button>
      </section>

      {/* =================================================
          4. NOTES & TOTALS
      ================================================= */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          4. Notes & Totals
        </h2>

        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_360px]">
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
                  event
                    .target
                    .value
                )
              }
              placeholder="Optional notes..."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />
          </div>

          <div className="rounded-lg bg-slate-50 p-5">
            <div className="space-y-4">
              <SummaryRow
                label="Subtotal"
                value={formatCurrency(
                  subtotal
                )}
              />

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  GST %
                </span>

                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={
                    gstPercent
                  }
                  onChange={(
                    event
                  ) =>
                    setGstPercent(
                      Number(
                        event
                          .target
                          .value
                      )
                    )
                  }
                  className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-right"
                />
              </div>

              <SummaryRow
                label="GST Amount"
                value={formatCurrency(
                  gstAmount
                )}
              />

              <div className="flex justify-between border-t border-slate-200 pt-4 text-lg">
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
        </div>
      </section>

      {/* =================================================
          ACTIONS
      ================================================= */}

      <div className="flex flex-wrap justify-end gap-3 pb-8">
        {isEditing && (
          <button
            type="button"
            onClick={() =>
              router.push(
                `/documents/${document!.id}/preview`
              )
            }
            disabled={
              loading
            }
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={
            loading
          }
          onClick={() =>
            setSubmitMode(
              "draft"
            )
          }
          className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {loading &&
          submitMode ===
            "draft"
            ? "Saving Draft..."
            : "Save Draft"}
        </button>

        <button
          type="submit"
          disabled={
            loading
          }
          onClick={() =>
            setSubmitMode(
              "preview"
            )
          }
          className="rounded-lg bg-slate-950 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading &&
          submitMode ===
            "preview"
            ? "Saving..."
            : isEditing
              ? "Save & Preview"
              : "Generate Preview"}
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   DOCUMENT TYPE BUTTON
========================================================= */

function DocumentTypeButton({
  active,

  onClick,

  children,
}: {
  active: boolean;

  onClick:
    () => void;

  children:
    React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-slate-950 text-white"
          : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

/* =========================================================
   LABEL
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

/* =========================================================
   INPUT
========================================================= */

function InputField({
  label,

  value,

  onChange,

  required = false,

  placeholder,
}: {
  label: string;

  value: string;

  onChange:
    (value: string) =>
      void;

  required?: boolean;

  placeholder?:
    string;
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
        placeholder={
          placeholder
        }
        onChange={(
          event
        ) =>
          onChange(
            event
              .target
              .value
          )
        }
        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
      />
    </div>
  );
}

/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({
  label,

  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}