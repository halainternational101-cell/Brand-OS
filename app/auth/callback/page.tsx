"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  useEffect(() => {
    // Supabase picks up the session from the URL hash automatically.
    // Once the session is set, redirect to the app.
    supabase.auth.getSession().then(() => {
      window.location.replace("/");
    });
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#07070a",
        color: "#e0dbd2",
        fontFamily: "var(--font-body)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "22px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#c9a44a",
            marginBottom: "16px",
          }}
        >
          Brand OS
        </div>
        <p style={{ color: "#6b6560", fontSize: "13px" }}>Signing you in...</p>
      </div>
    </div>
  );
}
