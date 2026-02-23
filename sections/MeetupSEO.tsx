import { Head } from "$fresh/runtime.ts";

export interface Props {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
}

export default function MeetupSEO({
  title = "Meetup Woman & Queer | Orgulho Tech",
  description =
    "Evento que reune as comunidades Orgulho Tech, Devs 40+ e Elas Programam. Dia 19/03, as 19h, com participacao presencial e online.",
  image = "https://www.orgulhotech.com.br/women-queer-tech-hero.png",
  canonical = "https://www.orgulhotech.com.br/meetup",
}: Props) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content="Orgulho Tech" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Head>
  );
}
