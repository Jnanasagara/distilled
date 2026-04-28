import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const oldTopic = await prisma.topic.findUnique({ where: { slug: "politics" } });
  const newTopic = await prisma.topic.findUnique({ where: { slug: "geopolitics" } });

  console.log("politics topic:", oldTopic?.id ?? "not found");
  console.log("geopolitics topic:", newTopic?.id ?? "not found");

  if (oldTopic && newTopic) {
    const userTopics = await prisma.userTopic.updateMany({ where: { topicId: oldTopic.id }, data: { topicId: newTopic.id } });
    const content = await prisma.content.updateMany({ where: { topicId: oldTopic.id }, data: { topicId: newTopic.id } });
    await prisma.topic.delete({ where: { id: oldTopic.id } });
    console.log(`✅ Moved ${userTopics.count} user topics, ${content.count} articles → geopolitics`);
    console.log("✅ Deleted old politics topic");
  } else if (oldTopic && !newTopic) {
    await prisma.topic.update({
      where: { slug: "politics" },
      data: { slug: "geopolitics", name: "Geopolitics", emoji: "🌐", description: "International relations, foreign policy, and world events" },
    });
    console.log("✅ Renamed politics → geopolitics");
  } else {
    console.log("ℹ️  Nothing to do — politics topic not found");
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
