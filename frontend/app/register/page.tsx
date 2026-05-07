"use client";

import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function RegisterPage() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoadingProvider("google");
    await signIn("google", { callbackUrl: "/auth_redirect" });
  };
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
        className="absolute right-0 top-0 w-full md:w-[50vw] h-full flex flex-col items-center overflow-hidden"
        style={{ backgroundColor: "#3D4FE0", borderTopLeftRadius: "146px" }}
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
          className="hidden md:block absolute top-5 -right-10 w-[600px] h-[1000px] opacity-90 pointer-events-none select-none"
          style={{ zIndex: 0 }}
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
          className="relative flex flex-col w-full"
          style={{
            zIndex: 10,
            maxWidth: "601px",
            marginTop: "71px",
            gap: "0px",
          }}
        >
          <div
            className="flex items-center w-full"
            style={{
              paddingLeft: "12.82px",
              paddingRight: "76.93px",
              height: "96.16px",
            }}
          >
            <Link
              href="/"
              className="text-black hover:opacity-70 transition-opacity flex-shrink-0"
              style={{ width: "64.11px", height: "64.11px", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </Link>
            <h1
              className="flex-1 text-black text-center"
              style={{
                fontFamily: "Satoshi Variable, sans-serif",
                fontSize: "32.05px",
                fontWeight: 700,
                lineHeight: "140%",
              }}
            >
              Create new account
            </h1>
          </div>
          <div
            className="flex flex-col w-full"
            style={{
              paddingLeft: "25.64px",
              paddingRight: "25.64px",
              gap: "32.05px",
              marginTop: `${167 - 71 - 96.16}px`,
            }}
          >
            <p
              className="text-black text-center"
              style={{
                fontFamily: "Roboto, sans-serif",
                fontWeight: 400,
                fontSize: "25.64px",
                lineHeight: "160%",
                letterSpacing: "0px",
                width: "100%",
                textAlign: "center",
              }}
            >
              Begin with creating new free account. This helps you keep your learning way easier.
            </p>
            <Link
              href="/add_your_email"
              className="w-full bg-white text-gray-900 font-semibold text-base py-4 px-6 rounded-2xl text-center
              transition-all duration-200 hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              Continue with email
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/30" />
              <span className="text-white/60 text-xs">or</span>
              <div className="flex-1 h-px bg-white/30" />
            </div>

            <button className="w-full bg-white text-gray-900 font-medium text-base py-4 px-6 rounded-2xl
              flex items-center justify-center gap-3
              transition-all duration-200 hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 814 1000" fill="currentColor">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.6-155.5-127.4c-48.3-85.8-87.5-199.6-87.5-308.4 0-154.6 100.8-236.8 200.2-236.8 52.5 0 96.2 34.4 127.8 34.4 30.3 0 77.3-36.5 138.6-36.5 22.4 0 108.2 1.9 164 71.3zm-170.1-166.4c26.6-30.4 45.7-72.6 45.7-114.8 0-5.8-.6-11.6-1.3-16.8-43.3 1.9-94.4 28.8-125.3 62.5-23.7 26-46.4 68.2-46.4 111s1.9 11 1.9 12.9c2.6.6 6.5 1.3 10.4 1.3 38.9 0 87.5-25.4 115-55.1z" />
              </svg>
              Continue with Apple
            </button>

            <button className="w-full bg-white text-gray-900 font-medium text-base py-4 px-6 rounded-2xl
              flex items-center justify-center gap-3
              transition-all duration-200 hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continue with Facebook
            </button>

            <button
              onClick={handleGoogleSignIn}
              disabled={loadingProvider === "google"}
              className="w-full bg-white text-gray-900 font-medium text-base py-4 px-6 rounded-2xl
              flex items-center justify-center gap-3
              transition-all duration-200 hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] shadow-lg
              disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loadingProvider === "google" ? (
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
              {loadingProvider === "google" ? "Redirecting..." : "Continue with Google"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}