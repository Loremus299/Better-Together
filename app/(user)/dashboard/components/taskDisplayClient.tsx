"use client";

export default function TaskDisplayClient({
  name,
  description,
  proofList,
  user,
}: {
  name: string;
  description: string;
  proofList: { timeStamp: string; proofStatus: string; user: string }[];
  user: string;
}) {
  const today = new Date();

  const isDoneToday = proofList.some((proof) => {
    const proofDate = new Date(Number(proof.timeStamp) * 1000);
    const rightUser = proof.user === user;
    const isFromToday =
      proofDate.getFullYear() === today.getFullYear() &&
      proofDate.getMonth() === today.getMonth() &&
      proofDate.getDate() === today.getDate();

    return (
      isFromToday &&
      ["accepted", "declined", "pending"].includes(proof.proofStatus) &&
      rightUser
    );
  });

  if (!isDoneToday) {
    return (
      <div className="tracking-tight">
        <h3 className="font-semibold">{name}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    );
  }
  return <div />;
}
