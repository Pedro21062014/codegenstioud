import { ProjectFile, AIProvider } from '../types';

export const generateCodeStreamWithDeepSeek = async (
  prompt: string,
  existingFiles: ProjectFile[],
  onChunk: (chunk: string) => void,
  model: string,
): Promise<string> => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        existingFiles,
        provider: AIProvider.DeepSeek,
        model: model,
      }),
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error?.message || `HTTP error! status: ${response.status}`);
      } catch (parseError) {
        console.error("Failed to parse error JSON:", parseError);
        throw new Error(`Erro da API DeepSeek: ${errorText}`);
      }
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunkText = decoder.decode(value, { stream: true });
      fullResponse += chunkText;
      onChunk(chunkText);
    }
    
    return fullResponse;

  } catch (error) {
    console.error("Error calling backend proxy for DeepSeek:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    const errorJson = JSON.stringify({
        message: `Ocorreu um erro: ${errorMessage}. Por favor, verifique o console do backend para mais detalhes.`,
        files: existingFiles
    });
    onChunk(errorJson);
    return errorJson;
  }
};