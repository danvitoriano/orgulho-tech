function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertIncludes(source: string, snippet: string, label: string): void {
  assert(source.includes(snippet), `Missing ${label}: ${snippet}`);
}

const FORM_SECTION_FILE = new URL("./MeetupSignupForm.tsx", import.meta.url);
const MEETUP_PAGE_BLOCK = new URL(
  "../.deco/blocks/pages-Meetup-263984.json",
  import.meta.url,
);

Deno.test("MeetupSignupForm keeps inline background submit behavior", async () => {
  const source = await Deno.readTextFile(FORM_SECTION_FILE);

  assertIncludes(
    source,
    `id="meetup-signup-form-element"`,
    "form id used by inline script",
  );
  assertIncludes(
    source,
    `target={useBackgroundSubmit ? "meetup-signup-target" : "_blank"}`,
    "form target behavior",
  );
  assertIncludes(
    source,
    `id="meetup-signup-target"`,
    "hidden iframe target",
  );
  assertIncludes(
    source,
    `id="meetup-signup-submit-button"`,
    "submit button id",
  );
  assertIncludes(
    source,
    `id="meetup-signup-status"`,
    "inline status container",
  );
  assertIncludes(
    source,
    `showStatus("info", "Enviando cadastro...")`,
    "sending status message",
  );
  assertIncludes(
    source,
    `showStatus("success", "Cadastro feito!`,
    "success status message",
  );
  assertIncludes(
    source,
    `setTimeout(showButton, 5000)`,
    "button restore timeout",
  );
});

Deno.test("Meetup page block pins openInNewTab=false and actionUrl", async () => {
  const raw = await Deno.readTextFile(MEETUP_PAGE_BLOCK);
  const page = JSON.parse(raw) as {
    sections: Array<Record<string, unknown>>;
  };

  const signupSection = page.sections.find((section) =>
    section.__resolveType === "site/sections/MeetupSignupForm.tsx"
  );

  assert(signupSection, "MeetupSignupForm section should exist on /meetup page");
  assert(signupSection.openInNewTab === false, "openInNewTab must be false");
  assert(
    signupSection.actionUrl ===
      "https://script.google.com/macros/s/AKfycbxP70d6QcRpFntn3jahHyzqflk0ZTYYm-CyhWcF-TXfjzeRFFBzN6AGC2UiW66W0DoR/exec",
    "actionUrl must point to the current Google Script endpoint",
  );
});
