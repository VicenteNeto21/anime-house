<div align="center">

# 🏠 Anime House

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind-CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <br/>
  <img src="https://img.shields.io/badge/AniList-GraphQL-02A9FF?style=for-the-badge&logo=graphql&logoColor=white" alt="AniList" />
  <img src="https://img.shields.io/badge/Webtor.io-Streaming-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="Webtor" />
  <img src="https://img.shields.io/badge/Python-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
</p>

Uma plataforma de streaming e rastreamento de animes construída com foco em **performance**, **UI moderna** e **Streaming via Torrent** super rápido com integração profunda à **API AniList**.

</div>

---

## ✨ Funcionalidades Principais

- 🔍 **Exploração Completa:** Busca de animes por gênero, temporada, formato, status e ranking.
- 📺 **Player Inteligente e Estável:** Player `Webtor.io` embutido com suporte a Chromecast, legendas embutidas (OpenSubtitles) e algoritmo de prevenção de Crash (Navegação Nativa Imutável com GC delay de 400ms).
- 🏴‍☠️ **Agregador de Torrents Supremo:** Scraping simultâneo em 5 gigantes mundiais sem recarregar a tela:
  - Nyaa.si
  - NekoBT
  - AnimeTosho
  - The Pirate Bay (via apibay.org)
  - TokyoToshokan (Web Scraper nativo com Cheerio)
- 🎧 **Filtros Avançados de Áudio:** Busca categorizada por `Original/Legendado`, `Dublado (PT-BR)` ou `Multi-Audio`. Bandeiras dinâmicas carregadas via FlagCDN.
- 📊 **Integração AniList:** Sincronização automática de progresso (Assistindo, Completo, Na Fila) via login OAuth2.
- 📅 **Calendário de Lançamentos:** Guia visual de episódios da semana em tempo real.
- 🏆 **Rankings Oficiais:** Listas completas do Top 100 Animes Globais.
- 🎨 **Design Imersivo:** Interface Dark Mode premium com tipografia arrojada (Sora + Archivo Black), micro-interações e thumbnails otimizadas.
- ⚡ **Performance:** Imagens otimizadas (AVIF/WebP), Server Components, e layout responsivo.

---

## 🚀 Arquitetura e Stack

A plataforma é dividida nas seguintes camadas:

### 🌐 Frontend e Agregador Torrent (Next.js)
- **Framework**: Next.js 15 (App Router + Turbopack)
- **UI & Estilização**: React 19, Tailwind CSS v4, FontAwesome Icons, FlagCDN
- **State Management**: Context API + LocalStorage
- **Streaming de Torrent**: SDK Embed do `Webtor.io` gerenciado via Iframes Estáticos.
- **Integração de Dados e Scraping Nativo**:
  - `cheerio`: Extração de dados HTML do TokyoToshokan.
  - APIs Nativas: Nyaa, NekoBT, AnimeTosho, PirateBay.
  - AniList (GraphQL) - Catálogo principal e perfis de usuário
  - TMDB (REST) - Metadados extras e imagens
  - Kitsu (REST) - Fallbacks de dados
  - MAL (REST) - Enriquecimento de plataformas e popularidade

### ⚙️ Backend Legacy (Microserviço de Extração)
- **Linguagem**: Python 3
- **Framework**: FastAPI
- **Web Scraping**: Playwright (Stealth Mode) para extração limpa de links de streaming em servidores terceiros
- **Servidor**: Uvicorn

---

## 📦 Como Rodar Localmente

### 1. Clonar o Repositório

```bash
git clone https://github.com/VicenteNeto21/anime-house.git
cd anime-house
```

### 2. Configurar o Frontend (Next.js)

Instale as dependências e crie seu arquivo de ambiente:

```bash
npm install
cp .env.example .env.local
```

Preencha as seguintes chaves no `.env.local`:

| Variável | Descrição |
|----------|-----------|
| NEXT_PUBLIC_ANILIST_CLIENT_ID | Client ID do seu App no AniList |
| ANILIST_CLIENT_SECRET | Client Secret do seu App no AniList |
| NEXT_PUBLIC_ANILIST_REDIRECT_URL | URL de callback OAuth (ex: http://localhost:3000) |
| NEXT_PUBLIC_TMDB_API_KEY | Sua chave de API do TheMovieDB |
| NEXTAUTH_SECRET | Uma string aleatória segura para criptografia da sessão |
| NEXTAUTH_URL | A URL base do projeto (ex: http://localhost:3000) |
| MAL_CLIENT_ID | Client ID da API do MyAnimeList |

Inicie o servidor de desenvolvimento:

```bash
npm run dev
# O app estará disponível em http://localhost:3000
```

### 3. Configurar o Extrator (Python - Opcional)

Em um **novo terminal**, acesse a pasta do extrator e inicie o ambiente virtual (Caso utilize as rotas antigas de Web Scraping puro):

```bash
cd extractor
python -m venv venv

# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
playwright install chromium
uvicorn main:app --port 8000 --reload
```

---

## 📝 Deploy (Produção)

A arquitetura recomendada para deploy é hibrida:

1. **Frontend (Vercel)**
   - Conecte o repositório na [Vercel](https://vercel.com)
   - As rotas de API do Torrent Aggregator (Nyaa, PirateBay, TokyoToshokan) rodarão nativamente como Serverless Functions na Vercel.
   - Configure as variáveis de ambiente (atualize o NEXT_PUBLIC_ANILIST_REDIRECT_URL e NEXTAUTH_URL para o domínio real)
   - Adicione sua URL da Vercel na página de Developer do AniList em "Redirect URLs"

2. **Microserviço Extrator Python (Railway / Render / VPS)**
   - Hospede a pasta `/extractor` como um serviço Python.
   - Configure a variável `EXTRACTOR_SERVICE_URL` na Vercel apontando para este novo servidor.

---

## 🎨 Contribuindo

Pull requests são sempre bem-vindos! 

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça o push (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

<div align="center">
  <p>Feito com ❤️ pela comunidade Otaku.</p>
</div>
