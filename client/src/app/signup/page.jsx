"use client";

import { useRouter } from "next/navigation";
import { AuthPanel } from "@/features/auth/components/AuthPanel";
import { Navbar } from "@/shared/navigation/Navbar";
import { useAuthGate } from "@/shared/hooks/useAuthGate";

export default function SignupPage() {
  const { isHydrated, updateUser } = useAuthGate({ mode: "redirect-authed" });
  const router = useRouter();

  if (!isHydrated) return null;

  return (
    <>
      <Navbar />
      <main
        className="section"
        style={{
          backgroundColor: "var(--color-primary-lightest)",
          minHeight: "calc(100vh - 72px)",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "var(--space-12)",
            paddingBottom: "var(--space-12)",
          }}
        >
          <AuthPanel
            initialTab="signup"
            allowTabSwitch={false}
            onAuthSuccess={(nextUser) => {
              if (nextUser) updateUser(nextUser);
              router.push("/dashboard");
            }}
          />
        </div>
      </main>
    </>
  );
}
