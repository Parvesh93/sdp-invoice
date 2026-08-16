import {
  notFound,
} from "next/navigation";

import { prisma } from "@/lib/prisma";

import CustomerForm from "@/components/customers/customer-form";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCustomerPage({
  params,
}: Props) {
  const { id } =
    await params;

  const customerId =
    Number(id);

  if (
    !Number.isInteger(
      customerId
    )
  ) {
    notFound();
  }

  const customer =
    await prisma.customer.findUnique({
      where: {
        id:
          customerId,
      },
    });

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Edit Customer
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update customer information.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <CustomerForm
          customer={{
            id:
              customer.id,

            nameFirmName:
              customer.nameFirmName,

            email:
              customer.email,

            phone:
              customer.phone,

            whatsapp:
              customer.whatsapp,

            gstNumber:
              customer.gstNumber,

            city:
              customer.city,

            state:
              customer.state,

            addressLine1:
              customer.addressLine1,

            addressLine2:
              customer.addressLine2,

            addressLine3:
              customer.addressLine3,
          }}
        />
      </div>
    </div>
  );
}