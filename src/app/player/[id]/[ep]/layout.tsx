import { Metadata } from 'next';
import { AniListAPI } from '@/lib/api';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; ep: string }>;
}): Promise<Metadata> {
  const { id, ep } = await params;
  const animeIdNum = parseInt(id.split('-')[0], 10);
  const anime = !isNaN(animeIdNum) ? await AniListAPI.getDetails(animeIdNum.toString()) : null;

  if (!anime) {
    return { title: 'Assistir Anime Online | Anime House' };
  }

  return {
    title: `${anime.title} - Episódio ${ep} Online | Anime House`,
    description: `Assista ao episódio ${ep} de ${anime.title} em alta definição no Anime House.`,
    openGraph: {
      title: `${anime.title} - Episódio ${ep} | Anime House`,
      description: `Assista ${anime.title} Episódio ${ep} no Anime House.`,
      images: [anime.banner || anime.poster],
    },
  };
}

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
