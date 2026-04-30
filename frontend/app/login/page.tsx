"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  return (
    <div className="min-h-screen w-full flex">
      <div className="hidden md:block md:w-1/2 relative overflow-hidden">
        <Image
          src="/login_page_components/background_image.svg"
          alt="Wardrobe background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
      <div
        className="w-full md:w-1/2 relative flex flex-col items-center justify-end pb-20 px-8 md:px-16 min-h-screen"
        style={{ backgroundColor: "#3D4FE0" }}
      >
        <div className="absolute inset-0 md:hidden overflow-hidden">
          <Image
            src="/login_page_components/background_image.svg"
            alt="Wardrobe background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="absolute top-0 right-0 w-72 h-72 md:w-96 md:h-96 pointer-events-none select-none">
          <Image
            src="/login_page_components/fashai_logo.svg"
            alt="Fashai decorative logo"
            fill
            className="object-contain object-top"
            priority
          />
        </div>
        <div className="relative z-10 w-full max-w-sm mb-12">
          <h1
            className="text-white font-bold leading-none tracking-tight"
            style={{ fontSize: "clamp(2.5rem, 6vw, 3.5rem)", fontFamily: "'Georgia', serif" }}
          >
            Fashai
          </h1>
          <p className="text-white/80 text-sm mt-1 tracking-widest uppercase font-light">
            your daily wardrobe
          </p>
        </div>
        <div className="relative z-10 w-full max-w-sm flex flex-col gap-4">
          <Link
            href="/register"
            className="w-full bg-white text-gray-900 font-semibold text-base py-4 px-6 rounded-2xl text-center
              transition-all duration-200 hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            Create an account
          </Link>
          <p className="text-white/80 text-sm text-center">
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