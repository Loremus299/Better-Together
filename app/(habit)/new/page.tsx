import CreateHabitForm from "./page.client";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ name: string; description: string }>;
}) {
  const { name, description } = await searchParams;
  return (
    <div className="w-full min-h-screen grid place-items-center">
      <div className="w-full max-w-sm">
        <CreateHabitForm name={name ?? ""} description={description ?? ""} />
      </div>
    </div>
  );
}
