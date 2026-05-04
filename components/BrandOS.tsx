"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

type Page = "landing" | "onboarding" | "blueprint" | "dashboard";
type OnboardingPath = "ikigai" | "niche" | null;
type DashboardTab = "youtube" | "linkedin" | "analysis";

interface IkigaiData {
  passion: string;
  skills: string;
  mission: string;
  vocation: string;
}

interface Blueprint {
  positioningStatement: string;
  idealClientAvatar: {
    name: string;
    age: string;
    role: string;
    struggles: string[];
    desires: string[];
    transformation: string;
  };
  voiceGuide: {
    tone: string;
    style: string;
    doList: string[];
    dontList: string[];
  };
  contentPillars: {
    name: string;
    description: string;
    exampleTopics: string[];
  }[];
}

interface LinkedInPost {
  type: string;
  hook: string;
  body: string;
  cta: string;
}

interface YouTubeOutlier {
  title: string;
  channel: string;
  views: string;
  score: number;
  hookType: string;
  pattern: string;
}

interface YouTubePlan {
  remixedTitle: string;
  altTitles: string[];
  hook: Record<string, string>;
  scriptOutline: { section: string; duration: string; notes: string }[];
  cta: string;
  thumbnailBrief: { text: string; visual: string; emotion: string };
}

// ─── Simulated outlier data ───────────────────────────────────────────────────

const OUTLIERS: YouTubeOutlier[] = [
  {
    title: "I tried every productivity system for 30 days — here's what actually worked",
    channel: "Ali Abdaal",
    views: "2.1M",
    score: 847,
    hookType: "Curiosity Gap",
    pattern: "Personal experiment → surprising result",
  },
  {
    title: "The uncomfortable truth about why you're not making money online",
    channel: "Dan Koe",
    views: "890K",
    score: 623,
    hookType: "Contrarian",
    pattern: "Challenge belief → reveal truth → solution",
  },
  {
    title: "How I went from $0 to $10k/month in 6 months (step by step)",
    channel: "Starter Story",
    views: "1.4M",
    score: 712,
    hookType: "Proof of concept",
    pattern: "Before/after → documented journey",
  },
  {
    title: "Stop making these 7 mistakes if you want to grow on YouTube",
    channel: "Nick Nimmin",
    views: "540K",
    score: 389,
    hookType: "Authority + List",
    pattern: "Common mistakes → expert corrections",
  },
  {
    title: "The 2-hour work week: a realistic approach to working less",
    channel: "Thomas Frank",
    views: "1.1M",
    score: 591,
    hookType: "Provocative claim",
    pattern: "Bold claim → nuanced reality → actionable system",
  },
  {
    title: "What nobody tells you about building a personal brand in 2025",
    channel: "Justin Welsh",
    views: "430K",
    score: 418,
    hookType: "Secret reveal",
    pattern: "Hidden information → insider knowledge → action",
  },
];

// ─── Shared styles ────────────────────────────────────────────────────────────

