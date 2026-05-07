"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AuthRedirectPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated") {
      const hasCompletedOnboarding = localStorage.getItem("fashai_onboarding_completed");
      if (hasCompletedOnboarding) {
        router.replace("/dashboard");
      } else {
        router.replace("/welcome_animation");
      }
    } else {
      router.replace("/welcome_page");
    }
  }, [status, router]);

  return (
    <div className="h-screen w-full bg-[#3D4FE0] flex flex-col items-center justify-center gap-4">
      <div className="animate-spin h-10 w-10 border-4 border-white/30 border-t-white rounded-full" />
      <p className="text-white/80 text-sm animate-pulse">Setting up your account...</p>
    </div>
  );
}
