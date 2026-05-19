import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import LandingClient from "@/components/LandingClient";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/feed");

  return <LandingClient />;
}
