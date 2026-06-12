export function obtenerYoutubeId(url) {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return parsedUrl.pathname.split("/").filter(Boolean)[0] || "";
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (parsedUrl.pathname.startsWith("/embed/")) {
        return parsedUrl.pathname.split("/").filter(Boolean)[1] || "";
      }

      if (parsedUrl.pathname.startsWith("/shorts/")) {
        return parsedUrl.pathname.split("/").filter(Boolean)[1] || "";
      }

      return parsedUrl.searchParams.get("v") || "";
    }
  } catch {
    return "";
  }

  return "";
}

export function esYoutubeUrl(url) {
  return Boolean(obtenerYoutubeId(url));
}

export function construirYoutubeEmbedUrl(url) {
  const videoId = obtenerYoutubeId(url);

  if (!videoId) return "";

  return `https://www.youtube.com/embed/${videoId}`;
}
