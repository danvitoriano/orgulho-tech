import { Handlers } from "$fresh/server.ts";

const DEFAULT_SUCCESS_MESSAGE = "Cadastro realizado com sucesso.";
const DEFAULT_ERROR_MESSAGE =
  "Não foi possível enviar seu cadastro. Tente novamente.";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const renderAlert = (type: "success" | "error", message: string) =>
  `<div class="alert alert-${type} mt-2"><span>${escapeHtml(message)}</span></div>`;

export const handler: Handlers = {
  async POST(req) {
    try {
      const formData = await req.formData();

      const scriptUrl = String(formData.get("scriptUrl") ?? "");
      const firstName = String(formData.get("firstName") ?? "").trim();
      const lastName = String(formData.get("lastName") ?? "").trim();
      const email = String(formData.get("email") ?? formData.get("Value1") ?? "")
        .trim();
      const whatsapp = String(formData.get("whatsapp") ?? "").trim();
      const source = String(formData.get("source") ?? "site").trim();
      const successMessage = String(
        formData.get("successMessage") ?? DEFAULT_SUCCESS_MESSAGE,
      ).trim();
      const errorMessage = String(
        formData.get("errorMessage") ?? DEFAULT_ERROR_MESSAGE,
      ).trim();

      const successHtml = renderAlert("success", successMessage);
      const errorHtml = renderAlert("error", errorMessage);

      if (!scriptUrl || !email) {
        return new Response(errorHtml, {
          status: 400,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }

      const payload = new URLSearchParams({
        firstName,
        lastName,
        email,
        whatsapp,
        source,
      });

      const upstream = await fetch(scriptUrl, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: payload.toString(),
      });

      if (!upstream.ok) {
        return new Response(errorHtml, {
          status: 502,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }

      return new Response(successHtml, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    } catch {
      return new Response(renderAlert("error", DEFAULT_ERROR_MESSAGE), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
