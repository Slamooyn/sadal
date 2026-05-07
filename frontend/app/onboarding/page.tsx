"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 0 | 1 | 2 | 3;

interface Answers {
  style: string;
  mood: string;
  uploadWardrobe: string;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function OptionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-[482px] h-[84px] bg-white rounded-[17px] flex items-center justify-center font-semibold text-[22px] text-[#27252e] hover:bg-gray-50 active:scale-[0.98] transition-all duration-150 shrink-0"
    >
      {label}
    </button>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<Answers>({
    style: "",
    mood: "",
    uploadWardrobe: "",
  });

  function answer(key: keyof Answers, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    setStep((s) => (s + 1) as Step);
  }

  function finish() {
    router.push("/dashboard");
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#4361ee] flex items-center justify-center">
      {/* Fashai logo watermark — positioned per Figma (node 2093:390) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        aria-hidden
        alt=""
        src="/onboarding/watermark.svg"
        className="absolute pointer-events-none select-none"
        style={{
          left: "calc(40% + 119px)",
          top: "-172px",
          width: "974px",
          height: "1160px",
        }}
      />

      {/* Step content */}
      <div className="relative z-10 flex flex-col items-center gap-[9px]">

        {/* ── Step 0: Intro ─────────────────────────────── */}
        {step === 0 && (
          <>
            <p className="text-white text-[22px] leading-[1.6] mb-1 self-start">
              We have some{" "}
              <span className="font-semibold">questions for you</span>
            </p>
            <OptionButton label="Continue ?" onClick={next} />
          </>
        )}

        {/* ── Step 1: Favorite style ────────────────────── */}
        {step === 1 && (
          <>
            <p className="text-white text-[22px] leading-[1.6] mb-1 self-start">
              What are your favorite style ?
            </p>
            <OptionButton
              label="Chilly Winter"
              onClick={() => { answer("style", "Chilly Winter"); next(); }}
            />
            <OptionButton
              label="Summer Vibe"
              onClick={() => { answer("style", "Summer Vibe"); next(); }}
            />
            <OptionButton
              label="Sporty"
              onClick={() => { answer("style", "Sporty"); next(); }}
            />
          </>
        )}

        {/* ── Step 2: Mood ──────────────────────────────── */}
        {step === 2 && (
          <>
            <p className="text-white text-[22px] leading-[1.6] mb-1 self-start">
              How do you feel today
            </p>
            <OptionButton
              label="Chill"
              onClick={() => { answer("mood", "Chill"); next(); }}
            />
            <OptionButton
              label="Energetic"
              onClick={() => { answer("mood", "Energetic"); next(); }}
            />
            <OptionButton
              label="Cold"
              onClick={() => { answer("mood", "Cold"); next(); }}
            />
          </>
        )}

        {/* ── Step 3: Upload wardrobe ───────────────────── */}
        {step === 3 && (
          <>
            <p className="text-white text-[22px] leading-[1.6] mb-1 self-start">
              Want to upload your{" "}
              <span className="font-semibold">wardrobe ?</span>
            </p>
            <OptionButton
              label="Yes"
              onClick={() => { answer("uploadWardrobe", "Yes"); finish(); }}
            />
            <OptionButton
              label="Maybe Later"
              onClick={() => { answer("uploadWardrobe", "Maybe Later"); finish(); }}
            />
          </>
        )}

      </div>
    </div>
  );
}
