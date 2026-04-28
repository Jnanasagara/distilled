import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const topics = [
  { slug: "memes", name: "Memes", emoji: "😂", description: "Trending memes and internet humor" },
  { slug: "technology", name: "Technology", emoji: "💻", description: "Software, hardware, and the tech industry" },
  { slug: "artificial-intelligence", name: "Artificial Intelligence", emoji: "🤖", description: "ML, LLMs, AI research and applications" },
  { slug: "finance", name: "Finance", emoji: "📈", description: "Markets, investing, economics, and personal finance" },
  { slug: "design", name: "Design", emoji: "🎨", description: "UI/UX, graphic design, product design" },
  { slug: "science", name: "Science", emoji: "🔬", description: "Research, discoveries, and scientific breakthroughs" },
  { slug: "culture", name: "Culture", emoji: "🌍", description: "Society, arts, trends, and human stories" },
  { slug: "startups", name: "Startups", emoji: "🚀", description: "Entrepreneurship, funding, and startup news" },
  { slug: "cybersecurity", name: "Cybersecurity", emoji: "🔐", description: "Privacy, hacking, infosec, and data breaches" },
  { slug: "web-development", name: "Web Development", emoji: "🌐", description: "Frontend, backend, frameworks, and dev tools" },
  { slug: "health", name: "Health & Wellness", emoji: "🧠", description: "Mental health, fitness, medicine, and longevity" },
  { slug: "climate", name: "Climate & Environment", emoji: "🌱", description: "Climate change, sustainability, and clean energy" },
  { slug: "crypto", name: "Crypto & Web3", emoji: "₿", description: "Bitcoin, Ethereum, DeFi, and blockchain" },
  { slug: "space", name: "Space", emoji: "🛸", description: "Astronomy, space exploration, and cosmology" },
  { slug: "geopolitics", name: "Geopolitics", emoji: "🌐", description: "International relations, foreign policy, and world events" },
  { slug: "gaming", name: "Gaming", emoji: "🎮", description: "Video games, esports, and game development" },
];

async function main() {
  // Migrate existing "politics" topic to "geopolitics" in-place (preserves all UserTopic FK references)
  const oldTopic = await prisma.topic.findUnique({ where: { slug: "politics" } });
  const newTopic = await prisma.topic.findUnique({ where: { slug: "geopolitics" } });
  if (oldTopic && !newTopic) {
    await prisma.topic.update({
      where: { slug: "politics" },
      data: { slug: "geopolitics", name: "Geopolitics", emoji: "🌐", description: "International relations, foreign policy, and world events" },
    });
    console.log("✅ Migrated topic: politics → geopolitics");
  }

  console.log("Seeding topics...");
  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: {},
      create: topic,
    });
  }
  console.log(`✅ Seeded ${topics.length} topics`);

  // Create default admin user
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@distilled.app";
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD;
  if (!adminPassword) throw new Error("ADMIN_DEFAULT_PASSWORD env var is required for seeding");

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        emailVerified: new Date(),
        role: "ADMIN",
        onboarded: true,
        mustChangePassword: true,
      },
    });
    console.log(`✅ Admin user created: ${adminEmail} (default password: ${adminPassword})`);
    console.log("⚠️  IMPORTANT: Change the admin password after first login!");
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());