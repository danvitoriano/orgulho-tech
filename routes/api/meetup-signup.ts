import { Handlers } from "$fresh/server.ts";

const SUCCESS_HTML =
  `<div class="alert alert-success mt-2"><span>Cadastro realizado com sucesso.</span></div>`;
const ERROR_HTML =
  `<div class="alert alert-error mt-2"><span>Não foi possível enviar seu cadastro. Tente novamente.</span></div>`;

export const handler: Handlers = {
  async POST(req) {
    try {
      const formData = await req.formData();

      const scriptUrl = String(formData.get("scriptUrl") ?? "");
      const firstName = String(formData.get("firstName") ?? "").trim();
      const lastName = String(formData.get("lastName") ?? "").trim();
      const email = String(formData.get("email") ?? "").trim();
      const whatsapp = String(formData.get("whatsapp") ?? "").trim();

      if (!scriptUrl || !firstName || !lastName || !email || !whatsapp) {
        return new Response(ERROR_HTML, {
          status: 400,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }

      const payload = new URLSearchParams({
        firstName,
        lastName,
        email,
        whatsapp,
      });

      const upstream = await fetch(scriptUrl, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: payload.toString(),
      });

      if (!upstream.ok) {
        return new Response(ERROR_HTML, {
          status: 502,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }

      return new Response(SUCCESS_HTML, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    } catch {
      return new Response(ERROR_HTML, {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
