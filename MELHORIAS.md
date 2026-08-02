# 🚀 Plano de Melhorias - Anime House (Roadmap)

Este documento detalha as oportunidades de melhoria arquitetural, de interface e de código para o projeto **Anime House**. As melhorias estão divididas por categorias para facilitar a priorização e implementação.

---


## 🟡 Melhorias de UX/UI
- [ ] **Hero Banner na Homepage:** Criar um carrossel ou banner de destaque no topo da página inicial para exibir animes em alta, engajando o usuário logo na entrada.
- [ ] **Otimização do Player Mobile:** Melhorar a responsividade do player de vídeo. Controles essenciais, como volume e barra de progresso, precisam ser mais acessíveis em telas de toque pequenas.
- [ ] **Tema Claro (Light Mode):** Implementar um toggle para alternar entre Dark e Light Mode usando as classes do Tailwind CSS e salvando a preferência do usuário.

## 🟢 Performance e Dívida Técnica
- [ ] **Remoção de Font Awesome via CDN:** O carregamento via CDN bloqueia a renderização e reduz a pontuação do Lighthouse.
  - *Ação:* Migrar completamente para os pacotes `@fortawesome/react-fontawesome` já instalados no `package.json` ou usar ícones `lucide-react`.
- [x] **Gerenciamento de Memória (Player):** Revisar os hooks (`useEffect`) no componente de Player. Adicionar funções de *cleanup* (retorno no useEffect) para destruir instâncias do player ou listeners ao desmontar o componente, prevenindo vazamentos de memória (memory leaks).
## 🔵 Novas Funcionalidades e Engenharia
- [ ] **Sistema de Comentários:** Adicionar uma seção de comentários na página dos episódios para aumentar a retenção e interação da comunidade. Pode ser implementado de forma rápida com Disqus ou construído do zero.
- [ ] **Testes Automatizados:** Garantir a estabilidade da plataforma a longo prazo.
  - *Unitários:* Configurar Jest + React Testing Library para testar componentes isolados (ex: cards, botões).
  - *End-to-End (E2E):* Utilizar Playwright ou Cypress para testar os fluxos mais críticos, como a busca e o carregamento do player de vídeo.
- [ ] **Integração Contínua (CI/CD):** Criar um workflow no GitHub Actions para rodar testes, verificação de tipos (`tsc`) e linting (`eslint`) automaticamente em cada Pull Request, prevenindo que código quebrado vá para produção.
- [ ] **Internacionalização (i18n):** Preparar o app para múltiplos idiomas (ex: PT-BR, EN, ES) caso haja planos de expandir o alcance do projeto.

---

## ✅ Já Implementado / Resolvido
- [x] **Indicador de Link Ativo:** A navbar muda a cor do link ativo dinamicamente com base na rota atual.
- [x] **Seção de Personagens Duplicada:** Bug na página de detalhes corrigido.
- [x] **Link "Temporada" Hardcoded:** A navbar agora detecta o ano e a estação atual (Winter, Spring, Summer, Fall) dinamicamente.
- [x] **Configurações Inoperantes:** Os toggles de configurações agora funcionam e persistem corretamente no localStorage.
- [x] **Página 404 Personalizada:** Criada uma página 404 (Not Found) temática.
- [x] **Progressive Web App (PWA):** O arquivo `manifest.json` e as meta-tags já estão configurados para permitir a instalação do site no celular/desktop.
- [x] **Componente Next.js Image:** O componente `<Image />` já está sendo utilizado amplamente por toda a aplicação (Cards, Player, Sidebar, Hero, etc), garantindo otimização de imagens (WebP) e lazy loading nativo.
- [x] **Autenticação Real (NextAuth):** A integração com provedores sociais (Google) e a API da AniList via OAuth2 já está totalmente operacional.
- [x] **SEO e Open Graph Dinâmicos:** As rotas principais, como a página de detalhes de cada anime, já utilizam `generateMetadata` para criar tags exclusivas de compartilhamento social.
- [x] **Loading Skeletons:** Componentes de skeleton nativos adicionados nas listagens de episódios recentes e na rota `/lista` utilizando `loading.tsx` nativo do Next.js.
