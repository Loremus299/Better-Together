import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Layout() {
  const header = await headers();
  const session = await auth.api.getSession({ headers: header });

  if (!session?.user) {
    redirect("/auth/login");
  }
}
