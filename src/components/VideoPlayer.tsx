import React, { useState } from 'react';
import { ExternalLink, Play, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  videoKey: string;
  title: string;
}

export function VideoPlayer({ videoKey, title }: VideoPlayerProps) {
  const [hasError, setHasError] = useState(false);

  const youtubeUrl = `https://www.youtube.com/watch?v=${videoKey}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoKey}/maxresdefault.jpg`;

  const openInYouTube = () => {
    window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
  };

  // Siempre mostrar la opción de abrir en YouTube debido a las restricciones
  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${thumbnailUrl})` }}
      />
      <div className="absolute inset-0 bg-black/60 hover:bg-black/40 transition-colors" />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center text-white p-6">
          <div className="bg-red-600 hover:bg-red-700 rounded-full p-6 transition-all hover:scale-110 shadow-2xl mb-4 cursor-pointer" onClick={openInYouTube}>
            <Play className="h-12 w-12 text-white ml-1" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-sm opacity-90 mb-4">
            Ver tráiler en YouTube
          </p>
          <button
            onClick={openInYouTube}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center mx-auto"
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            Abrir en YouTube
          </button>
        </div>
      </div>
    </div>
  );
}