const S = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#07070a",
    color: "#e0dbd2",
    fontFamily: "var(--font-body)",
  } as React.CSSProperties,

  gold: { color: "#c9a44a" } as React.CSSProperties,
  muted: { color: "#6b6560" } as React.CSSProperties,

  surface: {
    backgroundColor: "#0e0e12",
    border: "1px solid #1e1e26",
    borderRadius: "8px",
    padding: "24px",
  } as React.CSSProperties,

  btn: {
    backgroundColor: "#c9a44a",
    color: "#07070a",
    border: "none",
    borderRadius: "6px",
    padding: "12px 28px",
    fontSize: "13px",
    fontWeight: "600",
    fontFamily: "var(--font-body)",
    cursor: "pointer",
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    transition: "opacity 0.15s",
  } as React.CSSProperties,

  btnGhost: {
    backgroundColor: "transparent",
    color: "#c9a44a",
    border: "1px solid #c9a44a",
    borderRadius: "6px",
    padding: "11px 27px",
    fontSize: "13px",
    fontWeight: "500",
    fontFamily: "var(--font-body)",
    cursor: "pointer",
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    transition: "all 0.15s",
  } as React.CSSProperties,

  input: {
    width: "100%",
    backgroundColor: "#0e0e12",
    border: "1px solid #1e1e26",
    borderRadius: "6px",
    padding: "12px 16px",
    color: "#e0dbd2",
    fontSize: "13px",
    fontFamily: "var(--font-body)",
    outline: "none",
    transition: "border-color 0.15s",
  } as React.CSSProperties,

  textarea: {
    width: "100%",
    backgroundColor: "#0e0e12",
    border: "1px solid #1e1e26",
    borderRadius: "6px",
    padding: "12px 16px",
    color: "#e0dbd2",
    fontSize: "13px",
    fontFamily: "var(--font-body)",
    outline: "none",
    resize: "vertical" as const,
    minHeight: "100px",
    transition: "border-color 0.15s",
  } as React.CSSProperties,

  label: {
    display: "block",
    color: "#6b6560",
    fontSize: "11px",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    marginBottom: "8px",
  } as React.CSSProperties,

  tag: {
    display: "inline-block",
    backgroundColor: "#16161c",
    border: "1px solid #1e1e26",
    borderRadius: "4px",
    padding: "3px 10px",
    fontSize: "11px",
    color: "#6b6560",
    letterSpacing: "0.05em",
  } as React.CSSProperties,

  goldTag: {
    display: "inline-block",
    backgroundColor: "#1a1508",
    border: "1px solid #9b7d37",
    borderRadius: "4px",
    padding: "3px 10px",
    fontSize: "11px",
    color: "#c9a44a",
    letterSpacing: "0.05em",
  } as React.CSSProperties,
};

