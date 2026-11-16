"use client";

import { useId, useState, type FormEvent } from "react";
import { buttonClass } from "@/components/ui/button";
import { signups } from "@/lib/content/site";

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
 * Email signup.
 *
 * No mailing provider is connected yet, so by default the form is shown closed:
 * the field is disabled and it says plainly that signups are not open. It never
 * reports success for an address that was not stored.
 *
 * Once a provider is wired into /api/subscribe and NEXT_PUBLIC_SIGNUPS_ENABLED is
 * "true", the same form validates, submits, and confirms only when the server says
 * the address was stored.
 */
export function SignupForm({ list, submitLabel, tone = "light", className = "" }: Props) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const dark = tone === "dark";
  const open = signups.enabled;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!open) return;
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
      const data = (await res.json().catch(() => null)) as { stored?: boolean; error?: string } | null;
      // Success means the server stored the address. Anything else is reported as a failure.
      if (!res.ok || data?.stored !== true) {
        throw new Error(data?.error ?? "Your address could not be saved. Try again in a moment.");
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
          placeholder={open ? "you@example.com" : "Not open yet"}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status.kind !== "idle" && status.kind !== "loading") setStatus({ kind: "idle" });
          }}
          aria-invalid={invalid}
          aria-describedby={`${id}-status`}
          disabled={!open || loading}
          className={`min-w-0 flex-1 rounded-lg bg-transparent px-2 py-2 body-3 disabled:cursor-not-allowed ${
            dark ? "text-white placeholder:text-ice/50" : "text-navy placeholder:text-slate/50"
          }`}
        />
        <button type="submit" disabled={!open || loading} className={buttonClass(dark ? "inverse" : "primary", "md")}>
          {loading ? <span className="skeleton">Sending</span> : submitLabel}
        </button>
      </div>
      <p id={`${id}-status`} role="status" aria-live="polite" className={`min-h-10 caption-2 ${dark ? "text-ice/80" : "text-slate/80"}`}>
        {!open && "Email signups are not open yet. This form does not collect or store anything."}
        {open && status.kind === "error" && <span className={dark ? "text-white" : "text-navy"}>{status.message}</span>}
        {open && status.kind === "done" && (
          <span className={dark ? "text-white" : "text-navy"}>You are on the list. Updates will go to {status.email}.</span>
        )}
      </p>
    </form>
  );
}
