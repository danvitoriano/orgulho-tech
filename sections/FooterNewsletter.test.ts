function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertIncludes(source: string, snippet: string, label: string): void {
  assert(source.includes(snippet), `Missing ${label}: ${snippet}`);
}

const FOOTER_SECTION_FILE = new URL("./Footer.tsx", import.meta.url);
const FOOTER_BLOCK_FILE = new URL(
  "../.deco/blocks/Footer.json",
  import.meta.url,
);

Deno.test("Footer newsletter uses background submit directly to Google Script", async () => {
  const source = await Deno.readTextFile(FOOTER_SECTION_FILE);

  assertIncludes(
    source,
    `id="newsletter-form-element"`,
    "newsletter form id",
  );
  assertIncludes(
    source,
    `target="newsletter-signup-target"`,
    "newsletter form target",
  );
  assertIncludes(
    source,
    `name="source" value="newsletter_rodape"`,
    "newsletter source tag",
  );
  assertIncludes(
    source,
    `id="newsletter-submit-button"`,
    "newsletter submit button",
  );
  assertIncludes(
    source,
    `id="newsletter-status"`,
    "newsletter status container",
  );
  assertIncludes(
    source,
    `showStatus("info", "Enviando cadastro...")`,
    "newsletter sending status message",
  );
  assertIncludes(
    source,
    `showStatus("success", "E-mail cadastrado com sucesso na newsletter.")`,
    "newsletter success message",
  );
  assertIncludes(
    source,
    `setTimeout(showButton, 5000)`,
    "newsletter button restore timeout",
  );
  assert(
    !source.includes(`hx-post="/api/meetup-signup"`),
    "newsletter should not depend on /api/meetup-signup",
  );
});

Deno.test("Footer block keeps newsletter labels", async () => {
  const raw = await Deno.readTextFile(FOOTER_BLOCK_FILE);
  const footer = JSON.parse(raw) as {
    subscribe?: {
      title?: string;
      description?: string;
    };
  };

  assert(footer.subscribe, "Footer subscribe config should exist");
  assert(
    typeof footer.subscribe?.title === "string" &&
      footer.subscribe.title.length > 0,
    "Footer subscribe title should be present",
  );
  assert(
    typeof footer.subscribe?.description === "string" &&
      footer.subscribe.description.length > 0,
    "Footer subscribe description should be present",
  );
});
