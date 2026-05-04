# 🏠 Anime House — Documentação Técnica

Bem-vindo à documentação oficial do **Anime House**. Este documento serve como guia para desenvolvedores que desejam contribuir para o projeto ou entender sua arquitetura interna.

---

## 🚀 1. Visão Geral
O Anime House é uma plataforma moderna de streaming de animes construída com **Next.js 15+ (App Router)**. O site consome dados de múltiplas APIs externas (AniList, TMDB, Kitsu) e utiliza um sistema de "servidores" (scraping/resolução de links) para fornecer o conteúdo de vídeo.

---

## 🛠️ 2. Stack Tecnológica
- **Framework:** [Next.js](https://nextjs.org/) (React 19)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Ícones:** [Font Awesome 6](https://fontawesome.com/)
- **Gerenciamento de Estado:** React Context API & Hooks (useState, useEffect, useRef)
- **Fonts:** Inter (Google Fonts)

---

## 📂 3. Estrutura de Pastas
```text
src/
├── app/               # Rotas e Páginas (App Router)
│   ├── anime/[id]/    # Detalhes do Anime
│   ├── player/[id]/   # Player de Vídeo
│   ├── lista/         # Catálogo completo com filtros
│   ├── login/         # Autenticação (AniList OAuth)
│   └── globals.css    # Estilos globais e tokens de design
├── components/        # Componentes Reutilizáveis
│   ├── anime/         # Cards, Seções de Tendências, Rankings
│   ├── layout/        # Navbar, Footer
│   └── search/        # Modal de busca em tempo real
├── lib/               # Lógica de Integração (API Clients)
│   ├── api.ts         # Integração principal (AniList, TMDB, Kitsu)
│   ├── anroll.ts      # Integração específica para o servidor Anroll
│   └── history.ts     # Lógica de "Continuar Assistindo" (LocalStorage)
├── context/           # Contextos Globais (Biblioteca do Usuário)
└── hooks/             # Hooks customizados
```

---

## 🔌 4. Integrações e APIs

### **AniList API (GraphQL)**
É a fonte primária de dados. Usada para:
- Listagem de animes, detalhes, personagens e dubladores.
- Sistema de busca.
- Sincronização de progresso do usuário (OAuth2).

### **TMDB API**
Usada como ponte para encontrar IDs de mídia que alguns servidores de vídeo exigem (como BetterFlix).

### **Sistema de Player (Servidores)**
O projeto não hospeda vídeos. Ele resolve URLs de fontes externas em tempo real:
1. **Direto (AniPlay):** Tenta montar a URL baseada no título e episódio.
2. **Feral/Pixel:** Servidores MP4 de alta velocidade.
3. **Anroll:** Utiliza scraping dinâmico para obter iframes.
4. **BetterFlix:** Provedor externo via ID do TMDB.

---

## 🔑 5. Variáveis de Ambiente (.env)
O projeto requer as seguintes chaves:
- `NEXT_PUBLIC_ANILIST_CLIENT_ID`: ID da aplicação no AniList.
- `NEXT_PUBLIC_ANILIST_REDIRECT_URL`: URL de retorno do login.
- `ANILIST_CLIENT_SECRET`: Chave secreta (Server-side).
- `NEXT_PUBLIC_TMDB_API_KEY`: Chave para busca de IDs no TMDB.

---

## ⚡ 6. Comandos Disponíveis
- `npm run dev`: Inicia o servidor de desenvolvimento em `localhost:3000`.
- `npm run build`: Gera a build de produção otimizada.
- `npm run start`: Inicia o servidor de produção.
- `npm run lint`: Executa a verificação de erros no código.

---

## 🛠️ 7. Fluxo de Desenvolvimento Sugerido

### **Adicionar novo Servidor de Vídeo**
1. Vá até `src/lib/api.ts` ou crie um novo arquivo em `lib/`.
2. Implemente a lógica de resolução da URL.
3. Adicione o novo servidor no dropdown em `src/app/player/[id]/[ep]/page.tsx`.

### **Melhorar SEO**
O projeto utiliza o sistema de Metadata do Next.js. Para alterar títulos dinâmicos, edite a função `generateMetadata` dentro das páginas `page.tsx` das rotas.

---

## 🎨 8. Design System
- **Cores:** Fundo escuro (#0a0f1c), Acento Azul (#3b82f6).
- **Bordas:** Uso extensivo de `rounded-2xl` e `rounded-3xl` para um visual moderno.
- **Efeitos:** Backdrop-blur em modais e glassmorphism na Navbar.

---

## 📝 9. Contribuição
1. Crie uma branch para sua feature (`git checkout -b feature/nome-da-feature`).
2. Garanta que o TypeScript não aponte erros.
3. Teste a responsividade no mobile.
4. Faça o commit e abra um Pull Request.

---

---

## 🛠️ 10. Roadmap & Backlog (Plano de Melhorias)

Abaixo estão os problemas identificados e as melhorias planejadas para o projeto, organizadas por prioridade.

### 🔴 Bugs e Problemas Críticos
1. **✅ Seção de Personagens duplicada:** Resolvido. (Página de detalhes limpa).
2. **✅ Link "Temporada" hardcoded:** Resolvido. (Agora detecta ano e estação atual).
3. **✅ Configurações Inoperantes:** Resolvido. (Toggles persistem no localStorage).
4. **Auth Fake:** O formulário de email/senha no login não possui funcionalidade real.

### 🟡 Melhorias de UX/UI
5. **Hero Banner:** Falta um destaque visual impactante na homepage.
6. **Player Mobile:** Controles essenciais (volume, tempo) estão ocultos em telas pequenas.
7. **Loading Skeletons:** Uso de spinners genéricos ao invés de esqueletos de conteúdo.
8. **✅ Página 404:** Resolvido. (Criada página temática com o Zoro/Fantasma).
9. **Indicador de Link Ativo:** A navbar não indica visualmente em qual página o usuário está.

### 🟢 Performance & Técnico
10. **Font Awesome:** Carregado via CDN (bloqueia renderização).
11. **Cleanups no Player:** useEffects sem limpeza adequada, gerando possíveis memory leaks.
12. **Next.js Image:** Uso de `<img>` padrão em locais críticos como o Player e Sidebar.
13. **SEO Dinâmico:** Meta tags genéricas em todas as rotas.

### 🔵 Novas Funcionalidades
14. **Comentários:** Sistema de discussão por episódio.
15. **PWA:** Suporte para instalação em dispositivos móveis e desktop.
16. **Dark/Light Mode:** Implementação de suporte a tema claro.

---

*Última atualização: Maio de 2026*

