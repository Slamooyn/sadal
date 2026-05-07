"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreatePasswordPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleContinue = async () => {
    if (score < 3) return;
    setLoading(true);

    const email = localStorage.getItem("fashai_signup_email") || "";

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        alert(data.error || "Registration failed");
        return;
      }

      localStorage.setItem("fashai_is_new_user", "true");
      router.push("/welcome_animation");
    } catch {
      setLoading(false);
      alert("Network error. Please try again.");
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
            <Link href="/verify_email" className="text-black/80 hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M5 12l7 7M5 12l7-7" />
              </svg>
            </Link>
            <h2
              className="text-black font-semibold"
              style={{ fontSize: "clamp(1rem, 1.8vw, 1.4rem)" }}
            >
              Create your password
            </h2>
            <span
              className="text-black/50 font-light ml-1"
              style={{ fontSize: "clamp(0.85rem, 1.4vw, 1.1rem)" }}
            >
              3 / 3
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
              <div className="h-1 w-8 rounded-full bg-white" />
            </div>
            <div className="space-y-4">
              <label className="text-white/80 text-sm">Password</label>

              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full rounded-2xl px-5 py-4 bg-white text-gray-900 outline-none
                    focus:ring-2 focus:ring-white/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {show ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-300">
                <div
                  className={`h-2 rounded-full transition-all ${barColor}`}
                  style={{ width: `${(score / 3) * 100}%` }}
                />
              </div>

              <div className="space-y-2 text-sm">
                <Rule ok={rules.length} label="8 characters minimum" />
                <Rule ok={rules.number} label="a number" />
                <Rule ok={rules.symbol} label="one symbol minimum" />
              </div>

              <button
                disabled={score < 3 || loading}
                onClick={handleContinue}
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
                ) : "Continue"}
              </button>
            </div>
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