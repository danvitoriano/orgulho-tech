const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxP70d6QcRpFntn3jahHyzqflk0ZTYYm-CyhWcF-TXfjzeRFFBzN6AGC2UiW66W0DoR/exec";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("newsletter signup upstream accepts submissions", async () => {
  const uniqueEmail = `teste.newsletter.predeploy.${Date.now()}@example.com`;

  const payload = new URLSearchParams({
    email: uniqueEmail,
    source: "newsletter_rodape",
  });

  const response = await fetch(SCRIPT_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: payload.toString(),
  });

  assert(
    response.ok,
    `Newsletter signup upstream failed with status ${response.status}`,
  );

  const body = await response.text();
  assert(body.length > 0, "Newsletter upstream returned empty body");
});
