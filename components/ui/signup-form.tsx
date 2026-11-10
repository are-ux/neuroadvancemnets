"use client";

import { useId, useState, type FormEvent } from "react";
import { buttonClass } from "@/components/ui/button";

type Props = {
  /** Which list the address is for. Sent to the API so one endpoint can serve every form. */
  list: "newsletter" | "podcast" | "consultations";
  submitLabel: string;
  tone?: "light" | "dark";
  className?: string;
};

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "done"; email: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Email signup with client side validation and a real request to /api/subscribe.
 * The endpoint is an integration placeholder: it validates but stores nothing,
 * and the confirmation says so plainly.
 */
export function SignupForm({ list, submitLabel, tone = "light", className = "" }: Props) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const dark = tone === "dark";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = email.trim();
    if (!value) return setStatus({ kind: "error", message: "Enter your email address." });
    if (!EMAIL.test(value)) return setStatus({ kind: "error", message: "That address looks incomplete. Check it and try again." });

    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, list }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "The request failed. Try again in a moment.");
      }
      setStatus({ kind: "done", email: value });
      setEmail("");
    } catch (err) {
      const offline = err instanceof TypeError;
      setStatus({
        kind: "error",
        message: offline ? "Could not reach the server. Check your connection and try again." : (err as Error).message,
      });
    }
  }

  const invalid = status.kind === "error";
  const loading = status.kind === "loading";

  return (
    <form onSubmit={onSubmit} noValidate className={`flex w-full max-w-md flex-col gap-2 ${className}`}>
      <label htmlFor={id} className={`caption-1 ${dark ? "text-ice" : "text-slate"}`}>
        Email address
      </label>
      <div
        className={`flex items-center gap-2 rounded-2xl border p-2 transition-colors motion-hover ${
          dark ? "bg-slate" : "bg-white"
        } ${invalid ? "border-orange" : dark ? "border-white/15 focus-within:border-white/50" : "border-navy/15 focus-within:border-navy/50"}`}
      >
        <input
          id={id}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status.kind !== "idle" && status.kind !== "loading") setStatus({ kind: "idle" });
          }}
          aria-invalid={invalid}
          aria-describedby={`${id}-status`}
          disabled={loading}
          className={`min-w-0 flex-1 rounded-lg bg-transparent px-2 py-2 body-3 ${
            dark ? "text-white placeholder:text-ice/50" : "text-navy placeholder:text-slate/50"
          }`}
        />
        <button type="submit" disabled={loading} className={buttonClass(dark ? "inverse" : "primary", "md")}>
          {loading ? <span className="skeleton">Sending</span> : submitLabel}
        </button>
      </div>
      <p id={`${id}-status`} role="status" aria-live="polite" className={`min-h-10 caption-2 ${dark ? "text-ice/80" : "text-slate/80"}`}>
        {status.kind === "error" && <span className={dark ? "text-white" : "text-navy"}>{status.message}</span>}
        {status.kind === "done" && (
          <span className={dark ? "text-white" : "text-navy"}>
            Request received. Signups are not connected to a mailing service yet, so {status.email} has not been
            stored.
          </span>
        )}
        {(status.kind === "idle" || status.kind === "loading") && "Integration placeholder. No address is stored yet."}
      </p>
    </form>
  );
}
