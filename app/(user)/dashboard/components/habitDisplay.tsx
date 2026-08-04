import { habitService } from "@/app/api/habit/service";
import ImageById from "@/components/imageById";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db";
import { userId } from "@/lib/server-util";
import { IconCrownFilled } from "@tabler/icons-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HabitDisplay() {
  const id = await userId();
  if (!id.success) {
    redirect("/auth/login");
  }

  const habits = await habitService.readAllHabitsByUser({
    userId: id.data,
    tx: db,
  });

  if (!habits.success) {
    redirect(`/error?e=${habits.error}`);
  }

  if (habits.data.length === 0) {
    return (
      <div className="w-full h-full grid place-items-center">
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
    <div className="w-full h-full @container">
      <div className="columns @max-[500px]:columns-1 @max-[800px]:columns-2 @max-[1100px]:columns-3 columns-4 gap-4 p-4 overflow-y-scroll">
        {habits.data.map((item) => (
          <Link href={`/${item.id}`} key={item.id} className="h-max">
            <Card className="hover:scale-105 hover:rotate-6 duration-300 transition hover:drop-shadow-2xl mb-4 break-inside-avoid">
              <ImageById id={item.header!} css="w-full" />
              <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                  {item.admin === id.data ? (
                    <IconCrownFilled className="size-4 text-chart-3" />
                  ) : (
                    ""
                  )}
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
