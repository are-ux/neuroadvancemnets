/**
 * Signup endpoint.
 *
 * No mailing provider is connected, so nothing can be stored. The endpoint validates
 * the request and then answers 503: it never claims an address was saved.
 *
 * To go live: send the address to a mailing provider here (a double opt in list is the
 * usual choice), return { stored: true } only when the provider confirms, and keep its
 * credentials in server side environment variables, never in NEXT_PUBLIC_ ones.
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

  return Response.json({ stored: false, error: "Email signups are not open yet. Your address was not saved." }, { status: 503 });
}
