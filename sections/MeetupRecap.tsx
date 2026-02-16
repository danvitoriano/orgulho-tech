export interface Props {
  eyebrow?: string;
  title?: string;
  description?: string;
  highlights?: string[];
  communitiesTitle?: string;
  communitiesDescription?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function MeetupRecap({
  eyebrow = "Como foi a última edição",
  title = "Meetup Orgulho Tech 2025 na FIAP",
  description =
    "No ano passado, durante a Semana da Parada SP, realizamos um encontro potente com o tema \"Envelhecer LGBT+ na Tecnologia\". Tivemos painéis inspiradores, troca real entre gerações e conexões que seguem vivas na comunidade.",
  highlights = [
    "Tema central: Envelhecer LGBT+ na tecnologia",
    "Encontro presencial na FIAP, em São Paulo",
    "Participação ativa da comunidade em debates e networking",
  ],
  communitiesTitle = "8 comunidades reconhecidas",
  communitiesDescription =
    "Também premiamos 8 comunidades com o troféu \"Você é um Orgulho Tech\", celebrando iniciativas que transformam o ecossistema de tecnologia com diversidade, inclusão e impacto social.",
  ctaLabel = "Assistir ao meetup anterior",
  ctaHref = "https://youtu.be/BbAVhm59g3g",
}: Props) {
  return (
    <section class="lg:container md:max-w-6xl lg:mx-auto mx-4 pb-10 lg:pb-16">
      <div class="border border-secondary rounded-2xl p-6 md:p-8 lg:p-10 space-y-8">
        <div class="space-y-3">
          <span class="badge badge-outline">{eyebrow}</span>
          <h2 class="text-3xl lg:text-4xl leading-tight">{title}</h2>
          <p class="text-base lg:text-lg leading-relaxed">{description}</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {highlights.map((item) => (
            <div class="rounded-xl border border-secondary p-4 bg-base-200/30">
              <p class="text-sm lg:text-base">{item}</p>
            </div>
          ))}
        </div>

        <div class="rounded-xl border border-secondary p-5 bg-base-200/40 space-y-2">
          <h3 class="text-xl font-semibold">{communitiesTitle}</h3>
          <p class="text-sm lg:text-base">{communitiesDescription}</p>
        </div>

        <div>
          <a
            href={ctaHref}
            target={ctaHref?.includes("http") ? "_blank" : "_self"}
            class="btn btn-outline"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
