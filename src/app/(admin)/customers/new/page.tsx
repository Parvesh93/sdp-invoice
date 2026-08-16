import CustomerForm from "@/components/customers/customer-form";

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Add Customer
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Add a customer or firm to the customer directory.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <CustomerForm />
      </div>
    </div>
  );
}