import { userId } from "@/lib/server-util";
import CreateHabitForm from "./page.client";
import { redirect } from "next/navigation";

export default async function Page() {
  const id = await userId();

  if (!id.success) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="w-full max-w-sm">
        <CreateHabitForm admin={id.data} />
      </div>
    </div>
  );
}
