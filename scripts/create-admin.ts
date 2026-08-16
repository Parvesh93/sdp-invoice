import bcrypt from "bcryptjs";

import { prisma } from "../src/lib/prisma";

async function main() {
  const email = "admin@sdp.local";
  const password = "Admin@123";

  const hashedPassword = await bcrypt.hash(
    password,
    12
  );

  const admin = await prisma.user.upsert({
    where: {
      email,
    },

    update: {
      name: "SDP Admin",
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
    },

    create: {
      name: "SDP Admin",
      email,
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("Admin user ready:");
  console.log({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  });
}

main()
  .catch((error) => {
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });