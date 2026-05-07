"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function WelcomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

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
          flex flex-col items-start justify-end
          rounded-tl-[80px] md:rounded-tl-[120px]"
        style={{
          backgroundColor: "#3D4FE0",
          height: "calc(100% + 40px)",
          paddingBottom: "9%",
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
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div
          className="hidden md:block absolute top-0 pointer-events-none select-none opacity-90"
          style={{
            right: "-2%",
            width: "88%",
            height: "72%",
            transform: mounted ? "translateY(0)" : "translateY(-80px)",
            opacity: mounted ? 0.9 : 0,
            transition: "transform 2.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.9s ease",
            transitionDelay:"0s"
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

        <div
          className="relative z-10 w-full"
          style={{
            marginBottom: "22%",
            transform: mounted ? "translateX(0)" : "translateX(-60px)",
            opacity: mounted ? 1 : 0,
            transition: "transform 2.5s cubic-bezier(0.22, 1, 0.36, 1) 0.15s, opacity 0.7s ease 0.15s",
            transitionDelay:"0.5s"
          }}
        >
          <h1
            className="text-white font-bold leading-none tracking-tight"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.8rem)",
              fontFamily: "'Georgia', serif",
            }}
          >
            Fashai
          </h1>
          <p
            className="text-white/80 uppercase font-light tracking-widest"
            style={{
              fontSize: "clamp(0.55rem, 1vw, 0.85rem)",
              marginTop: "0.3rem",
              marginLeft: "clamp(2rem, 5vw, 8rem)",
            }}
          >
            your daily wardrobe
          </p>
        </div>
        <div
          className="relative z-10 w-full flex flex-col gap-3"
          style={{
            maxWidth: "90%",
            transform: mounted ? "translateY(0)" : "translateY(40px)",
            opacity: mounted ? 1 : 0,
            transition: "transform 2.5s cubic-bezier(0.22, 1, 0.36, 1) 0.15s, opacity 0.7s ease 0.15s",
            transitionDelay:"0.7s"
          }}
        >
          <Link
            href="/register"
            className="w-full bg-white text-gray-900 font-semibold text-center
              rounded-2xl transition-all duration-200
              hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            style={{
              fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
              padding: "clamp(0.875rem, 1.8vh, 1.25rem) 1.5rem",
            }}
          >
            Create an account
          </Link>

          <p
            className="text-white/80 text-center"
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
  );
}