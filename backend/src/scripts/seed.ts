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

type SeedCategory = {
  name: string;
  description?: string;
};

const seedCategories: SeedCategory[] = [
  { name: "Productos refrigerados", description: "Refrigerados (cadena fría)" },
  { name: "Productos secos", description: "Despensa / secos" },
  { name: "Lácteos", description: "Lácteos y similares" },
  { name: "Carnes", description: "Carnes y embutidos" },
  { name: "Bebidas", description: "Bebidas (no alcohólicas)" },
];

type SeedProduct = {
  name: string;
  barcode: string;
  categoryName: string;
  // días desde hoy. Negativo => ya vencido, 0.. => por vencer pronto
  expirationOffsetDays: number;
};

const seedProducts: SeedProduct[] = [
  // Refrigerados
  { name: "Yogur natural", barcode: "RXG-0001", categoryName: "Lácteos", expirationOffsetDays: -5 },
  { name: "Leche entera", barcode: "RXG-0002", categoryName: "Lácteos", expirationOffsetDays: 7 },
  { name: "Queso fresco", barcode: "RXG-0003", categoryName: "Lácteos", expirationOffsetDays: 2 },
  { name: "Carne molida", barcode: "CRN-0101", categoryName: "Carnes", expirationOffsetDays: -1 },
  { name: "Pechuga de pollo", barcode: "CRN-0102", categoryName: "Carnes", expirationOffsetDays: 10 },
  { name: "Jamón cocido", barcode: "CRN-0103", categoryName: "Carnes", expirationOffsetDays: 4 },
  { name: "Vegetales mixtos", barcode: "RFR-0201", categoryName: "Productos refrigerados", expirationOffsetDays: 3 },
  { name: "Crema de verduras", barcode: "RFR-0202", categoryName: "Productos refrigerados", expirationOffsetDays: 15 },

  // Secos
  { name: "Arroz basmati", barcode: "SKK-0301", categoryName: "Productos secos", expirationOffsetDays: 30 },
  { name: "Pasta corta", barcode: "SKK-0302", categoryName: "Productos secos", expirationOffsetDays: 60 },
  { name: "Lentejas", barcode: "SKK-0303", categoryName: "Productos secos", expirationOffsetDays: 25 },

  // Bebidas
  { name: "Agua mineral 600ml", barcode: "BEB-0401", categoryName: "Bebidas", expirationOffsetDays: 45 },
  { name: "Jugo natural 1L", barcode: "BEB-0402", categoryName: "Bebidas", expirationOffsetDays: 6 },
  { name: "Refresco sin azúcar", barcode: "BEB-0403", categoryName: "Bebidas", expirationOffsetDays: -2 },
];

function addDaysUTC(d: Date, days: number): Date {
  const base = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return new Date(base + days * 24 * 60 * 60 * 1000);
}

async function seed(): Promise<void> {
  try {
    console.warn("🌱 Starting database seed...\n");

    // Limpiar tablas relacionadas (respetando FKs)
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});

    // FK: RefreshToken.userId -> User.id
    await prisma.refreshToken.deleteMany({});

    // FK: UserAnonymizationAudit.targetUserId/actorUserId -> User.id
    await prisma.userAnonymizationAudit.deleteMany({});

    // FK: PolicyAcceptanceAudit.userId -> User.id
    await prisma.policyAcceptanceAudit.deleteMany({});

    const deletedUsers = await prisma.user.deleteMany({});
    console.warn(`🗑️  Deleted ${deletedUsers.count} existing users\n`);

    // 1) Crear usuarios
    const createdUsers: Record<string, { id: string; role: SeedUser["role"] }> = {};

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

      createdUsers[user.role] = { id: createdUser.id, role: user.role };

      console.warn(`✅ Created ${user.role} user:`);
      console.warn(`   Name: ${createdUser.name}`);
      console.warn(`   Email: ${createdUser.email}`);
      console.warn(`   Password (plain): ${user.password}`);
      console.warn(`   ID: ${createdUser.id}\n`);
    }

    // 2) Categorías
    const createdCategoriesByName: Record<string, { id: string }> = {};
    for (const cat of seedCategories) {
      const created = await prisma.category.create({
        data: {
          name: cat.name,
          description: cat.description ?? null,
        },
      });
      createdCategoriesByName[cat.name] = { id: created.id };
    }

    // 3) Productos
    const createdByUserId = createdUsers["ADMIN"].id;
    const now = new Date();

    for (const p of seedProducts) {
      const categoryId = createdCategoriesByName[p.categoryName]?.id;
      if (!categoryId) {
        throw new Error(`Seed error: category not found for ${p.name} => ${p.categoryName}`);
      }

      const expirationDate = addDaysUTC(now, p.expirationOffsetDays);

      await prisma.product.create({
        data: {
          name: p.name,
          barcode: p.barcode,
          expirationDate,
          categoryId,
          createdBy: createdByUserId,
        },
      });
    }

    console.warn("✨ Database seed completed successfully!\n");

    console.warn("🧪 Demo Data Summary:");
    console.warn(`- Categories: ${seedCategories.length}`);
    console.warn(`- Products: ${seedProducts.length}`);
    console.warn(`- Admin createdBy userId: ${createdByUserId}\n`);

    console.warn("📝 Test Credentials:");
    console.warn("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    seedUsers.forEach((user) => {
      console.warn(`${user.role.padEnd(6)} | ${user.email.padEnd(20)} | ${user.password}`);
    });
    console.warn("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

