import React from 'react';

type VideoEmbedProps = {
    youtubeLink: string;
  };
  
  const VideoEmbed: React.FC<VideoEmbedProps> = ({ youtubeLink }) => {
    if (!youtubeLink) return null;
  
    const urlParams = new URL(youtubeLink).searchParams;
    const playlistId = urlParams.get('list');
    const videoId = urlParams.get('v') || '';
  
    const embedUrl = videoId
      ? `https://www.youtube.com/embed/${videoId}?list=${playlistId}`
      : `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
  
    return (
      <div className="w-full max-w-full sm:max-w-md md:max-w-lg mx-auto mb-4">
        <div className="relative pb-[56.25%] h-0">
          <iframe
            src={embedUrl}
            title="Playlist de YouTube"
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
  