// ─── Landing page ─────────────────────────────────────────────────────────────

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ ...S.container, display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          borderBottom: "1px solid #1e1e26",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "20px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#c9a44a",
          }}
        >
          Brand OS
        </span>
        <button style={S.btn} onClick={onStart}>
          Get Started
        </button>
      </nav>

      {/* Hero */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "80px 40px 60px",
          maxWidth: "800px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <span style={{ ...S.goldTag, marginBottom: "24px", fontSize: "12px" }}>
          AI-Powered Personal Brand System
        </span>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(52px, 8vw, 96px)",
            fontWeight: 300,
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            marginBottom: "24px",
            color: "#e0dbd2",
          }}
        >
          Build a brand that
          <br />
          <span style={{ color: "#c9a44a", fontStyle: "italic" }}>
            actually means something
          </span>
        </h1>
        <p
          style={{
            color: "#6b6560",
            fontSize: "16px",
            lineHeight: "1.7",
            marginBottom: "48px",
            maxWidth: "520px",
          }}
        >
          Brand OS uses the Ikigai framework and Claude AI to build your
          positioning, define your audience, and generate content that grows
          your audience — across YouTube and LinkedIn.
        </p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          <button style={{ ...S.btn, padding: "14px 36px", fontSize: "14px" }} onClick={onStart}>
            Build My Brand
          </button>
          <button style={{ ...S.btnGhost, padding: "13px 35px", fontSize: "14px" }}>
            See How It Works
          </button>
        </div>
      </div>

      {/* Feature cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1px",
          borderTop: "1px solid #1e1e26",
          borderBottom: "1px solid #1e1e26",
          backgroundColor: "#1e1e26",
        }}
      >
        {[
          {
            icon: "◈",
            title: "Ikigai Brand Builder",
            desc: "Discover your unique positioning through the Japanese framework that finds the intersection of passion, skill, and purpose.",
          },
          {
            icon: "▲",
            title: "YouTube Outlier Feed",
            desc: "See what's going viral in your niche, then remix those patterns with AI-generated scripts, hooks, and thumbnail briefs.",
          },
          {
            icon: "◎",
            title: "LinkedIn Content Engine",
            desc: "Turn any topic into six ready-to-post LinkedIn formats: story, listicle, framework, contrarian, data, and quick win.",
          },
          {
            icon: "◇",
            title: "Brand Blueprint",
            desc: "Get your full positioning statement, ideal client avatar, voice guide, and three content pillars in one document.",
          },
        ].map((f) => (
          <div
            key={f.title}
            style={{
              backgroundColor: "#07070a",
              padding: "36px 28px",
            }}
          >
            <div
              style={{
                color: "#c9a44a",
                fontSize: "20px",
                marginBottom: "16px",
              }}
            >
              {f.icon}
            </div>
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "22px",
                fontWeight: 400,
                marginBottom: "12px",
                color: "#e0dbd2",
              }}
            >
              {f.title}
            </h3>
            <p style={{ color: "#6b6560", fontSize: "13px", lineHeight: "1.6" }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "24px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#6b6560", fontSize: "12px" }}>
          Built by Hodan Yusuf · Powered by Claude
        </span>
        <button style={S.btn} onClick={onStart}>
          Start Building
        </button>
      </div>
    </div>
  );
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

function Onboarding({
  onComplete,
  userId,
}: {
  onComplete: (blueprint: Blueprint) => void;
  userId: string | null;
}) {
  const [path, setPath] = useState<OnboardingPath>(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [niche, setNiche] = useState("");
  const [ikigai, setIkigai] = useState<IkigaiData>({
    passion: "",
    skills: "",
    mission: "",
    vocation: "",
  });

  const ikigaiSteps = [
    {
      key: "passion" as keyof IkigaiData,
      label: "What do you love?",
      prompt:
        "What activities make you lose track of time? What topics do you read about for fun?",
      placeholder:
        "e.g. Writing about psychology, teaching people, building things online...",
    },
    {
      key: "skills" as keyof IkigaiData,
      label: "What are you great at?",
      prompt:
        "What do people come to you for advice on? What skills have you spent years developing?",
      placeholder:
        "e.g. Content strategy, data analysis, explaining complex ideas simply...",
    },
    {
      key: "mission" as keyof IkigaiData,
      label: "What does the world need?",
      prompt:
        "What problem do you see everywhere that you could help solve? What change do you want to see?",
      placeholder:
        "e.g. More people building financial independence, better mental health awareness...",
    },
    {
      key: "vocation" as keyof IkigaiData,
      label: "What can you be paid for?",
      prompt:
        "How could your passion and skills create value for others? What would people pay for?",
      placeholder:
        "e.g. Consulting, courses, coaching, content creation, SaaS products...",
    },
  ];

  async function generateBlueprint() {
    setLoading(true);
    setError("");
    try {
      const base = path === "niche" ? { niche } : ikigai;
      const payload = userId ? { ...base, user_id: userId } : base;
      const res = await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to generate blueprint");
      const data = await res.json();
      onComplete(data.blueprint as Blueprint);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!path) {
    return (
      <div style={{ ...S.container, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px" }}>
        <div style={{ maxWidth: "560px", width: "100%", textAlign: "center" }}>
          <span style={{ ...S.goldTag, marginBottom: "20px", fontSize: "11px" }}>Step 1 of 2</span>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "48px",
              fontWeight: 300,
              marginBottom: "16px",
              lineHeight: 1.1,
            }}
          >
            How do you want to build your brand?
          </h2>
          <p style={{ color: "#6b6560", marginBottom: "48px", fontSize: "14px" }}>
            Choose the path that fits where you are right now.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <button
              onClick={() => setPath("ikigai")}
              style={{
                ...S.surface,
                cursor: "pointer",
                textAlign: "left",
                border: "1px solid #1e1e26",
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                <span style={{ color: "#c9a44a", fontSize: "24px", marginTop: "2px" }}>◈</span>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "22px",
                      marginBottom: "8px",
                    }}
                  >
                    Path A — Discover via Ikigai
                  </div>
                  <p style={{ color: "#6b6560", fontSize: "13px", lineHeight: "1.6" }}>
                    Answer 4 questions about what you love, what you&apos;re good at, what the world needs, and what you can be paid for. Takes 5 minutes.
                  </p>
                </div>
              </div>
            </button>
            <button
              onClick={() => setPath("niche")}
              style={{
                ...S.surface,
                cursor: "pointer",
                textAlign: "left",
                border: "1px solid #1e1e26",
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                <span style={{ color: "#c9a44a", fontSize: "24px", marginTop: "2px" }}>▶</span>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "22px",
                      marginBottom: "8px",
                    }}
                  >
                    Path B — I already know my niche
                  </div>
                  <p style={{ color: "#6b6560", fontSize: "13px", lineHeight: "1.6" }}>
                    Already creating content? Enter your niche and we&apos;ll build a brand blueprint around it. Takes 60 seconds.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (path === "niche") {
    return (
      <div style={{ ...S.container, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px" }}>
        <div style={{ maxWidth: "520px", width: "100%" }}>
          <span style={{ ...S.goldTag, marginBottom: "20px", display: "inline-block", fontSize: "11px" }}>Path B</span>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "48px",
              fontWeight: 300,
              marginBottom: "8px",
              lineHeight: 1.1,
            }}
          >
            What&apos;s your niche?
          </h2>
          <p style={{ color: "#6b6560", marginBottom: "32px", fontSize: "14px" }}>
            Describe what you create content about in a sentence or two.
          </p>
          <div style={{ marginBottom: "24px" }}>
            <label style={S.label}>Your niche</label>
            <textarea
              style={{ ...S.textarea, minHeight: "120px" }}
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. I help early-stage founders build their personal brand on LinkedIn so they can attract investors and top talent without paid ads..."
            />
          </div>
          {error && (
            <p style={{ color: "#e05a5a", marginBottom: "16px", fontSize: "13px" }}>
              {error}
            </p>
          )}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              style={{ ...S.btnGhost, padding: "11px 20px" }}
              onClick={() => setPath(null)}
            >
              ← Back
            </button>
            <button
              style={{
                ...S.btn,
                flex: 1,
                opacity: loading || !niche.trim() ? 0.5 : 1,
              }}
              onClick={generateBlueprint}
              disabled={loading || !niche.trim()}
            >
              {loading ? "Generating..." : "Build My Blueprint"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ikigai path
  const currentStep = ikigaiSteps[step];
  const isLast = step === ikigaiSteps.length - 1;
  const currentValue = ikigai[currentStep.key];

  return (
    <div style={{ ...S.container, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px" }}>
      <div style={{ maxWidth: "520px", width: "100%" }}>
        {/* Progress */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "32px" }}>
          {ikigaiSteps.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: "3px",
                backgroundColor: i <= step ? "#c9a44a" : "#1e1e26",
                borderRadius: "2px",
                transition: "background-color 0.3s",
              }}
            />
          ))}
        </div>

        <span style={{ ...S.goldTag, marginBottom: "20px", display: "inline-block", fontSize: "11px" }}>
          Question {step + 1} of {ikigaiSteps.length}
        </span>
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "48px",
            fontWeight: 300,
            marginBottom: "8px",
            lineHeight: 1.1,
          }}
        >
          {currentStep.label}
        </h2>
        <p style={{ color: "#6b6560", marginBottom: "32px", fontSize: "14px" }}>
          {currentStep.prompt}
        </p>

        <div style={{ marginBottom: "24px" }}>
          <textarea
            style={{ ...S.textarea, minHeight: "130px" }}
            value={currentValue}
            onChange={(e) =>
              setIkigai((prev) => ({ ...prev, [currentStep.key]: e.target.value }))
            }
            placeholder={currentStep.placeholder}
          />
        </div>

        {error && (
          <p style={{ color: "#e05a5a", marginBottom: "16px", fontSize: "13px" }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            style={{ ...S.btnGhost, padding: "11px 20px" }}
            onClick={() => (step === 0 ? setPath(null) : setStep((s) => s - 1))}
          >
            ← Back
          </button>
          <button
            style={{
              ...S.btn,
              flex: 1,
              opacity: loading || !currentValue.trim() ? 0.5 : 1,
            }}
            onClick={() => {
              if (isLast) generateBlueprint();
              else setStep((s) => s + 1);
            }}
            disabled={loading || !currentValue.trim()}
          >
            {isLast ? (loading ? "Generating..." : "Build My Blueprint") : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Brand Blueprint ──────────────────────────────────────────────────────────

function BrandBlueprint({
  blueprint,
  onContinue,
}: {
  blueprint: Blueprint;
  onContinue: () => void;
}) {
  return (
    <div style={{ ...S.container, padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "48px" }}>
        <span style={{ ...S.goldTag, marginBottom: "16px", display: "inline-block" }}>
          Brand Blueprint
        </span>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 300,
            lineHeight: 1.05,
            marginBottom: "16px",
          }}
        >
          Your Brand, Defined
        </h1>
        <p style={{ color: "#6b6560", fontSize: "14px" }}>
          Based on your inputs, here is your complete personal brand blueprint.
        </p>
      </div>

      {/* Positioning statement */}
      <div style={{ ...S.surface, marginBottom: "24px", borderLeft: "3px solid #c9a44a" }}>
        <div style={{ ...S.label, marginBottom: "12px" }}>Positioning Statement</div>
        <p
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "28px",
            fontWeight: 400,
            lineHeight: 1.3,
            color: "#e0dbd2",
          }}
        >
          &ldquo;{blueprint.positioningStatement}&rdquo;
        </p>
      </div>

      {/* ICA */}
      <div style={{ ...S.surface, marginBottom: "24px" }}>
        <div style={{ ...S.label, marginBottom: "16px" }}>Ideal Client Avatar</div>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "20px" }}>
          <div>
            <div style={{ color: "#c9a44a", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Name</div>
            <div style={{ fontSize: "16px" }}>{blueprint.idealClientAvatar.name}</div>
          </div>
          <div>
            <div style={{ color: "#c9a44a", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Age</div>
            <div style={{ fontSize: "16px" }}>{blueprint.idealClientAvatar.age}</div>
          </div>
          <div>
            <div style={{ color: "#c9a44a", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Role</div>
            <div style={{ fontSize: "16px" }}>{blueprint.idealClientAvatar.role}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div>
            <div style={{ color: "#c9a44a", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Struggles</div>
            <ul style={{ paddingLeft: "16px", color: "#6b6560", fontSize: "13px", lineHeight: "1.8" }}>
              {blueprint.idealClientAvatar.struggles.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <div style={{ color: "#c9a44a", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Desires</div>
            <ul style={{ paddingLeft: "16px", color: "#6b6560", fontSize: "13px", lineHeight: "1.8" }}>
              {blueprint.idealClientAvatar.desires.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
        <div style={{ backgroundColor: "#16161c", borderRadius: "6px", padding: "16px" }}>
          <div style={{ color: "#c9a44a", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Key Transformation</div>
          <p style={{ color: "#e0dbd2", fontSize: "14px", lineHeight: "1.6" }}>
            {blueprint.idealClientAvatar.transformation}
          </p>
        </div>
      </div>

      {/* Voice guide */}
      <div style={{ ...S.surface, marginBottom: "24px" }}>
        <div style={{ ...S.label, marginBottom: "16px" }}>Voice Guide</div>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ color: "#c9a44a", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Tone</div>
          <span style={S.goldTag}>{blueprint.voiceGuide.tone}</span>
        </div>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ color: "#c9a44a", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Style</div>
          <p style={{ color: "#6b6560", fontSize: "13px", lineHeight: "1.6" }}>{blueprint.voiceGuide.style}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <div style={{ color: "#c9a44a", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Do</div>
            {blueprint.voiceGuide.doList.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
                <span style={{ color: "#c9a44a", marginTop: "1px" }}>✓</span>
                <span style={{ color: "#e0dbd2", fontSize: "13px" }}>{item}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ color: "#6b6560", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Don&apos;t</div>
            {blueprint.voiceGuide.dontList.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
                <span style={{ color: "#6b6560", marginTop: "1px" }}>✗</span>
                <span style={{ color: "#6b6560", fontSize: "13px" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content pillars */}
      <div style={{ marginBottom: "48px" }}>
        <div style={{ ...S.label, marginBottom: "16px" }}>Content Pillars</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          {blueprint.contentPillars.map((pillar, i) => (
            <div key={i} style={{ ...S.surface }}>
              <div style={{ color: "#c9a44a", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
                Pillar {i + 1}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "20px",
                  marginBottom: "8px",
                }}
              >
                {pillar.name}
              </div>
              <p style={{ color: "#6b6560", fontSize: "12px", lineHeight: "1.6", marginBottom: "12px" }}>
                {pillar.description}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {pillar.exampleTopics.map((topic, j) => (
                  <span key={j} style={S.tag}>{topic}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        style={{ ...S.btn, width: "100%", padding: "16px", fontSize: "14px" }}
        onClick={onContinue}
      >
        Enter Dashboard →
      </button>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ blueprint, userId }: { blueprint: Blueprint; userId: string | null }) {
  const [tab, setTab] = useState<DashboardTab>("youtube");
  const [selectedOutlier, setSelectedOutlier] = useState<YouTubeOutlier | null>(null);
  const [youtubePlan, setYoutubePlan] = useState<YouTubePlan | null>(null);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [linkedinTopic, setLinkedinTopic] = useState("");
  const [linkedinPosts, setLinkedinPosts] = useState<LinkedInPost[]>([]);
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  async function generateYoutubePlan(outlier: YouTubeOutlier) {
    setSelectedOutlier(outlier);
    setYoutubePlan(null);
    setYoutubeLoading(true);
    try {
      const res = await fetch("/api/youtube-version", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: outlier.title,
          hookType: outlier.hookType,
          pattern: outlier.pattern,
          ...(userId ? { user_id: userId } : {}),
        }),
      });
      const data = await res.json();
      setYoutubePlan(data.plan as YouTubePlan);
    } catch {
      console.error("Failed to generate YouTube plan");
    } finally {
      setYoutubeLoading(false);
    }
  }

  async function generateLinkedinPosts() {
    if (!linkedinTopic.trim()) return;
    setLinkedinLoading(true);
    setLinkedinPosts([]);
    try {
      const res = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: linkedinTopic,
          ...(userId ? { user_id: userId } : {}),
        }),
      });
      const data = await res.json();
      setLinkedinPosts(data.posts as LinkedInPost[]);
    } catch {
      console.error("Failed to generate LinkedIn posts");
    } finally {
      setLinkedinLoading(false);
    }
  }

  function copyPost(post: LinkedInPost, idx: number) {
    const text = `${post.hook}\n\n${post.body}\n\n${post.cta}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  }

  return (
    <div style={{ ...S.container, display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 32px",
          borderBottom: "1px solid #1e1e26",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "18px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#c9a44a",
          }}
        >
          Brand OS
        </span>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            fontFamily: "var(--font-heading)",
            fontSize: "15px",
            color: "#6b6560",
            padding: "0 16px",
          }}
        >
          {blueprint.positioningStatement}
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={S.goldTag}>Dashboard</span>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.replace("/auth");
            }}
            style={{
              backgroundColor: "transparent",
              border: "1px solid #1e1e26",
              borderRadius: "4px",
              padding: "4px 12px",
              color: "#6b6560",
              fontSize: "11px",
              fontFamily: "var(--font-body)",
              cursor: "pointer",
              letterSpacing: "0.05em",
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0",
          borderBottom: "1px solid #1e1e26",
          padding: "0 32px",
        }}
      >
        {(["youtube", "linkedin", "analysis"] as DashboardTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              backgroundColor: "transparent",
              border: "none",
              borderBottom: tab === t ? "2px solid #c9a44a" : "2px solid transparent",
              color: tab === t ? "#e0dbd2" : "#6b6560",
              padding: "16px 20px",
              fontSize: "12px",
              fontFamily: "var(--font-body)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "color 0.15s",
              marginBottom: "-1px",
            }}
          >
            {t === "youtube" ? "YouTube Strategy" : t === "linkedin" ? "LinkedIn Engine" : "Content Analysis"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, padding: "32px", overflow: "auto" }}>
        {/* ── YouTube ── */}
        {tab === "youtube" && (
          <div style={{ display: "grid", gridTemplateColumns: selectedOutlier ? "1fr 1fr" : "1fr", gap: "24px", maxWidth: "1200px" }}>
            {/* Outlier feed */}
            <div>
              <div style={{ ...S.label, marginBottom: "16px" }}>
                Outlier Feed — simulated data
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {OUTLIERS.map((o, i) => (
                  <button
                    key={i}
                    onClick={() => generateYoutubePlan(o)}
                    style={{
                      ...S.surface,
                      cursor: "pointer",
                      textAlign: "left",
                      border: selectedOutlier?.title === o.title ? "1px solid #c9a44a" : "1px solid #1e1e26",
                      transition: "border-color 0.15s",
                      padding: "16px 20px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "8px" }}>
                      <p style={{ color: "#e0dbd2", fontSize: "13px", lineHeight: "1.5", flex: 1 }}>
                        {o.title}
                      </p>
                      <span
                        style={{
                          ...S.goldTag,
                          flexShrink: 0,
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {o.score}×
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <span style={S.tag}>{o.channel}</span>
                      <span style={S.tag}>{o.views} views</span>
                      <span style={S.tag}>{o.hookType}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content plan */}
            {selectedOutlier && (
              <div>
                <div style={{ ...S.label, marginBottom: "16px" }}>
                  Content Plan
                </div>
                {youtubeLoading ? (
                  <div style={{ ...S.surface, textAlign: "center", padding: "48px" }}>
                    <div style={{ color: "#6b6560", fontSize: "13px" }}>
                      Generating content plan...
                    </div>
                  </div>
                ) : youtubePlan ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Titles */}
                    <div style={S.surface}>
                      <div style={{ ...S.label, marginBottom: "12px" }}>Remixed Title</div>
                      <p style={{ color: "#e0dbd2", fontSize: "15px", fontFamily: "var(--font-heading)", lineHeight: "1.4", marginBottom: "12px" }}>
                        {youtubePlan.remixedTitle}
                      </p>
                      <div style={{ ...S.label, marginBottom: "8px" }}>Alt Titles</div>
                      {youtubePlan.altTitles.map((t, i) => (
                        <p key={i} style={{ color: "#6b6560", fontSize: "12px", marginBottom: "4px" }}>
                          — {t}
                        </p>
                      ))}
                    </div>

                    {/* Hook */}
                    <div style={S.surface}>
                      <div style={{ ...S.label, marginBottom: "12px" }}>7-Step Hook</div>
                      {Object.values(youtubePlan.hook).map((line, i) => (
                        <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "10px" }}>
                          <span style={{ color: "#c9a44a", fontSize: "11px", fontWeight: "600", minWidth: "20px", marginTop: "1px" }}>
                            {i + 1}.
                          </span>
                          <span style={{ color: "#e0dbd2", fontSize: "13px", lineHeight: "1.5" }}>{line}</span>
                        </div>
                      ))}
                    </div>

                    {/* Script outline */}
                    <div style={S.surface}>
                      <div style={{ ...S.label, marginBottom: "12px" }}>Script Outline</div>
                      {youtubePlan.scriptOutline.map((s, i) => (
                        <div key={i} style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: i < youtubePlan.scriptOutline.length - 1 ? "1px solid #1e1e26" : "none" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ color: "#e0dbd2", fontSize: "13px", fontWeight: "500" }}>{s.section}</span>
                            <span style={{ color: "#6b6560", fontSize: "11px" }}>{s.duration}</span>
                          </div>
                          <p style={{ color: "#6b6560", fontSize: "12px", lineHeight: "1.5" }}>{s.notes}</p>
                        </div>
                      ))}
                    </div>

                    {/* CTA + Thumbnail */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div style={S.surface}>
                        <div style={{ ...S.label, marginBottom: "8px" }}>CTA</div>
                        <p style={{ color: "#e0dbd2", fontSize: "13px", lineHeight: "1.5" }}>{youtubePlan.cta}</p>
                      </div>
                      <div style={S.surface}>
                        <div style={{ ...S.label, marginBottom: "8px" }}>Thumbnail Brief</div>
                        <div style={{ marginBottom: "6px" }}>
                          <span style={S.goldTag}>{youtubePlan.thumbnailBrief.text}</span>
                        </div>
                        <p style={{ color: "#6b6560", fontSize: "12px", lineHeight: "1.5", marginBottom: "6px" }}>{youtubePlan.thumbnailBrief.visual}</p>
                        <p style={{ color: "#6b6560", fontSize: "12px" }}>Emotion: {youtubePlan.thumbnailBrief.emotion}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* ── LinkedIn ── */}
        {tab === "linkedin" && (
          <div style={{ maxWidth: "900px" }}>
            <div style={{ ...S.surface, marginBottom: "24px" }}>
              <div style={{ ...S.label, marginBottom: "12px" }}>Generate LinkedIn Posts</div>
              <div style={{ display: "flex", gap: "12px" }}>
                <input
                  style={{ ...S.input, flex: 1 }}
                  type="text"
                  value={linkedinTopic}
                  onChange={(e) => setLinkedinTopic(e.target.value)}
                  placeholder="Enter a topic, idea, or lesson..."
                  onKeyDown={(e) => e.key === "Enter" && generateLinkedinPosts()}
                />
                <button
                  style={{
                    ...S.btn,
                    opacity: linkedinLoading || !linkedinTopic.trim() ? 0.5 : 1,
                    whiteSpace: "nowrap",
                  }}
                  onClick={generateLinkedinPosts}
                  disabled={linkedinLoading || !linkedinTopic.trim()}
                >
                  {linkedinLoading ? "Generating..." : "Generate 6 Posts"}
                </button>
              </div>
            </div>

            {linkedinPosts.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "16px" }}>
                {linkedinPosts.map((post, i) => (
                  <div key={i} style={{ ...S.surface, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={S.goldTag}>{post.type}</span>
                      <button
                        onClick={() => copyPost(post, i)}
                        style={{
                          backgroundColor: copiedIdx === i ? "#1a1508" : "transparent",
                          border: "1px solid #1e1e26",
                          borderRadius: "4px",
                          padding: "4px 12px",
                          color: copiedIdx === i ? "#c9a44a" : "#6b6560",
                          fontSize: "11px",
                          fontFamily: "var(--font-body)",
                          cursor: "pointer",
                          letterSpacing: "0.05em",
                          transition: "all 0.15s",
                        }}
                      >
                        {copiedIdx === i ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p style={{ color: "#e0dbd2", fontSize: "13px", fontWeight: "500", marginBottom: "10px", lineHeight: "1.5" }}>
                      {post.hook}
                    </p>
                    <p style={{ color: "#6b6560", fontSize: "12px", lineHeight: "1.7", flex: 1, marginBottom: "10px", whiteSpace: "pre-line" }}>
                      {post.body}
                    </p>
                    <p style={{ color: "#c9a44a", fontSize: "12px", fontStyle: "italic", lineHeight: "1.4", borderTop: "1px solid #1e1e26", paddingTop: "10px" }}>
                      {post.cta}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Analysis ── */}
        {tab === "analysis" && (
          <div style={{ maxWidth: "900px" }}>
            <div style={{ marginBottom: "24px" }}>
              <div style={{ ...S.label, marginBottom: "16px" }}>Content Performance — simulated data</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                {[
                  { label: "Total Posts", value: "47", delta: "+12 this month" },
                  { label: "Avg Engagement", value: "4.2%", delta: "+0.8% vs last month" },
                  { label: "Top Pillar", value: "Authority", delta: "18 posts published" },
                  { label: "Best Format", value: "Story", value2: "6.1% avg engagement" },
                ].map((stat, i) => (
                  <div key={i} style={S.surface}>
                    <div style={{ ...S.label, marginBottom: "8px" }}>{stat.label}</div>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: "32px", color: "#c9a44a", marginBottom: "4px" }}>
                      {stat.value}
                    </div>
                    <div style={{ color: "#6b6560", fontSize: "11px" }}>{stat.delta ?? stat.value2}</div>
                  </div>
                ))}
              </div>

              <div style={{ ...S.surface }}>
                <div style={{ ...S.label, marginBottom: "16px" }}>Content Pillar Distribution</div>
                {blueprint.contentPillars.map((pillar, i) => {
                  const pct = [45, 35, 20][i];
                  return (
                    <div key={i} style={{ marginBottom: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "13px", color: "#e0dbd2" }}>{pillar.name}</span>
                        <span style={{ fontSize: "12px", color: "#6b6560" }}>{pct}%</span>
                      </div>
                      <div style={{ backgroundColor: "#16161c", borderRadius: "3px", height: "6px" }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            backgroundColor: "#c9a44a",
                            borderRadius: "3px",
                            opacity: 0.6 + i * 0.15,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                <p style={{ color: "#6b6560", fontSize: "11px", marginTop: "16px" }}>
                  Real YouTube API integration coming soon. Connect your channel to see live data.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function BrandOS() {
  const [page, setPage] = useState<Page>("landing");
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  function handleBlueprintComplete(bp: Blueprint) {
    setBlueprint(bp);
    setPage("blueprint");
  }

  return (
    <>
      {page === "landing" && <Landing onStart={() => setPage("onboarding")} />}
      {page === "onboarding" && (
        <Onboarding onComplete={handleBlueprintComplete} userId={user?.id ?? null} />
      )}
      {page === "blueprint" && blueprint && (
        <BrandBlueprint
          blueprint={blueprint}
          onContinue={() => setPage("dashboard")}
        />
      )}
      {page === "dashboard" && blueprint && (
        <Dashboard blueprint={blueprint} userId={user?.id ?? null} />
      )}
    </>
  );
}
