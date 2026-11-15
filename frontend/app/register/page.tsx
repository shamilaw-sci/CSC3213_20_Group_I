import RegisterPage from "@/components/Register";

export default async function RegisterRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const requireAccount = params.requireAccount === "merchant";
  return <RegisterPage requireAccount={requireAccount} />;
}
