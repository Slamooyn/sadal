"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

function SessionGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const cleanedUp = useRef(false);

  useEffect(() => {
    if (status === "loading" || cleanedUp.current) return;

    if (status === "unauthenticated") {
      cleanedUp.current = true;

      localStorage.removeItem("fashai_onboarding_completed");
      localStorage.removeItem("fashai_is_new_user");
      localStorage.removeItem("fashai_needs_onboarding");
      localStorage.removeItem("fashai_signup_email");

      fetch("/api/auth/cleanup", { method: "POST" })
        .then(() => {
          if (document.cookie.includes("authjs.session-token") || 
              document.cookie.includes("fashai_token")) {
            window.location.reload();
          }
        })
        .catch(() => {});
    }
  }, [status]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionGuard>{children}</SessionGuard>
    </SessionProvider>
  );
}
