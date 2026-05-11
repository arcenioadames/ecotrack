import bcrypt from "bcrypt";
import { prisma } from "../../prisma/client";

const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);

interface SeedUser {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "STAFF";
  acceptedPolicy: boolean;
}

const seedUsers: SeedUser[] = [
  {
    name: "Admin User",
    email: "admin@ecotrack.com",
    password: "AdminPass123",
    role: "ADMIN",
    acceptedPolicy: true,
  },
  {
    name: "Staff User 1",
    email: "staff1@ecotrack.com",
    password: "StaffPass123",
    role: "STAFF",
    acceptedPolicy: true,
  },
  {
    name: "Staff User 2",
    email: "staff2@ecotrack.com",
    password: "StaffPass456",
    role: "STAFF",
    acceptedPolicy: true,
  },
  {
    name: "Test User",
    email: "test@ecotrack.com",
    password: "TestPass789",
    role: "STAFF",
    acceptedPolicy: true,
  },
];

async function seed(): Promise<void> {
  try {
    console.log("🌱 Starting database seed...\n");

    // Clear existing users (optional - comment out to keep existing data)
    await prisma.userAnonymizationAudit.deleteMany({});
    await prisma.policyAcceptanceAudit.deleteMany({});
    const deletedCount = await prisma.user.deleteMany({});
    console.log(`🗑️  Deleted ${deletedCount.count} existing users\n`);

    // Insert seed users
    for (const user of seedUsers) {
      const hashedPassword = await bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS);

      const createdUser = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          passwordHash: hashedPassword,
          role: user.role,
          acceptedPolicy: user.acceptedPolicy,
          policyAcceptedAt: new Date(),
          policyVersion: "1",
          policyAcceptedIp: "127.0.0.1",
          isActive: true,
        },
      });

      await prisma.policyAcceptanceAudit.create({
        data: {
          userId: createdUser.id,
          policyVersion: "1",
          acceptedAt: new Date(),
          acceptedIp: "127.0.0.1",
          userAgent: "seed-script",
        },
      });

      console.log(`✅ Created ${user.role} user:`);
      console.log(`   Name: ${createdUser.name}`);
      console.log(`   Email: ${createdUser.email}`);
      console.log(`   Password (plain): ${user.password}`);
      console.log(`   ID: ${createdUser.id}\n`);
    }

    console.log("✨ Database seed completed successfully!\n");
    console.log("📝 Test Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    seedUsers.forEach((user) => {
      console.log(`${user.role.padEnd(6)} | ${user.email.padEnd(20)} | ${user.password}`);
    });
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
