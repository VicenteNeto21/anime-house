# 🏠 Anime House

Plataforma de streaming e rastreamento de animes construída com **Next.js 16**, **React 19** e integração com a **API AniList**.

## ✨ Funcionalidades

- 🔍 Busca e exploração de animes (por gênero, temporada, ranking)
- 📺 Player integrado com múltiplos servidores de streaming
- 📊 Sincronização de progresso com AniList (login OAuth)
- 📅 Calendário de lançamentos semanais
- 📋 Gerenciamento de lista pessoal (Assistindo, Completo, Na Fila, etc.)
- 🏆 Top 100 animes
- 🎨 Interface dark com design flat e responsivo

## 🚀 Stack

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Frontend**: React 19, Tailwind CSS 4
- **APIs**: AniList GraphQL, TMDB, Kitsu
- **Auth**: AniList OAuth2
- **Deploy**: Vercel

## 📦 Setup Local

```bash
# Clonar
git clone https://github.com/VicenteNeto21/anime-house.git
cd anime-house

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Preencher as variáveis no .env.local

# Rodar em desenvolvimento
npm run dev
```

## 🌐 Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_ANILIST_CLIENT_ID` | Client ID do AniList OAuth |
| `ANILIST_CLIENT_SECRET` | Secret do AniList OAuth |
| `NEXT_PUBLIC_ANILIST_REDIRECT_URL` | URL de redirect (usar domínio da Vercel em produção) |
| `NEXT_PUBLIC_TMDB_API_KEY` | API Key do TMDB |

## 📝 Deploy na Vercel

1. Conecte o repositório GitHub na [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente no painel
3. Atualize `NEXT_PUBLIC_ANILIST_REDIRECT_URL` para o domínio Vercel
4. Deploy automático em cada push para `main`
