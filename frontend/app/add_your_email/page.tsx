"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AddYourEmailPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1 = email, 2 = email + password

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const rules = {
    length: password.length >= 8,
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(rules).filter(Boolean).length;
  const barColor =
    score === 1 ? "bg-red-500" :
      score === 2 ? "bg-yellow-400" :
        score === 3 ? "bg-green-600" : "bg-gray-300";

  const handleContinueEmail = () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSignUp = async () => {
    if (score < 3) {
      setError("Please meet all password requirements");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      // Use Supabase's built-in signUp — this handles:
      // 1. Creating the user in auth.users
      // 2. Sending confirmation email automatically (if enabled in dashboard)
      // 3. Identity linking if user already exists via OAuth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        // Handle specific error cases
        if (signUpError.message.includes("already registered")) {
          setError(
            "This email is already registered. Try logging in instead, or use Google sign-in if you registered with Google."
          );
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      // Store email for reference
      localStorage.setItem("fashai_signup_email", email);

      // Check if email confirmation is required
      // If user.identities is empty, it means the user already exists (e.g., via OAuth)
      // and Supabase returned a "fake" success without actually creating a new user
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError(
          "This email is already registered. Try logging in instead."
        );
        setLoading(false);
        return;
      }

      // If confirm email is enabled, Supabase sends a confirmation email
      // Redirect to the "check your email" page
      if (data.user && !data.session) {
        // No session = email confirmation required
        router.push(`/verify_email?email=${encodeURIComponent(email)}`);
      } else if (data.session) {
        // Session exists = auto-confirmed (confirm email disabled in dashboard)
        localStorage.setItem("fashai_is_new_user", "true");
        router.push("/welcome_animation");
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
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
          <Link href="/register" className="text-black/80 hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" />
            </svg>
          </Link>
          <h2
            className="text-black font-semibold"
            style={{ fontSize: "clamp(1rem, 1.8vw, 1.4rem)" }}
          >
            {step === 1 ? "Add your email" : "Create your password"}
          </h2>
          <span
            className="text-black/50 font-light ml-1"
            style={{ fontSize: "clamp(0.85rem, 1.4vw, 1.1rem)" }}
          >
            {step} / 2
          </span>
        </div>
        <div
          className="relative z-10 w-full flex flex-col gap-4"
          style={{
            maxWidth: "90%",
            transform: mounted ? "translateY(0)" : "translateY(40px)",
            opacity: mounted ? 1 : 0,
            transition: "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.7s ease",
            transitionDelay: "0.65s",
          }}
        >
          <div className="flex gap-2 mb-2">
            <div className="h-1 w-8 rounded-full bg-white" />
            <div className={`h-1 w-8 rounded-full ${step >= 2 ? "bg-white" : "bg-white/30"}`} />
          </div>

          {step === 1 && (
            <>
              <label
                className="text-white/80 text-sm font-medium"
                style={{ fontSize: "clamp(0.75rem, 1vw, 0.95rem)" }}
              >
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                placeholder="example@example.com"
                className={`w-full bg-white text-gray-900 rounded-2xl outline-none
                  placeholder:text-gray-400
                  focus:ring-2 focus:ring-white/50 transition-all
                  ${error ? "ring-2 ring-red-400" : ""}`}
                style={{
                  fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
                  padding: "clamp(0.875rem, 1.8vh, 1.25rem) 1.5rem",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleContinueEmail()}
              />

              {error && (
                <p className="text-red-300 text-sm -mt-2">{error}</p>
              )}

              <button
                onClick={handleContinueEmail}
                className="w-full bg-[#CFB0F0] hover:bg-[#2B0058] active:scale-[0.98]
                  text-white font-semibold text-center rounded-2xl
                  transition-all duration-200 shadow-lg mt-1"
                style={{
                  fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
                  padding: "clamp(0.875rem, 1.8vh, 1.25rem) 1.5rem",
                }}
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              {/* Show selected email */}
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3">
                <span className="text-white/60 text-sm">Email:</span>
                <span className="text-white font-medium text-sm">{email}</span>
                <button
                  onClick={() => { setStep(1); setError(""); }}
                  className="ml-auto text-white/50 hover:text-white text-xs underline"
                >
                  Change
                </button>
              </div>

              <label className="text-white/80 text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Create a strong password"
                  className="w-full rounded-2xl px-5 py-4 bg-white text-gray-900 outline-none
                    focus:ring-2 focus:ring-white/50 transition-all pr-12"
                  onKeyDown={(e) => e.key === "Enter" && score === 3 && handleSignUp()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Strength bar */}
              <div className="w-full h-2 rounded-full bg-gray-300">
                <div
                  className={`h-2 rounded-full transition-all ${barColor}`}
                  style={{ width: `${(score / 3) * 100}%` }}
                />
              </div>

              {/* Rules */}
              <div className="space-y-1.5 text-sm">
                <Rule ok={rules.length} label="8 characters minimum" />
                <Rule ok={rules.number} label="a number" />
                <Rule ok={rules.symbol} label="one symbol minimum" />
              </div>

              {error && (
                <p className="text-red-300 text-sm">{error}</p>
              )}

              <button
                disabled={score < 3 || loading}
                onClick={handleSignUp}
                className={`w-full py-4 hover:bg-[#2B0058] rounded-2xl text-white font-semibold transition
                  disabled:cursor-not-allowed
                  ${score === 3 ? "bg-purple-700" : "bg-purple-300"}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : "Create account"}
              </button>
            </>
          )}

          <p
            className="text-white/60 text-center"
            style={{ fontSize: "clamp(0.75rem, 1vw, 0.875rem)" }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-white font-bold hover:underline underline-offset-2 transition-colors"
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

function Rule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? (
        <span className="text-green-400">✔</span>
      ) : (
        <span className="text-black/40">○</span>
      )}
      <span className={ok ? "text-black" : "text-black/60"}>
        {label}
      </span>
    </div>
  );
}