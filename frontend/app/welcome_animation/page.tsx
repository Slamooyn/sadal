"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WelcomeAnimationPage() {
  const router = useRouter();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 4000),
      setTimeout(() => {
        router.replace("/onboarding");
      }, 5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [router]);

  return (
    <div
      className="h-screen w-full overflow-hidden relative bg-black"
      style={{
        opacity: phase >= 4 ? 0 : 1,
        transition: "opacity 1s ease-out",
      }}
    >
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
          flex flex-col items-start justify-center
          rounded-tl-[80px] md:rounded-tl-[120px]"
        style={{
          backgroundColor: "#3D4FE0",
          height: "calc(100% + 40px)",
          paddingLeft: "8%",
          paddingRight: "5%",
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
          <div className="absolute inset-0 bg-[#3D4FE0]/80" />
        </div>

        <div
          className="absolute top-0 pointer-events-none select-none"
          style={{
            right: "-2%",
            width: "88%",
            height: "72%",
            transform: phase >= 1 ? "translateY(0) scale(1)" : "translateY(-80px) scale(0.95)",
            opacity: phase >= 1 ? 0.9 : 0,
            transition: "all 2s cubic-bezier(0.22, 1, 0.36, 1)",
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

        <div className="relative z-10 w-full" style={{ marginTop: "10%" }}>
          <h1
            className="text-white font-bold leading-tight tracking-tight"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontFamily: "'Georgia', serif",
              transform: phase >= 2 ? "translateX(0)" : "translateX(-60px)",
              opacity: phase >= 2 ? 1 : 0,
              transition: "all 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            Welcome
          </h1>
          <p
            className="text-white/80 font-light tracking-wide"
            style={{
              fontSize: "clamp(0.9rem, 1.5vw, 1.2rem)",
              marginTop: "0.5rem",
              transform: phase >= 3 ? "translateX(0)" : "translateX(-40px)",
              opacity: phase >= 3 ? 1 : 0,
              transition: "all 1s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            to your daily wardrobe
          </p>
        </div>

        <div
          className="relative z-10 mt-12 flex gap-2"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transition: "opacity 0.5s ease 0.3s",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-white/50 rounded-full"
              style={{
                animation: "welcomeBounce 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes welcomeBounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
      `}} />
    </div>
  );
}
