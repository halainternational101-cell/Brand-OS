"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMagicLink() {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#07070a",
        color: "#e0dbd2",
        fontFamily: "var(--font-body)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
      }}
    >
      <div style={{ maxWidth: "400px", width: "100%" }}>
        {/* Logo */}
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "22px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#c9a44a",
            marginBottom: "48px",
            textAlign: "center",
          }}
        >
          Brand OS
        </div>

        {sent ? (
          <div
            style={{
              backgroundColor: "#0e0e12",
              border: "1px solid #1e1e26",
              borderRadius: "8px",
              padding: "32px",
              textAlign: "center",
            }}
          >
            <div style={{ color: "#c9a44a", fontSize: "28px", marginBottom: "16px" }}>✓</div>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "28px",
                fontWeight: 400,
                marginBottom: "12px",
              }}
            >
              Check your inbox
            </h2>
            <p style={{ color: "#6b6560", fontSize: "13px", lineHeight: "1.7" }}>
              We sent a magic link to <span style={{ color: "#e0dbd2" }}>{email}</span>.
              Click it to sign in — no password needed.
            </p>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "#0e0e12",
              border: "1px solid #1e1e26",
              borderRadius: "8px",
              padding: "32px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "36px",
                fontWeight: 300,
                marginBottom: "8px",
                lineHeight: 1.1,
              }}
            >
              Sign in
            </h2>
            <p style={{ color: "#6b6560", fontSize: "13px", marginBottom: "32px" }}>
              Enter your email and we&apos;ll send you a magic link.
            </p>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  color: "#6b6560",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMagicLink()}
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  backgroundColor: "#07070a",
                  border: "1px solid #1e1e26",
                  borderRadius: "6px",
                  padding: "12px 16px",
                  color: "#e0dbd2",
                  fontSize: "13px",
                  fontFamily: "var(--font-body)",
                  outline: "none",
                }}
              />
            </div>

            {error && (
              <p style={{ color: "#e05a5a", fontSize: "12px", marginBottom: "12px" }}>
                {error}
              </p>
            )}

            <button
              onClick={sendMagicLink}
              disabled={loading || !email.trim()}
              style={{
                width: "100%",
                backgroundColor: "#c9a44a",
                color: "#07070a",
                border: "none",
                borderRadius: "6px",
                padding: "13px",
                fontSize: "13px",
                fontWeight: "600",
                fontFamily: "var(--font-body)",
                cursor: "pointer",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                opacity: loading || !email.trim() ? 0.5 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
