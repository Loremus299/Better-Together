import LoginForm from "./page.client";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email: string; password: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="w-full min-h-screen grid place-items-center">
      <div className="w-full max-w-sm">
        <LoginForm email={sp.email ?? ""} password={sp.password ?? ""} />
      </div>
    </div>
  );
}
