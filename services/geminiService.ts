import { GoogleGenAI } from "@google/genai";
import { ProjectFile, AIMode } from '../types';

const getSystemPrompt = (files: ProjectFile[], envVars: Record<string, string>, mode: AIMode): string => {
  const fileContent = files.map(file => `
--- FILE: ${file.name} ---
\`\`\`${file.language}
${file.content}
\`\`\`
`).join('\n');

  const envContent = Object.keys(envVars).length > 0
    ? `The following environment variables are available to the project via 'process.env.VARIABLE_NAME':\n${JSON.stringify(envVars, null, 2)}`
    : "No environment variables are currently set.";

  const basePrompt = `Você é um engenheiro full-stack sênior especialista em criar aplicações web completas, funcionais e esteticamente agradáveis.
- Seu objetivo principal é gerar todos os arquivos de código necessários com base no prompt do usuário. Você é proficiente em uma ampla gama de tecnologias web, incluindo HTML, CSS, JavaScript, TypeScript, React, Vue, Svelte, Node.js e muito mais.
- Sempre gere código completo e executável. Não use placeholders como "// seu código aqui".
- Para projetos web padrão, crie um 'index.html', um arquivo CSS para estilos (por exemplo, 'style.css'), e um arquivo JavaScript para lógica (por exemplo, 'script.js').
- Para projetos React, use componentes funcionais, TypeScript (.tsx) e hooks.
- Para estilização, você pode usar Tailwind CSS via CDN em index.html ou gerar arquivos CSS separados, o que for mais apropriado para a solicitação do usuário.
- A estrutura de arquivos deve ser lógica (por exemplo, components/, services/, assets/).
- Se um arquivo 'services/supabase.ts' existir, significa que o projeto está integrado com o Supabase. Você tem a capacidade de executar consultas SQL no banco de dados Supabase do usuário.
- COMANDO ESPECIAL: Se o prompt do usuário incluir a palavra "ia", você deve integrar um recurso de IA Gemini do lado do cliente no projeto. Para fazer isso:
  - 1. Crie um novo arquivo 'services/gemini.ts'. Este arquivo deve inicializar o cliente GoogleGenAI e exportar uma função para chamar o modelo Gemini.
  - 2. A chave de API para este serviço DEVE ser lida de uma variável de ambiente chamada 'GEMINI_API_KEY' (por exemplo, 'process.env.GEMINI_API_KEY').
  - 3. Em sua resposta JSON, você DEVE incluir o campo 'environmentVariables' e criar uma chave chamada 'GEMINI_API_KEY'. Defina seu valor como uma string vazia (por exemplo, "GEMINI_API_KEY": ""). O aplicativo irá preenchê-lo automaticamente com a chave do usuário.
  - 4. Atualize a UI e os arquivos de lógica do aplicativo para importar e usar o novo serviço Gemini, criando o recurso de IA solicitado pelo usuário.
- INTEGRAÇÃO - STRIPE: Se o usuário pedir para adicionar pagamentos ou mencionar Stripe, integre-o.
  - 1. Adicione a tag de script 'https://js.stripe.com/v3/' ao index.html.
  - 2. Crie um componente para lidar com o fluxo de checkout usando Stripe.js.
  - 3. Você DEVE incluir 'STRIPE_PUBLIC_KEY' e 'STRIPE_SECRET_KEY' no campo 'environmentVariables' de sua resposta JSON. O aplicativo irá preenchê-los automaticamente a partir das configurações do usuário. Use 'process.env.STRIPE_PUBLIC_KEY' no código frontend.
- INTEGRAÇÃO - NEON DB: Se o usuário pedir um backend com um banco de dados ou mencionar Neon, você pode usá-lo.
  - 1. Explique que você gerará código backend de espaço reservado que usa um banco de dados PostgreSQL.
  - 2. Você DEVE incluir 'NEON_CONNECTION_STRING' no campo 'environmentVariables' de sua resposta JSON. O aplicativo irá preenchê-lo.
  - 3. Gere código backend de exemplo (por exemplo, um servidor Express simples como um arquivo) que usa uma biblioteca como 'pg' para se conectar ao banco de dados usando 'process.env.NEON_CONNECTION_STRING'.
- INTEGRAÇÃO - MAPAS: Se o usuário pedir um mapa, integre o OpenStreetMap usando a biblioteca Leaflet.js.
  - 1. Adicione links CSS e JS do Leaflet ao index.html.
  - 2. Crie um componente que inicialize um mapa centralizado em um local padrão.
- IMPORTANTE: Você DEVE começar sua resposta com uma mensagem de "pensamento" curta e de uma linha explicando o que você está prestes a fazer, em português. Por exemplo: "Entendido. Criando um aplicativo de lista de tarefas com React e Tailwind." Após esta linha, você DEVE adicionar um separador '---' em uma nova linha. Em seguida, comece a resposta JSON principal.
- Você DEVE responder com um único objeto JSON válido e nada mais. Não envolva o JSON em backticks de markdown ou qualquer outro texto. O objeto JSON DEVE conter as chaves "message" e "files", e pode opcionalmente conter "summary", "environmentVariables" e "supabaseAdminAction".
  - "message": (string) Uma mensagem amigável e conversacional para o usuário, em português.
  - "files": (array) Um array de objetos de arquivo. Cada objeto de arquivo DEVE ter "name", "language" e "content".
  - "summary": (string, opcional) Uma string markdown resumindo os arquivos criados ou atualizados.
  - "environmentVariables": (object, opcional) Um objeto de variáveis de ambiente para definir. Para excluir uma variável, defina seu valor como null.
  - "supabaseAdminAction": (object, opcional) Para executar uma modificação de banco de dados (por exemplo, criar uma tabela), forneça um objeto com uma chave "query" contendo a instrução SQL a ser executada. Exemplo: { "query": "CREATE TABLE posts (id bigint primary key, title text);" }. Use isso SOMENTE para esquema de banco de dados ou manipulação de dados.

Current project files:
${fileContent.length > 0 ? fileContent : "Nenhum arquivo existe ainda."}

${envContent}
`;

  const agentPrompt = `Você é um agente de IA altamente capaz, projetado para planejar e executar tarefas para o usuário.
- Sua principal função é entender a intenção do usuário, dividir a tarefa em etapas executáveis e gerar o código necessário para cada etapa.
- Você tem acesso a todas as ferramentas e integrações disponíveis para o engenheiro full-stack.
- Ao responder, você DEVE seguir o formato JSON especificado, começando com uma mensagem de pensamento curta e um separador '---'.
- Seu objetivo é resolver o problema do usuário de forma autônoma, solicitando esclarecimentos apenas quando absolutamente necessário.
- Pense passo a passo e forneça o código completo para cada etapa.

Current project files:
${fileContent.length > 0 ? fileContent : "Nenhum arquivo existe ainda."}

${envContent}
`;

  return mode === AIMode.Agent ? agentPrompt : basePrompt;
};


