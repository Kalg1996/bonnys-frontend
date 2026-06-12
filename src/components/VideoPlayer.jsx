import { buildAssetUrl } from "@/services/api";
import { construirYoutubeEmbedUrl } from "@/utils/media";

export default function VideoPlayer({
  url,
  title = "Video",
  className = "",
  frameClassName = "",
  muted = false,
  controls = true,
}) {
  if (!url) return null;

  const youtubeEmbedUrl = construirYoutubeEmbedUrl(url);
  const sizeFrameClassName = className.includes("admin-table-video")
    ? "video-embed-table"
    : className.includes("admin-media-preview")
      ? "video-embed-admin-preview"
      : "";

  if (youtubeEmbedUrl) {
    return (
      <div className={`video-embed-frame ${sizeFrameClassName} ${frameClassName}`}>
        <iframe
          src={youtubeEmbedUrl}
          title={title}
          className={className}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <video
      controls={controls}
      preload="metadata"
      muted={muted}
      className={className}
    >
      <source src={buildAssetUrl(url)} />
    </video>
  );
}
