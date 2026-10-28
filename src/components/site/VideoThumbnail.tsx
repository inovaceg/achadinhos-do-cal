import { Play } from "lucide-react";
import { useState } from "react";

export function VideoThumbnail({ src, poster }: { src: string; poster: string | null }) {
  const [frameReady, setFrameReady] = useState(false);
  return <span className="relative block h-full w-full overflow-hidden bg-muted">
    {poster && <img src={poster} alt="" className={`absolute inset-0 h-full w-full object-cover ${frameReady ? "hidden" : ""}`} />}
    <video
      src={src}
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
      onLoadedMetadata={event => {
        const video = event.currentTarget;
        video.currentTime = Math.min(video.duration / 2 || 0.1, 0.1);
      }}
      onLoadedData={() => setFrameReady(true)}
      onSeeked={() => setFrameReady(true)}
      onError={() => setFrameReady(false)}
      className={`absolute inset-0 h-full w-full object-cover ${frameReady ? "" : "invisible"}`}
    />
    <span className="absolute inset-0 grid place-items-center text-white" aria-hidden="true"><span className="grid h-9 w-9 place-items-center rounded-full bg-black/60"><Play className="h-4 w-4 fill-current" /></span></span>
  </span>;
}
