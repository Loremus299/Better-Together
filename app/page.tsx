import { getSession } from "@/lib/server-util";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  session ? redirect("/auth/login") : redirect("/dashboard");
}
