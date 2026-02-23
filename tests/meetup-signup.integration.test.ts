const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxP70d6QcRpFntn3jahHyzqflk0ZTYYm-CyhWcF-TXfjzeRFFBzN6AGC2UiW66W0DoR/exec";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("meetup signup upstream accepts submissions", async () => {
  const uniqueEmail = `teste.meetup.predeploy.${Date.now()}@example.com`;

  const payload = new URLSearchParams({
    firstName: "Teste",
    lastName: "Predeploy",
    email: uniqueEmail,
    whatsapp: "11999999999",
    source: "meetup_predeploy_check",
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
    `Meetup signup upstream failed with status ${response.status}`,
  );

  const body = await response.text();
  assert(
    body.length > 0,
    "Meetup signup upstream returned empty body",
  );
});
