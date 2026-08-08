import { userId } from "@/lib/server-util";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const id = await userId();
  if (!id.success) {
    redirect("/auth/login");
  }

  return children;
}
