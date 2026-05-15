"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const urlEmail = searchParams.get("email");
    const storedEmail = localStorage.getItem("fashai_signup_email");
    setEmail(urlEmail || storedEmail || "");
  }, [searchParams]);

  useEffect(() => {
    setResendTimer(60);
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        localStorage.setItem("fashai_is_new_user", "true");
        router.push("/welcome_animation");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleResend = async () => {
    if (resendTimer > 0 || !email) return;
    setResendLoading(true);
    setResendMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setResendMessage(error.message);
      } else {
        setResendMessage("Confirmation email resent!");
        setResendTimer(60);
      }
    } catch {
      setResendMessage("Failed to resend. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden relative bg-black">
      <div className="hidden md:block absolute left-0 top-0 w-[50vw] h-full overflow-hidden">
        <Image
          src="/login_page_components/background_image.svg"
          alt="Wardrobe background"
          fill
          sizes="50vw"
          className="object-cover object-[50%_30%] scale-110 brightness-90 contrast-125 saturate-110"
          priority
        />
        <div className="absolute inset-0 bg-blue-900/40 mix-blend-color-burn" />
      </div>
      <div
        className="absolute right-0 top-0 w-full md:w-[50vw] overflow-hidden
          flex flex-col items-start justify-start pt-40
          rounded-tl-[80px] md:rounded-tl-[120px]"
        style={{
          backgroundColor: "#3D4FE0",
          height: "calc(100% + 40px)",
          paddingBottom: "9%",
          paddingLeft: "8%",
          paddingRight: "8%",
        }}
      >
        <div className="absolute inset-0 md:hidden overflow-hidden">
          <Image
            src="/login_page_components/background_image.svg"
            alt="Wardrobe background"
            fill
            className="object-cover object-[50%_30%]"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div
          className="hidden md:block absolute top-0 pointer-events-none select-none"
          style={{
            right: "-2%",
            width: "88%",
            height: "72%",
            transform: mounted ? "translateY(0)" : "translateY(-80px)",
            opacity: mounted ? 0.9 : 0,
            transition: "transform 2.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.9s ease",
            transitionDelay: "0s",
          }}
        >
          <Image
            src="/login_page_components/fashai_logo.svg"
            alt="Fashai decorative logo"
            fill
            className="object-contain object-top"
            priority
          />
        </div>
        <div className="w-full">
          <div
            className="relative z-10 w-full flex items-center gap-3 mb-8"
            style={{
              transform: mounted ? "translateX(0)" : "translateX(-60px)",
              opacity: mounted ? 1 : 0,
              transition: "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.7s ease",
              transitionDelay: "0.4s",
            }}
          >
            <Link href="/add_your_email" className="text-black/80 hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M5 12l7 7M5 12l7-7" />
              </svg>
            </Link>
            <h2
              className="text-black font-semibold"
              style={{ fontSize: "clamp(1rem, 1.8vw, 1.4rem)" }}
            >
              Check Your Email
            </h2>
          </div>
          <div
            className="relative z-10 w-full flex flex-col gap-6"
            style={{
              maxWidth: "90%",
              transform: mounted ? "translateY(0)" : "translateY(40px)",
              opacity: mounted ? 1 : 0,
              transition: "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.7s ease",
              transitionDelay: "0.65s",
            }}
          >
            {/* Email icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 4L12 13L2 4" />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <p className="text-white text-lg mb-2">
                We&apos;ve sent a confirmation link to
              </p>
              <p className="text-white font-bold text-xl">
                {email || "your email"}
              </p>
            </div>

            <div className="bg-white/10 rounded-2xl p-5 space-y-3">
              <p className="text-white/80 text-sm leading-relaxed">
                📧 Check your inbox and click the confirmation link to activate your account.
              </p>
              <p className="text-white/60 text-xs leading-relaxed">
                The link will expire in 24 hours. Check your spam folder if you don&apos;t see it.
              </p>
            </div>

            {resendMessage && (
              <p className={`text-sm text-center ${resendMessage.includes("resent") ? "text-green-300" : "text-red-300"}`}>
                {resendMessage}
              </p>
            )}

            {resendTimer > 0 ? (
              <p className="text-white/50 text-sm text-center">
                Resend email in {resendTimer}s
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="w-full bg-[#CFB0F0] hover:bg-[#2B0058] text-white font-semibold py-4 rounded-2xl transition
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {resendLoading ? "Sending..." : "Resend confirmation email"}
              </button>
            )}

            <p className="text-white/80 text-center">
              Wrong email?{" "}
              <Link
                href="/add_your_email"
                className="font-bold underline cursor-pointer hover:text-white transition-colors"
              >
                Go back
              </Link>
            </p>

            <p className="text-white/60 text-center text-sm">
              Already confirmed?{" "}
              <Link
                href="/login"
                className="font-bold underline cursor-pointer hover:text-white transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyYourEmailPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-[#3D4FE0] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-white/30 border-t-white rounded-full" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}