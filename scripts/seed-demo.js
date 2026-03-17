const path = require("path");
const { hash } = require("bcryptjs");
const dotenv = require("dotenv");
const { PrismaPg } = require("@prisma/adapter-pg");

let prismaRuntime;
try {
  prismaRuntime = require("@prisma/client");
} catch {
  // Workspace-hoisted client wrapper bazen .prisma yolunu cozemiyor.
  prismaRuntime = require("../node_modules/.prisma/client/default");
}

const { PrismaClient, Role } = prismaRuntime;

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL ortam degiskeni zorunludur.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@unitic.dev";
const adminUsername = process.env.SEED_ADMIN_USERNAME ?? "admin";
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";

const editorEmail = process.env.SEED_EDITOR_EMAIL ?? "editor@unitic.dev";
const editorUsername = process.env.SEED_EDITOR_USERNAME ?? "editor";
const editorPassword = process.env.SEED_EDITOR_PASSWORD ?? "Editor123!";

async function upsertUser({ email, username, password, role }) {
  const passwordHash = await hash(password, 10);

  return prisma.user.upsert({
    where: { email },
    update: {
      username,
      password: passwordHash,
      role,
      isActive: true,
    },
    create: {
      email,
      username,
      password: passwordHash,
      role,
      isActive: true,
    },
  });
}

async function main() {
  await upsertUser({
    email: adminEmail,
    username: adminUsername,
    password: adminPassword,
    role: Role.ADMIN,
  });

  await upsertUser({
    email: editorEmail,
    username: editorUsername,
    password: editorPassword,
    role: Role.EDITOR,
  });

  console.log("Demo admin/editor kullanıcıları hazır.");
}

main()
  .catch((error) => {
    console.error("Seed başarısız:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
