"use client";

export default function TaskDisplayClient({
  task,
  proofList,
}: {
  task: string;
  proofList: { timeStamp: string; proofStatus: string }[];
}) {
  const today = new Date();

  const isDoneToday = proofList.every((proof) => {
    const proofDate = new Date(Number(proof.timeStamp) * 1000);
    const isFromToday =
      proofDate.getFullYear() === today.getFullYear() &&
      proofDate.getMonth() === today.getMonth() &&
      proofDate.getDate() === today.getDate();

    return isFromToday && proof.proofStatus !== "pending";
  });

  if (isDoneToday) {
    return (
      <h3 className="tracking-tight font-semibold line-through text-muted-foreground">
        {task}
      </h3>
    );
  }
  return <h3 className="tracking-tight font-semibold">{task}</h3>;
}
