export default function MaxWContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full grid place-items-center">
      <div className="w-full max-w-7xl">{children}</div>
    </div>
  );
}
