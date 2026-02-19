import { Handlers } from "$fresh/server.ts";

const IMAGE_PATH =
  "/Users/danvitoriano/development/orgulho-tech/static/women-queer-tech-hero.png";

export const handler: Handlers = {
  async GET() {
    const content = await Deno.readFile(IMAGE_PATH);
    return new Response(content, {
      headers: {
        "content-type": "image/png",
        "cache-control": "public, max-age=3600",
      },
    });
  },
};
