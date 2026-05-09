import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import SavedClient from "@/components/SavedClient";

export default async function SavedPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth");
  if (session.user.role === "ADMIN") redirect("/admin");
  return <SavedClient />;
}