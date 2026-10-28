import { useRef, useState } from "react";

function errorMessage(code: number) {
  if (code === 2) return "Não foi possível carregar o vídeo. Verifique sua conexão e tente novamente.";
  if (code === 3) return "Não foi possível reproduzir o vídeo. O arquivo pode estar danificado ou usar um formato incompatível.";
  if (code === 4) return "Este vídeo não pode ser reproduzido neste navegador ou formato.";
  return "Não foi possível reproduzir o vídeo.";
}

export function ProductVideo({ src, poster, label }: { src: string; poster?: string | null; label: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  function handleError(event: React.SyntheticEvent<HTMLVideoElement>) {
    const error = event.currentTarget.error;
    if (!error) return;
    console.error("Falha ao reproduzir vídeo", { src, code: error.code });
    setMessage(errorMessage(error.code));
  }
  function retry() {
    setMessage(null);
    videoRef.current?.load();
  }
  return <div className="relative h-full w-full">
    <video key={src} ref={videoRef} src={src} poster={poster ?? undefined} controls playsInline preload="metadata" aria-label={label} onError={handleError} className="h-full w-full object-contain" />
    {message && <div role="alert" className="absolute inset-x-2 bottom-2 z-30 max-h-full overflow-y-auto rounded-lg bg-card p-2 text-sm shadow-card">{message}<div className="mt-1 flex gap-3"><button type="button" onClick={retry} className="inline-flex min-h-11 items-center underline">Tentar novamente</button><a href={src} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline">Abrir vídeo original</a></div></div>}
  </div>;
}
