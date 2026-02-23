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
                Preencha seus dados para receber informações quando as inscrições abrirem.
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
              id="meetup-signup-form"
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
                  name={whatsappFieldName}
                  required
                  class="input input-bordered w-full"
                  placeholder="(11) 99999-9999"
                />
              </label>

              <div class="md:col-span-2 pt-2">
                <button type="submit" class="btn btn-primary w-full">
                  {submitLabel}
                </button>
                <p class="text-xs opacity-80 mt-2">
                  Este cadastro não garante vaga no meetup. Ele serve para avisar quando as inscrições forem abertas.
                </p>
              </div>
              {useBackgroundSubmit && (
                <div
                  id="meetup-signup-feedback"
                  class="md:col-span-2 text-sm"
                  aria-live="polite"
                />
              )}
            </form>
            {useBackgroundSubmit && (
              <script
                dangerouslySetInnerHTML={{
                  __html:
                    `(() => {
  const form = document.getElementById("meetup-signup-form");
  const iframe = document.getElementById("meetup-signup-target");
  const feedback = document.getElementById("meetup-signup-feedback");
  if (!(form instanceof HTMLFormElement) || !(iframe instanceof HTMLIFrameElement) || !(feedback instanceof HTMLElement)) return;

  let isSubmitting = false;
  let timeoutId = null;

  const setMessage = (type, message) => {
    feedback.innerHTML = '<div class="alert alert-' + type + ' mt-2"><span>' + message + '</span></div>';
  };

  form.addEventListener("submit", () => {
    isSubmitting = true;
    setMessage("info", "Enviando cadastro...");

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (!isSubmitting) return;
      isSubmitting = false;
      setMessage("error", "Nao foi possivel enviar seu cadastro. Tente novamente.");
    }, 15000);
  });

  iframe.addEventListener("load", () => {
    if (!isSubmitting) return;
    isSubmitting = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    form.reset();
    setMessage("success", "Cadastro feito! Vamos te avisar quando as inscricoes abrirem.");
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
