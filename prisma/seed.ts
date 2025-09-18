import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create an admin user
  const admin = await prisma.users.upsert({
    where: { email: "admin@murraycreative.com" },
    update: {},
    create: {
      email: "admin@murraycreative.com",
      role: "admin",
    },
  });

  console.log("Created admin user:", admin);

  // Create a sample talent user
  const talent = await prisma.users.upsert({
    where: { email: "talent@example.com" },
    update: {},
    create: {
      email: "talent@example.com",
      role: "user",
      profile: {
        create: {
          displayName: "Jane Doe",
          bio: "Aspiring actress and model with a passion for storytelling and creative expression.",
          hobbies: ["Acting", "Photography", "Dancing", "Yoga"],
          socialLinks: {
            instagram: "https://instagram.com/janedoe",
            website: "https://janedoe.com",
          },
          isPublic: true,
        },
      },
    },
    include: {
      profile: true,
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