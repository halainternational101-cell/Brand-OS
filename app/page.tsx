import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import BrandOS from "@/components/BrandOS";

// Lightweight auth gate: if no Supabase session cookie present, send to /auth.
// The full session validation happens client-side in BrandOS.tsx.
export default async function Home() {
  const cookieStore = await cookies();
  const hasSession = cookieStore
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));

  if (!hasSession) {
    redirect("/auth");
  }

  return <BrandOS />;
}
