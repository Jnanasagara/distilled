import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PreferencesForm from "@/components/PreferencesForm";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth");
  if (session.user.role === "ADMIN") redirect("/admin");

  const topics = await prisma.topic.findMany({ orderBy: { name: "asc" } });

  return (
    <PreferencesForm
      topics={topics}
      mode="onboarding"
      userId={session.user.id}
      initialPostCount={20}
      initialFrequency="DAILY"
    />
  );
}