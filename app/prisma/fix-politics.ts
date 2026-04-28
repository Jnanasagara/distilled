import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const oldTopic = await prisma.topic.findUnique({ where: { slug: "politics" } });
  const newTopic = await prisma.topic.findUnique({ where: { slug: "geopolitics" } });

  console.log("politics:", oldTopic?.name ?? "not found");
  console.log("geopolitics:", newTopic?.name ?? "not found");

  if (oldTopic && !newTopic) {
    await prisma.topic.update({
      where: { slug: "politics" },
      data: { slug: "geopolitics", name: "Geopolitics", emoji: "🌐", description: "International relations, foreign policy, and world events" },
    });
    console.log("✅ Renamed politics → geopolitics");
  } else if (oldTopic && newTopic) {
    await prisma.userTopic.updateMany({ where: { topicId: oldTopic.id }, data: { topicId: newTopic.id } });
    await prisma.content.updateMany({ where: { topicId: oldTopic.id }, data: { topicId: newTopic.id } });
    await prisma.topic.delete({ where: { id: oldTopic.id } });
    console.log("✅ Merged politics → geopolitics");
  } else if (!oldTopic && !newTopic) {
    await prisma.topic.create({
      data: { slug: "geopolitics", name: "Geopolitics", emoji: "🌐", description: "International relations, foreign policy, and world events" },
    });
    console.log("✅ Created geopolitics topic");
  } else {
    await prisma.topic.update({
      where: { slug: "geopolitics" },
      data: { name: "Geopolitics", emoji: "🌐", description: "International relations, foreign policy, and world events" },
    });
    console.log("✅ Updated geopolitics name");
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
