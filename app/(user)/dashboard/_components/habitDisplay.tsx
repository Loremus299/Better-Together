import { habitService } from "@/app/api/habit/service";
import Loader from "@/components/loader";
import Link from "next/link";
import { redirect } from "next/navigation";

export async function HabitDisplay({ userId }: { userId: string }) {
  const [habits] = await Promise.all([habitService.getHabits({ userId })]);
  if (!habits.success) {
    redirect(`/error?e=${encodeURIComponent(habits.error)}`);
  }

  if (habits.data.length == 0) {
    return (
      <Loader>
        <div className="text-center">
          You are not part of any habits. <br />
          Ask your partner to invite you. Or{" "}
          <Link
            href="/new"
            className="underline hover:text-primary duration-150"
          >
            create one
          </Link>
        </div>
      </Loader>
    );
  }
  return (
    <Loader>
      <div className="grid">
        {habits.data.map((habit) => (
          <div key={habit.id}>
            <h1>{habit.name}</h1>
            <p>{habit.description}</p>
          </div>
        ))}
      </div>
    </Loader>
  );
}
