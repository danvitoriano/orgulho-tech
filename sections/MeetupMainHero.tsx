export interface Props {
  title?: string;
  description?: string;
  dateInfo?: string;
  locationInfo?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  imageSrc?: string;
}

export default function MeetupMainHero({
  title = "Meetup Woman & Queer",
  description =
    "No mes internacional das mulheres, Orgulho Tech, Devs 40+ e Elas Programam se unem em Sao Paulo para um encontro presencial e online.",
  dateInfo = "19/3 (quinta), a partir das 19h",
  locationInfo = "Local em Sao Paulo sera divulgado em breve + transmissao online",
  primaryCtaLabel = "Ir para pagina do meetup",
  primaryCtaHref = "/meetup",
  imageSrc =
    "https://assets.decocache.com/orgulho-tech/95a15f39-29e8-49e2-a699-c39ac99918ae/clean_528238105.jpeg",
}: Props) {
  return (
    <section class="lg:container md:max-w-6xl lg:mx-auto mx-4 pt-10 lg:pt-14">
      <div class="rounded-[2rem] overflow-hidden border border-secondary bg-[#fff7eb]">
        <div class="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
          <div class="p-7 md:p-10 lg:p-12">
            <div class="inline-flex items-center gap-2 rounded-full border border-black/20 px-4 py-1 text-xs tracking-wide">
              WOMAN & QUEER TECH
            </div>

            <h1 class="mt-5 text-4xl md:text-5xl lg:text-6xl leading-[0.95] font-semibold">
              {title}
            </h1>

            <p class="mt-5 text-base md:text-lg leading-relaxed max-w-2xl">
              {description}
            </p>

            <div class="mt-6 flex flex-wrap gap-2">
              <span class="badge badge-lg border-0 bg-[#1d2a59] text-white whitespace-normal h-auto py-2 text-center">
                {dateInfo}
              </span>
              <span class="badge badge-lg border-0 bg-[#0f766e] text-white whitespace-normal h-auto py-2 text-center max-w-full">
                {locationInfo}
              </span>
            </div>

            <div class="mt-8">
              <a href={primaryCtaHref} class="btn btn-primary">
                {primaryCtaLabel}
              </a>
            </div>
          </div>

          <div class="relative min-h-[280px] lg:min-h-[420px] bg-[#1d2a59]">
            <img
              src={imageSrc}
              alt="Meetup Woman and Queer"
              class="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
