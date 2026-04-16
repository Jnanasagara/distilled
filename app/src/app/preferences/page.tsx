import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PreferencesForm from "@/components/PreferencesForm";

export default async function PreferencesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth");
  if (session.user.role === "ADMIN") redirect("/admin");

  const userId = session.user.id;
  const [topics, userPrefs, userTopics, blockedSources] = await Promise.all([
    prisma.topic.findMany({ orderBy: { name: "asc" } }),
    prisma.userPreference.findUnique({ where: { userId } }),
    prisma.userTopic.findMany({
      where: { userId, status: { in: ["ACTIVE", "PAUSED"] } },
      select: { topicId: true, status: true },
    }),
    prisma.blockedSource.findMany({
      where: { userId },
      select: { source: true },
    }),
  ]);

  const allSelectedTopicIds = userTopics.map((ut) => ut.topicId);
  const pausedTopicIds = userTopics.filter((ut) => ut.status === "PAUSED").map((ut) => ut.topicId);
  const blockedSourceValues = blockedSources.map((b) => b.source);

  return (
    <PreferencesForm
      topics={topics}
      mode="preferences"
      userId={userId}
      initialTopicIds={allSelectedTopicIds}
      initialPausedTopicIds={pausedTopicIds}
      initialPostCount={userPrefs?.postCount ?? 20}
      initialFrequency={(userPrefs?.frequency as "DAILY" | "WEEKLY" | "MONTHLY") ?? "DAILY"}
      initialShowTrending={userPrefs?.showTrending ?? true}
      initialBlockedSources={blockedSourceValues}
    />
  );
}