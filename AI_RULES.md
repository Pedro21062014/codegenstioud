# Regras de Desenvolvimento de IA para Codegen Studio

Este documento descreve a pilha de tecnologia e as diretrizes para o desenvolvimento de novas funcionalidades e modificações no Codegen Studio.

## Pilha de Tecnologia

O Codegen Studio é construído com as seguintes tecnologias principais:

*   **Frontend Framework**: React (com componentes funcionais e Hooks).
*   **Linguagem**: TypeScript para todo o código-fonte.
*   **Estilização**: Tailwind CSS para todos os estilos, garantindo um design responsivo e consistente.
*   **Build Tool**: Vite para o ambiente de desenvolvimento e build de produção.
*   **Gerenciamento de Estado**: `useState`, `useEffect`, `useCallback` do React e um hook `useLocalStorage` personalizado.
*   **Roteamento**: React Router para navegação no lado do cliente.
*   **Componentes UI**: Utiliza a biblioteca shadcn/ui para componentes de interface de usuário pré-construídos.
*   **Ícones**: Lucide React para ícones, complementado por ícones SVG personalizados.
*   **Autenticação e Banco de Dados**: Supabase para autenticação de usuários e interações com o banco de dados.
*   **Integração de Pagamentos**: Stripe para processamento de pagamentos.
*   **Mapeamento**: OpenStreetMap via biblioteca Leaflet.js para funcionalidades de mapa interativas.
*   **Banco de Dados (PostgreSQL)**: Neon para integração com bancos de dados PostgreSQL serverless (geralmente via funções de backend).
*   **Funções Serverless**: Netlify Functions para lógica de backend e proxies de API.
*   **Geração de Imagens**: Google Imagen (via API Gemini) para geração de imagens.
*   **Geração de Código AI**: Integração com Google Gemini, OpenAI, DeepSeek, Claude, Kimi, ZAI e Qwen (via OpenRouter API) para geração de código.
*   **Arquivamento de Projeto**: JSZip para compactar e baixar arquivos de projeto no lado do cliente.
*   **Transpilação em Tempo de Execução**: Babel Standalone para transpilação de código no navegador para a visualização ao vivo.

## Regras de Uso de Bibliotecas

Para manter a consistência e a eficiência, siga estas regras ao usar bibliotecas:

*   **UI/UX**:
    *   **React**: Use React para construir todos os componentes de interface do usuário e páginas.
    *   **Tailwind CSS**: Sempre use classes do Tailwind CSS para estilização. Evite CSS inline ou arquivos CSS personalizados, a menos que seja estritamente necessário e justificado.
    *   **shadcn/ui**: Prefira os componentes pré-construídos do shadcn/ui sempre que possível para elementos comuns da UI. Se um componente shadcn/ui não atender às suas necessidades, crie um novo componente personalizado com Tailwind.
    *   **Lucide React**: Use Lucide React para ícones. Se um ícone específico não estiver disponível, você pode adicionar um SVG personalizado em `components/Icons.tsx`.
*   **Dados e Backend**:
    *   **Supabase**: Use o cliente Supabase exportado de `services/supabase.ts` para todas as operações de autenticação e banco de dados. Não inicialize o cliente novamente.
    *   **Neon**: Para interações com bancos de dados PostgreSQL, use a string de conexão do Neon em funções de backend (serverless) com uma biblioteca como `pg`.
*   **Integrações Externas**:
    *   **Stripe**: Para funcionalidades de pagamento, use a biblioteca Stripe.js (carregada via CDN) e as funções auxiliares em `services/stripeService.ts`.
    *   **OpenStreetMap/Leaflet.js**: Para mapas, inclua os arquivos CSS e JS do Leaflet.js no `index.html` e use a API do Leaflet para criar e manipular mapas.
*   **Geração de Conteúdo AI**:
    *   **Google Gemini (`@google/genai`)**: Use esta biblioteca para todas as interações com o modelo Gemini, incluindo geração de texto, imagens e nomes de projeto.
    *   **OpenAI, DeepSeek, Claude, Kimi, ZAI, Qwen**: Para interações com esses modelos, utilize as funções de serviço correspondentes em `services/` que se comunicam com o proxy de backend (`/api/generate`).
*   **Utilitários**:
    *   **JSZip**: Use a biblioteca JSZip para criar e manipular arquivos ZIP no lado do cliente (por exemplo, para download de projetos).
    *   **Babel Standalone**: Esta biblioteca é usada internamente para transpilação de código na visualização ao vivo; não é para uso direto em novos componentes.
*   **Roteamento**:
    *   **React Router**: Mantenha as definições de rota no arquivo `src/App.tsx`.

Lembre-se de manter o código simples, elegante e focado na solicitação do usuário, evitando superengenharia.