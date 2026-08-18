"use client";

export default function TaskDisplayClient({
  task,
  proofTime,
}: {
  task: string;
  proofTime: string;
}) {
  const date = new Date(proofTime);
  const today = new Date();

  const isDoneToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  if (isDoneToday) {
    return (
      <h3 className="tracking-tight font-semibold line-through text-muted-foreground">
        {task}
      </h3>
    );
  }
  return <h3 className="tracking-tight font-semibold">{task}</h3>;
}
