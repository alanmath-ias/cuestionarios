import React from 'react';

type VideoEmbedProps = {
  youtubeLink: string;
};

const VideoEmbed: React.FC<VideoEmbedProps> = ({ youtubeLink }) => {
  if (!youtubeLink) return null;

  const url = youtubeLink.trim();

  // Extraer videoId y playlistId con regex para distintos formatos
  const videoIdMatch = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
  const playlistIdMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);

  const videoId = videoIdMatch ? videoIdMatch[1] : null;
  const playlistId = playlistIdMatch ? playlistIdMatch[1] : null;

  let embedUrl = '';

  if (videoId) {
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
    if (playlistId) {
      embedUrl += `?list=${playlistId}`;
    }
  } else if (playlistId) {
    embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
  } else {
    // No video ni playlist válido
    return (
      <div className="text-center text-red-600">
        URL de video inválida o no soportada: <br /> {youtubeLink}
      </div>
    );
  }

  // DEBUG: para ver en consola lo que genera
  console.log('VideoEmbed -> embedUrl:', embedUrl);

  return (
    <div className="w-full h-full">
      <div className="relative pb-[56.25%] h-0">
        <iframe
          src={embedUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full rounded-lg"
        ></iframe>
      </div>
    </div>
  );
};

export default VideoEmbed;
