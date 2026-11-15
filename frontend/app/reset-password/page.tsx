import type { Metadata } from "next";
import PasswordRecoveryForm from "@/features/auth/components/PasswordRecoveryForm";

export const metadata: Metadata = {
  title: "Reset password | TryVora",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({ searchParams }: {
  searchParams: Promise<{ token?: string | string[]; returnTo?: string | string[] }>;
}) {
  const { token, returnTo } = await searchParams;
  return <PasswordRecoveryForm token={typeof token === "string" ? token : ""} returnTo={typeof returnTo === "string" ? returnTo : undefined} />;
}
