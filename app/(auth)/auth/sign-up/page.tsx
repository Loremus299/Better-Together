import RegisterForm from "./page.client";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ email: string; name: string; password: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="w-full min-h-screen grid place-items-center">
      <div className="w-full max-w-sm">
        <RegisterForm name={sp.name} email={sp.email} password={sp.password} />
      </div>
    </div>
  );
}
