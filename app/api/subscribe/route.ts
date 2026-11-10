/**
 * Signup endpoint, integration placeholder.
 *
 * It validates the request and answers, but stores nothing. To go live, send
 * the address to a mailing provider here (for example a double opt in list)
 * and return stored: true. Keep validation on the server either way.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LISTS = new Set(["newsletter", "podcast", "consultations"]);

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The request was not valid JSON." }, { status: 400 });
  }

  const { email, list } = (body ?? {}) as { email?: unknown; list?: unknown };
  if (typeof email !== "string" || email.length > 254 || !EMAIL.test(email.trim())) {
    return Response.json({ error: "Enter a valid email address." }, { status: 422 });
  }
  if (typeof list !== "string" || !LISTS.has(list)) {
    return Response.json({ error: "Unknown signup list." }, { status: 422 });
  }

  return Response.json({ ok: true, stored: false });
}
