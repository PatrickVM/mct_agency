import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create an admin user
  const admin = await prisma.users.upsert({
    where: { email: "admin@murraycreative.com" },
    update: {},
    create: {
      id: "admin-user-id",
      email: "admin@murraycreative.com",
      role: "admin",
      updatedAt: new Date(),
    },
  });

  console.log("Created admin user:", admin);

  // Create a sample talent user
  const talent = await prisma.users.upsert({
    where: { email: "talent@example.com" },
    update: {},
    create: {
      id: "talent-user-id",
      email: "talent@example.com",
      role: "user",
      updatedAt: new Date(),
      profiles: {
        create: {
          id: "talent-profile-id",
          displayName: "Jane Doe",
          bio: "Aspiring actress and model with a passion for storytelling and creative expression.",
          hobbies: ["Acting", "Photography", "Dancing", "Yoga"],
          socialLinks: {
            instagram: "https://instagram.com/janedoe",
            website: "https://janedoe.com",
          },
          isPublic: true,
          updatedAt: new Date(),
        },
      },
    },
    include: {
      profiles: true,
    },
  });

  console.log("Created talent user:", talent);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });