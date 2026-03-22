import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function getMockUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}