export const generateCodeStreamWithGemini = async (
  prompt: string,
  existingFiles: ProjectFile[],
  envVars: Record<string, string>,
  onChunk: (chunk: string) => void,
  modelId: string,
  apiKey: string,
  mode: AIMode,
  attachments?: { data: string; mimeType: string }[]
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = getSystemPrompt(existingFiles, envVars, mode);

    const userParts: any[] = [{ text: prompt }];
    if (attachments && attachments.length > 0) {
        attachments.forEach(file => {
            userParts.push({
                inlineData: {
                    data: file.data,
                    mimeType: file.mimeType,
                },
            });
        });
    }

    const stream = await ai.models.generateContentStream({
        model: modelId || 'gemini-1.5-pro', // Default to gemini-1.5-pro if no modelId is provided
        // FIX: Removed `role: 'user'` from contents to align with the recommended format for single-turn, multi-part requests.
        contents: { parts: userParts },
        config: {
            systemInstruction,
            // Instructing for a plain text response as we will parse the thought and JSON manually
        },
    });

    let fullResponse = "";
    for await (const chunk of stream) {
      const chunkText = chunk.text;
      if (chunkText) {
          fullResponse += chunkText;
          onChunk(chunkText);
      }
    }
    
    return fullResponse;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    const errorJson = JSON.stringify({
        message: `Ocorreu um erro ao chamar a API do Gemini: ${errorMessage}. Por favor, verifique sua chave de API e a conexão com a internet.`,
        files: existingFiles
    });
    // We don't call onChunk here because the final error is handled in App.tsx
    // onChunk(errorJson);
    return errorJson;
  }
};

export const generateProjectName = async (
  prompt: string,
  apiKey: string
): Promise<string> => {
   try {
    const ai = new GoogleGenAI({ apiKey });
    const namePrompt = `Gere um nome de projeto criativo e curto de duas palavras (em PascalCase, sem espaços, como 'QuantumQuill') para o seguinte conceito: "${prompt}". Responda APENAS com o nome e nada mais.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: namePrompt
    });

    const projectName = response.text.trim().replace(/[^a-zA-Z0-9]/g, '');
    return projectName || "NovoProjeto";
  } catch (error) {
    console.error("Error generating project name:", error);
    return "NovoProjeto";
  }
};

export const generateImagesWithImagen = async (
  prompt: string,
  apiKey: string,
  numberOfImages: number,
  aspectRatio: string
): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt,
      config: {
        numberOfImages,
        outputMimeType: 'image/png',
        aspectRatio: aspectRatio as any,
      },
    });
    return response.generatedImages.map(img => img.image.imageBytes);
  } catch (error) {
    console.error("Error calling Imagen API:", error);
    throw error;
  }
};
