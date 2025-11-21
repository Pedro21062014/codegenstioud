import React, { useState } from 'react';
import { CloseIcon, ImageIcon, SparklesIcon, SaveIcon } from './Icons';

interface ImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  geminiApiKey: string;
}

const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];

export const ImageStudioModal: React.FC<ImageStudioModalProps> = ({ isOpen, onClose, geminiApiKey }) => {
  const [prompt, setPrompt] = useState('');
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [aspectRatio, setAspectRatio] = useState("1:1");

  React.useEffect(() => {
    if (isOpen) {
      setPrompt('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#FFF8F0] rounded-lg shadow-xl w-full max-w-4xl p-6 border border-var-border-default animate-slideInUp flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <ImageIcon /> Gerador de Imagem AI
          </h2>
          <button onClick={onClose} className="p-1 rounded-md text-gray-600 hover:bg-gray-200">
            <CloseIcon />
          </button>
        </div>

        <div className="flex-grow flex gap-6 overflow-hidden">
          {/* Controls */}
          <div className="w-1/3 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Prompt</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Ex: Um robô fofo segurando um skate vermelho, estilo de arte digital."
                className="w-full p-2 h-32 bg-white border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nº de Imagens</label>
              <input
                type="number"
                min="1"
                max="4"
                value={numberOfImages}
                onChange={e => setNumberOfImages(parseInt(e.target.value))}
                className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Proporção</label>
              <select
                value={aspectRatio}
                onChange={e => setAspectRatio(e.target.value)}
                className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-800"
              >
                {aspectRatios.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button
              disabled
              className="w-full mt-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
            >
              <SparklesIcon /> Em Breve
            </button>
            <p className="text-gray-600 text-xs text-center mt-2">
              Funcionalidade de geração de imagens em desenvolvimento
            </p>
          </div>

          {/* Image Display */}
          <div className="w-2/3 bg-gray-100 rounded-lg p-4 overflow-y-auto">
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ImageIcon />
              <p className="mt-2">Gerador de imagens em breve!</p>
              <p className="text-sm mt-1">Esta funcionalidade estará disponível em uma atualização futura.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
