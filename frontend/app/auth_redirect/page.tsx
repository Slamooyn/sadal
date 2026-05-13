"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check if this is a brand new user (just created, no onboarding yet)
        const hasCompletedOnboarding = localStorage.getItem("fashai_onboarding_completed");
        
        if (hasCompletedOnboarding) {
          router.replace("/dashboard");
        } else {
          // New user — show welcome animation → onboarding → dashboard
          localStorage.setItem("fashai_is_new_user", "true");
          router.replace("/welcome_animation");
        }
      } else {
        router.replace("/welcome_page");
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="h-screen w-full bg-[#3D4FE0] flex flex-col items-center justify-center gap-4">
      <div className="animate-spin h-10 w-10 border-4 border-white/30 border-t-white rounded-full" />
      <p className="text-white/80 text-sm animate-pulse">Setting up your account...</p>
    </div>
  );
}
