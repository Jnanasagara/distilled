import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PreferencesForm from "@/components/PreferencesForm";

export default async function PreferencesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth");

  const userId = session.user.id;
  const [topics, userPrefs, userTopics] = await Promise.all([
    prisma.topic.findMany({ orderBy: { name: "asc" } }),
    prisma.userPreference.findUnique({ where: { userId } }),
    prisma.userTopic.findMany({ where: { userId, status: "ACTIVE" }, select: { topicId: true } }),
  ]);

  return (
    <PreferencesForm
      topics={topics}
      mode="preferences"
      userId={userId}
      initialTopicIds={userTopics.map((ut) => ut.topicId)}
      initialPostCount={userPrefs?.postCount ?? 20}
      initialFrequency={(userPrefs?.frequency as "DAILY" | "WEEKLY" | "MONTHLY") ?? "DAILY"}
    />
  );
}