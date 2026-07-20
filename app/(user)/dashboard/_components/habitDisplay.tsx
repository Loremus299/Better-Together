import { habitService } from "@/app/api/habit/service";
import Loader from "@/components/loader";
import { redirect } from "next/navigation";

export async function HabitDisplay() {
  const [habits] = await Promise.all([habitService.getHabits()]);
  if (!habits.success) {
    redirect(`/error?e=${encodeURIComponent(habits.error)}`);
  }

  if (habits.data.length == 0) {
    return (
      <Loader>
        <div>
          You are not part of any habits. Ask your partners to invite you. Or
          create one.
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
