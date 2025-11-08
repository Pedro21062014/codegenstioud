import { ProjectFile } from '../types';

declare const JSZip: any;

export const createProjectZip = async (files: ProjectFile[]): Promise<Blob> => {
  if (typeof JSZip === 'undefined') {
    throw new Error('A biblioteca JSZip não foi carregada.');
  }
  
  const zip = new JSZip();

  files.forEach(file => {
    zip.file(file.name, file.content);
  });

  return zip.generateAsync({ type: 'blob' });
};


export const getProjectSize = async (files: ProjectFile[]): Promise<number> => {
  try {
    const zipBlob = await createProjectZip(files);
    return zipBlob.size;
  } catch (error) {
    console.error("Error calculating project size:", error);
    return 0;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const downloadProjectAsZip = async (files: ProjectFile[], projectName: string = 'ai-codegen-project') => {
  try {
    const zipBlob = await createProjectZip(files);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `${projectName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Error creating zip file:", error);
    const message = error instanceof Error ? error.message : "Ocorreu um erro desconhecido ao criar o arquivo zip.";
    alert(message);
  }
};
