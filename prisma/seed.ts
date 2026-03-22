import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const topics = [
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
  { slug: "politics", name: "Politics", emoji: "🏛️", description: "Government, policy, and geopolitics" },
  { slug: "gaming", name: "Gaming", emoji: "🎮", description: "Video games, esports, and game development" },
];

async function main() {
  console.log("Seeding topics...");
  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: {},
      create: topic,
    });
  }
  console.log(`✅ Seeded ${topics.length} topics`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());