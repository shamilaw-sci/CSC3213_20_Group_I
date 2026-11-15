import PasswordRecoveryForm from "@/features/auth/components/PasswordRecoveryForm";

export default async function ForgotPasswordPage({ searchParams }: {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const { returnTo } = await searchParams;
  return <PasswordRecoveryForm returnTo={typeof returnTo === "string" ? returnTo : undefined} />;
}
