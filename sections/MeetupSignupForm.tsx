export interface Props {
  title?: string;
  description?: string;
  submitLabel?: string;
  actionUrl: string;
  method?: "POST" | "GET";
  firstNameFieldName?: string;
  lastNameFieldName?: string;
  emailFieldName?: string;
  whatsappFieldName?: string;
  openInNewTab?: boolean;
}

export default function MeetupSignupForm({
  title = "Meetup Woman & Queer",
  description =
    "Um encontro que vai reunir as comunidades Orgulho Tech, Devs 40+ e Elas Programam no Mês Internacional das Mulheres, em São Paulo, presencial e online. Cadastre-se para receber informações quando as inscrições abrirem.",
  submitLabel = "Quero receber aviso",
  actionUrl = "https://script.google.com/macros/s/SEU_ENDPOINT/exec",
  method = "POST",
  firstNameFieldName = "firstName",
  lastNameFieldName = "lastName",
  emailFieldName = "email",
  whatsappFieldName = "whatsapp",
  openInNewTab = true,
}: Props) {
  const useBackgroundSubmit = !openInNewTab;

  return (
    <section
      id="meetup-signup-form"
      class="lg:container md:max-w-6xl lg:mx-auto mx-4 py-10 lg:py-16"
    >
      <div class="border border-secondary rounded-2xl overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <div class="p-6 md:p-8 lg:p-10 space-y-4">
            <span class="badge badge-outline">MEETUP 2026</span>
            <h1 class="text-3xl lg:text-5xl leading-tight font-semibold">
              {title}
            </h1>
            <p class="text-base lg:text-lg leading-relaxed">{description}</p>
            <div class="flex flex-wrap gap-2 pt-2">
              <span class="badge badge-lg">19/3 (quinta)</span>
              <span class="badge badge-lg">A partir das 19h</span>
              <span class="badge badge-lg whitespace-normal h-auto py-2 text-center max-w-full">
                Local em São Paulo em breve
              </span>
              <span class="badge badge-lg">Presencial + Online</span>
              <span class="badge badge-lg">Mês Internacional das Mulheres</span>
            </div>
          </div>

          <div class="p-6 md:p-8 lg:p-10 bg-base-200/40">
            <div class="space-y-1 mb-5">
              <h2 class="text-2xl font-semibold">Inscrição</h2>
              <p class="text-sm opacity-80">
                Preencha seus dados para receber informações quando as
                inscrições abrirem.
              </p>
            </div>

            {useBackgroundSubmit && (
              <iframe
                name="meetup-signup-target"
                id="meetup-signup-target"
                class="hidden"
                title="Envio de inscricao meetup"
              />
            )}
            <form
              id="meetup-signup-form-element"
              action={actionUrl}
              method={method}
              target={useBackgroundSubmit ? "meetup-signup-target" : "_blank"}
              class="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <input type="hidden" name="source" value="meetup_pagina" />
              <label class="form-control w-full">
                <span class="label-text mb-1">Nome</span>
                <input
                  type="text"
                  name={firstNameFieldName}
                  required
                  class="input input-bordered w-full"
                  placeholder="Seu nome"
                />
              </label>

              <label class="form-control w-full">
                <span class="label-text mb-1">Sobrenome</span>
                <input
                  type="text"
                  name={lastNameFieldName}
                  required
                  class="input input-bordered w-full"
                  placeholder="Seu sobrenome"
                />
              </label>

              <label class="form-control w-full md:col-span-2">
                <span class="label-text mb-1">E-mail</span>
                <input
                  type="email"
                  name={emailFieldName}
                  required
                  class="input input-bordered w-full"
                  placeholder="você@exemplo.com"
                />
              </label>

              <label class="form-control w-full md:col-span-2">
                <span class="label-text mb-1">WhatsApp</span>
                <input
                  type="tel"
                  id="meetup-whatsapp-input"
                  name={whatsappFieldName}
                  required
                  class="input input-bordered w-full"
                  placeholder="(11) 99999-9999"
                />
              </label>

              <div class="md:col-span-2 pt-2">
                <div id="meetup-signup-action" class="w-full">
                  <button
                    id="meetup-signup-submit-button"
                    type="submit"
                    class="btn btn-primary w-full"
                  >
                    {submitLabel}
                  </button>
                  {useBackgroundSubmit && (
                    <div
                      id="meetup-signup-status"
                      class="hidden"
                      aria-live="polite"
                    />
                  )}
                </div>
                <p class="text-xs opacity-80 mt-2">
                  Este cadastro não garante vaga no meetup. Ele serve para
                  avisar quando as inscrições forem abertas.
                </p>
              </div>
            </form>
            {useBackgroundSubmit && (
              <script
                dangerouslySetInnerHTML={{
                  __html: `(() => {
  const form = document.getElementById("meetup-signup-form-element");
  const iframe = document.getElementById("meetup-signup-target");
  const submitButton = document.getElementById("meetup-signup-submit-button");
  const status = document.getElementById("meetup-signup-status");
  if (
    !(form instanceof HTMLFormElement) ||
    !(iframe instanceof HTMLIFrameElement) ||
    !(submitButton instanceof HTMLButtonElement) ||
    !(status instanceof HTMLElement)
  ) return;

  let isSubmitting = false;
  let submitTimeoutId = null;
  let restoreTimeoutId = null;
  const whatsappInput = document.getElementById("meetup-whatsapp-input");

  const showButton = () => {
    submitButton.classList.remove("hidden");
    submitButton.disabled = false;
    status.classList.add("hidden");
    status.innerHTML = "";
  };

  const showStatus = (type, message) => {
    submitButton.classList.add("hidden");
    status.classList.remove("hidden");
    status.innerHTML = '<div class="alert alert-' + type + '"><span>' + message + '</span></div>';
  };

  const formatWhatsapp = (rawValue) => {
    const digits = rawValue.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits.length ? '(' + digits : '';
    if (digits.length <= 7) return '(' + digits.slice(0, 2) + ') ' + digits.slice(2);
    return '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 7) + '-' + digits.slice(7);
  };

  if (whatsappInput instanceof HTMLInputElement) {
    whatsappInput.addEventListener("input", () => {
      whatsappInput.value = formatWhatsapp(whatsappInput.value);
    });
  }

  form.addEventListener("submit", (event) => {
    if (isSubmitting) {
      event.preventDefault();
      return;
    }

    isSubmitting = true;
    showStatus("info", "Enviando cadastro...");

    if (submitTimeoutId) clearTimeout(submitTimeoutId);
    if (restoreTimeoutId) clearTimeout(restoreTimeoutId);

    submitTimeoutId = setTimeout(() => {
      if (!isSubmitting) return;
      isSubmitting = false;
      showStatus("error", "Nao foi possivel enviar seu cadastro. Tente novamente.");
      restoreTimeoutId = setTimeout(showButton, 5000);
    }, 15000);
  });

  iframe.addEventListener("load", () => {
    if (!isSubmitting) return;
    isSubmitting = false;
    if (submitTimeoutId) {
      clearTimeout(submitTimeoutId);
      submitTimeoutId = null;
    }
    form.reset();
    showStatus("success", "Cadastro feito! Vamos te avisar quando as inscricoes abrirem.");
    restoreTimeoutId = setTimeout(showButton, 5000);
  });
})();`,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
