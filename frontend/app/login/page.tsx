"use client";

import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    await signIn("google", { callbackUrl: "/auth_redirect" });
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }
    setError("");
    setLoadingLogin(true);

    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoadingLogin(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setLoadingLogin(false);
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
            <Link href="/welcome_page" className="text-black/80 hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M5 12l7 7M5 12l7-7" />
              </svg>
            </Link>
            <h2
              className="text-black font-semibold"
              style={{ fontSize: "clamp(1rem, 1.8vw, 1.4rem)" }}
            >
              Log in
            </h2>
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
            <div className="flex flex-col gap-1">
              <label
                className="text-white/80 text-sm font-medium"
                style={{ fontSize: "clamp(0.75rem, 1vw, 0.95rem)" }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@example.com"
                className="w-full bg-white text-gray-900 rounded-2xl outline-none
                  placeholder:text-gray-400
                  focus:ring-2 focus:ring-white/50 transition-all"
                style={{
                  fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
                  padding: "clamp(0.875rem, 1.8vh, 1.25rem) 1.5rem",
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                className="text-white/80 text-sm font-medium"
                style={{ fontSize: "clamp(0.75rem, 1vw, 0.95rem)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white text-gray-900 rounded-2xl outline-none
                    placeholder:text-gray-400
                    focus:ring-2 focus:ring-white/50 transition-all"
                  style={{
                    fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
                    padding: "clamp(0.875rem, 1.8vh, 1.25rem) 1.5rem",
                    paddingRight: "3.5rem",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-300 text-sm -mt-1">{error}</p>
            )}

            <button
              onClick={handleLogin}
              disabled={loadingLogin}
              className="w-full bg-[#CFB0F0] hover:bg-[#2B0058] active:scale-[0.98]
                text-white font-semibold text-center rounded-2xl
                transition-all duration-200 shadow-lg mt-1
                disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
                padding: "clamp(0.875rem, 1.8vh, 1.25rem) 1.5rem",
              }}
            >
              {loadingLogin ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : "Log in"}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/30" />
              <span className="text-white/60 text-xs">or</span>
              <div className="flex-1 h-px bg-white/30" />
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loadingGoogle}
              className="w-full bg-white text-gray-900 font-medium rounded-2xl
                flex items-center justify-center gap-3
                transition-all duration-200 hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] shadow-lg
                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
                padding: "clamp(0.875rem, 1.8vh, 1.25rem) 1.5rem",
              }}
            >
              {loadingGoogle ? (
                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
                  <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z"/>
                  <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21z"/>
                  <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067z"/>
                </svg>
              )}
              {loadingGoogle ? "Redirecting..." : "Continue with Google"}
            </button>

            <p
              className="text-white/60 text-center"
              style={{ fontSize: "clamp(0.75rem, 1vw, 0.875rem)" }}
            >
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-white font-bold hover:underline underline-offset-2 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}