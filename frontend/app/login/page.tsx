"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
export default function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  return (
    <div className="min-h-screen w-full overflow-hidden relative bg-black">
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
        className="absolute right-0 top-0 w-full md:w-[50vw] h-full 
        flex flex-col items-center justify-end 
        pb-20 px-8 md:px-16 
        rounded-tl-[120px] md:rounded-tl-[200px] 
        -mt-10 overflow-hidden"
        style={{ backgroundColor: "#3D4FE0" }}
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
        <div className="hidden md:block absolute top-5 -right-10 w-[600px] h-[1000px]opacity-90 pointer-events-none select-none">
          <Image
            src="/login_page_components/fashai_logo.svg"
            alt="Fashai decorative logo"
            fill
            className="object-contain object-top"
            priority
          />
        </div>
        <div className="relative z-10 w-full max-w-sm mb-10 md:mb-25 md:ml-30">
          <h1
            className="text-white font-bold leading-none tracking-tight w-[230px] h-[115px] flex items-end"
            style={{
              fontSize: "3.2rem",
              fontFamily: "'Georgia', serif",
            }}
          >
            Fashai
          </h1>
          <p className="text-white/80 text-sm mt-1 tracking-widest uppercase font-light ml-3 md:ml-14">
            your daily wardrobe
          </p>
        </div>
        <div className="relative z-10 w-full max-w-sm flex flex-col gap-4 mt-2 md:mb-40">
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