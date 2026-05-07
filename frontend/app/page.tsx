"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (session) {
      const hasCompletedOnboarding = localStorage.getItem("fashai_onboarding_completed");
      if (hasCompletedOnboarding) {
        router.replace("/dashboard");
      } else {
        router.replace("/onboarding");
      }
    } else {
      localStorage.removeItem("fashai_onboarding_completed");
      localStorage.removeItem("fashai_is_new_user");
      localStorage.removeItem("fashai_needs_onboarding");
      localStorage.removeItem("fashai_signup_email");
      router.replace("/welcome_page");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#3D4FE0]">
      <div className="animate-spin h-10 w-10 border-4 border-white/30 border-t-white rounded-full" />
    </div>
  );
}