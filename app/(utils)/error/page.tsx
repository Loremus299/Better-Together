export default async function ErrorPage({
  searchParams,
}: {
  searchParams: { e: string };
}) {
  const { e } = searchParams;
  return <div className="min-h-screen w-full grid place-items-center">{e}</div>;
}
