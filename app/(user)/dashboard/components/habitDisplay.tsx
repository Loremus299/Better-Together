import { habitService } from "@/app/api/habit/service";
import ImageById from "@/components/imageById";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logger } from "@/lib/logger";
import { getSession } from "@/lib/server-util";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HabitDisplay() {
  const log = new Logger();
  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }

  const habits = await habitService.readHabitsByUser({
    user: session.user.id,
    log,
  });

  if (!habits.value.success) {
    log.print();
    redirect(`/error?e=${habits.value.error}&id=${log.getId()}`);
  }

  log.print();

  if (habits.value.data.length === 0) {
    return (
      <div className="w-full h-full grid place-items-center bg-card rounded-md">
        <div className="text-center">
          You are not member of any habit. Either{" "}
          <Link href={"/new"} className="text-muted-foreground underline">
            create one
          </Link>
          <br />
          or ask your partner to invite you.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full @container bg-card rounded-md">
      <div className="columns @max-[500px]:columns-1 @max-[800px]:columns-2 @max-[1100px]:columns-3 columns-4 gap-4 p-4 overflow-y-scroll">
        {habits.value.data.map((item) => (
          <Link href={`/${item.id}`} key={item.id} className="h-max">
            <Card className="hover:scale-105 hover:rotate-6 duration-300 transition hover:drop-shadow-2xl mb-4 break-inside-avoid">
              {item.header && <ImageById id={item.header} />}
              <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                  {item.name}
                </CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
