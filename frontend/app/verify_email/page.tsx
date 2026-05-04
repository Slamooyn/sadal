"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function VerifyYourEmailPage() {
    const [mounted, setMounted] = useState(false);
    const [email, setEmail] = useState("");

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(t);
    }, []);

    const [code, setCode] = useState<string[]>(["", "", "", "", ""]);
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (value: string, index: number) => {
        if (!/^\d?$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 4) {
            inputs.current[index + 1]?.focus();
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

                        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">

                            <p className="text-black -mt-140 text-lg mb-6">
                                We just sent 5-digit code to <br />
                                <span className="font-semibold">sarah.jansen@gmail.com</span>, enter it bellow:
                            </p>

                            <div className="w-full max-w-md text-left">
                                <p className="text-black mb-2">Code</p>

                                <div className="flex justify-between gap-2 mb-6">
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
                                            className="w-14 h-14 text-center text-xl text-black rounded-xl bg-white outline-none border border-gray-300"
                                        />
                                    ))}
                                </div>

                                <Link href="create_password">
                                    <button className="w-full bg-[#CFB0F0] hover:bg-[#2B0058] text-white font-semibold py-4 rounded-2xl transition">
                                        Verify email
                                    </button>
                                </Link>
                                <p className="text-white/80 text-center mt-6">
                                    Wrong email?{" "}
                                    <span className="font-bold underline cursor-pointer">
                                        Send to different email
                                    </span>
                                </p>
                            </div>
                        </div>

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
                </div>
            </div>
        </div>
    );
}