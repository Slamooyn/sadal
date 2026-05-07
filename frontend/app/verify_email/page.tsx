"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string[]>(["", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

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
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  useEffect(() => {
    setResendTimer(60);
  }, []);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (error) setError("");

    if (value && index < 4) {
      inputs.current[index + 1]?.focus();
    }

    if (value && index === 4) {
      const fullCode = [...newCode].join("");
      if (fullCode.length === 5) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (code[index] === "" && index > 0) {
        inputs.current[index - 1]?.focus();
      } else {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 5);
    if (pastedData.length > 0) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length && i < 5; i++) {
        newCode[i] = pastedData[i];
      }
      setCode(newCode);
      const nextEmpty = newCode.findIndex((d) => d === "");
      inputs.current[nextEmpty === -1 ? 4 : nextEmpty]?.focus();

      if (pastedData.length === 5) {
        handleVerify(pastedData);
      }
    }
  };

  const [devCode, setDevCode] = useState<string | null>(null);

  const handleVerify = async (fullCode?: string) => {
    const codeStr = fullCode || code.join("");
    if (codeStr.length < 5) {
      setError("Please enter the complete 5-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/verify", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: codeStr }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        setLoading(false);
        return;
      }

      router.push("/create_password");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setCode(["", "", "", "", ""]);
    setError("");

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setResendTimer(60);
        if (data.devCode) setDevCode(data.devCode);
        inputs.current[0]?.focus();
      }
    } catch {
      setError("Failed to resend code");
    }
  };

  useEffect(() => {
    if (email) {
      fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.devCode) setDevCode(data.devCode);
        })
        .catch(() => {});
    }
  }, [email]);

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
              Verify Your Email
            </h2>
            <span
              className="text-black/50 font-light ml-1"
              style={{ fontSize: "clamp(0.85rem, 1.4vw, 1.1rem)" }}
            >
              2 / 3
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
              <div className="h-1 w-8 rounded-full bg-white" />
              <div className="h-1 w-8 rounded-full bg-white/30" />
            </div>

            <p className="text-black text-lg mb-2">
              We just sent a 5-digit code to <br />
              <span className="font-semibold">{email || "your email"}</span>, enter it below:
            </p>

            {devCode && (
              <div className="bg-yellow-400/90 text-black text-sm px-4 py-2 rounded-xl mb-2 flex items-center gap-2">
                <span>🧪</span>
                <span>Dev mode — Your code: <strong className="font-mono text-base tracking-widest">{devCode}</strong></span>
              </div>
            )}
            <div className="w-full">
              <p className="text-black mb-2">Code</p>

              <div className="flex justify-between gap-2 mb-2" onPaste={handlePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputs.current[i] = el;
                    }}
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    maxLength={1}
                    inputMode="numeric"
                    className={`w-14 h-14 text-center text-xl text-black rounded-xl bg-white outline-none border transition-all
                      ${error ? "border-red-400 ring-2 ring-red-300" : "border-gray-300 focus:border-white focus:ring-2 focus:ring-white/50"}`}
                  />
                ))}
              </div>

              {error && (
                <p className="text-red-300 text-sm mb-2">{error}</p>
              )}

              {resendTimer > 0 && (
                <p className="text-white/50 text-sm mb-4">
                  Resend code in {resendTimer}s
                </p>
              )}

              <button
                onClick={() => handleVerify()}
                disabled={loading || code.join("").length < 5}
                className="w-full bg-[#CFB0F0] hover:bg-[#2B0058] text-white font-semibold py-4 rounded-2xl transition
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : "Verify email"}
              </button>

              <p className="text-white/80 text-center mt-6">
                Wrong email?{" "}
                <Link
                  href="/add_your_email"
                  className="font-bold underline cursor-pointer hover:text-white transition-colors"
                >
                  Change email
                </Link>
              </p>

              {resendTimer === 0 && (
                <p className="text-white/80 text-center mt-2">
                  Didn&apos;t receive the code?{" "}
                  <button
                    onClick={handleResend}
                    className="font-bold underline cursor-pointer hover:text-white transition-colors"
                  >
                    Resend code
                  </button>
                </p>
              )}
            </div>
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