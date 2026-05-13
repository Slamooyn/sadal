"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

function SessionGuard({ children }: { children: React.ReactNode }) {
  const cleanedUp = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        if (cleanedUp.current) return;
        cleanedUp.current = true;

        localStorage.removeItem("fashai_onboarding_completed");
        localStorage.removeItem("fashai_is_new_user");
        localStorage.removeItem("fashai_needs_onboarding");
        localStorage.removeItem("fashai_signup_email");
        
        window.location.reload();
      } else if (event === "SIGNED_IN") {
        cleanedUp.current = false;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionGuard>{children}</SessionGuard>
  );
}
