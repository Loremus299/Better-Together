import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ e: string; id: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="min-h-screen grid place-items-center w-screen">
      <main className="max-w-sm text-center">
        <h1 className="font-bold text-7xl tracking-tight">!!ERROR!!</h1>
        <h4 className="tracking-tight font-semibold">｡°(°.◜ᯅ◝°)°｡</h4>
        <div className="w-full h-0.5 border border-muted-foreground border-dashed mt-2 mb-2" />
        <p>{sp.e}</p>
        <p>Request Id: {sp.id}</p>
        <div className="w-full h-0.5 border border-muted-foreground border-dashed  mt-2 mb-2" />
        <p>
          Send the request id{" "}
          <Link
            href={"https://git.loremus.gay/Loremus/Better-Together/issues"}
            className="text-accent"
          >
            here
          </Link>{" "}
          so I can diagnose and fix it ദ്ദി(｡•ᴗ• )
        </p>
      </main>
    </div>
  );
}
