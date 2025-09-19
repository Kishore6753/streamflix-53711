"use client";

type Props = { youtubeKey: string };

export default function VideoPlayer({ youtubeKey }: Props) {
  if (!youtubeKey) return null;
  const url = `https://www.youtube.com/embed/${youtubeKey}?rel=0&modestbranding=1`;

  return (
    <div className="w-full aspect-video overflow-hidden rounded-xl border border-blue-100 bg-black">
      <iframe
        title="Trailer"
        src={url}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
