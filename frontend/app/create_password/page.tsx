"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreatePasswordPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/add_your_email");
  }, [router]);

  return (
    <div className="h-screen w-full bg-[#3D4FE0] flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-white/30 border-t-white rounded-full" />
    </div>
  );
}