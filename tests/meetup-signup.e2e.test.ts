import { chromium } from "npm:playwright";

const BASE_URL = "http://127.0.0.1:8000";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function waitForServer(url: string, timeoutMs = 90_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.ok || res.status === 301 || res.status === 302) return;
    } catch {
      // server still booting
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`Preview server did not start in ${timeoutMs}ms`);
}

Deno.test("meetup signup swaps button for status and restores it after success", async () => {
  const preview = new Deno.Command(Deno.execPath(), {
    args: ["task", "preview"],
    stdout: "null",
    stderr: "null",
  }).spawn();

  try {
    await waitForServer(`${BASE_URL}/meetup`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/meetup`, { waitUntil: "domcontentloaded" });

    await page.locator('input[name="firstName"]').fill("Teste");
    await page.locator('input[name="lastName"]').fill("Automacao");
    await page.locator('input[name="email"]').fill(
      `teste.meetup.${Date.now()}@example.com`,
    );
    await page.locator('input[name="whatsapp"]').fill("11999999999");

    const pagesBeforeSubmit = context.pages().length;
    await page.locator('#meetup-signup-form-element button[type="submit"]').click();

    const sendingAlert = page.locator(
      '#meetup-signup-status .alert-info:has-text("Enviando cadastro...")',
    );
    await sendingAlert.waitFor({ timeout: 5_000 });

    const successAlert = page.locator(
      '#meetup-signup-status .alert-success:has-text("Cadastro feito!")',
    );
    await successAlert.waitFor({ timeout: 20_000 });

    await page.waitForTimeout(5_500);

    const pagesAfterSubmit = context.pages().length;
    assert(
      pagesAfterSubmit === pagesBeforeSubmit,
      "submit should not open a new tab/window",
    );
    assert(
      await page.locator("#meetup-signup-submit-button").isVisible(),
      "submit button should be visible again after success timeout",
    );
    assert(
      (await page.locator('input[name="firstName"]').inputValue()) === "",
      "firstName should be cleared after success",
    );
    assert(
      (await page.locator('input[name="lastName"]').inputValue()) === "",
      "lastName should be cleared after success",
    );
    assert(
      (await page.locator('input[name="email"]').inputValue()) === "",
      "email should be cleared after success",
    );
    assert(
      (await page.locator('input[name="whatsapp"]').inputValue()) === "",
      "whatsapp should be cleared after success",
    );

    await browser.close();
  } finally {
    try {
      preview.kill("SIGTERM");
    } catch {
      // preview process may have already stopped
    }
    await preview.status;
  }
});
