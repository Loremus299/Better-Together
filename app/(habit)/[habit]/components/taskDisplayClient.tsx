"use client";

export default function TaskDisplayClient({
  task,
  proofTime,
  isPending,
}: {
  task: string;
  proofTime?: string;
  isPending: boolean;
}) {
  const date = new Date(Number(proofTime ?? "") * 1000);
  const today = new Date();

  console.log(date, today);

  const isDoneToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  if (isDoneToday && !isPending) {
    return (
      <h3 className="tracking-tight font-semibold line-through text-muted-foreground">
        {task}
      </h3>
    );
  }
  return <h3 className="tracking-tight font-semibold">{task}</h3>;
}
