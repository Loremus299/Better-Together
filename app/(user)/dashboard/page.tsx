import { redirect } from "next/navigation";
import { HabitDisplay } from "./_components/habitDisplay";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const header = await headers();
  const session = await auth.api.getSession({ headers: header });

  if (!session?.user) {
    redirect("/auth/login");
  }
  return (
    <main>
      <HabitDisplay userId={session.user.id} />
    </main>
  );
}
