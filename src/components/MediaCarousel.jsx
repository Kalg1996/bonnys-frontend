"use client";

import { useEffect } from "react";
import { buildAssetUrl } from "@/services/api";
import VideoPlayer from "@/components/VideoPlayer";

export default function MediaCarousel({
  id,
  imageUrl,
  videoUrl,
  imageAlt = "Imagen",
  variant = "card",
}) {
  const resolvedImageUrl = buildAssetUrl(imageUrl);
  const resolvedVideoUrl = buildAssetUrl(videoUrl);
  const hasImage = Boolean(resolvedImageUrl);
  const hasVideo = Boolean(resolvedVideoUrl);
  const isDetail = variant === "detail";

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  if (!hasImage && !hasVideo) return null;

  if (hasImage && !hasVideo) {
    return isDetail ? (
      <div className="detail-media-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolvedImageUrl}
          alt={imageAlt}
          className="detail-media-image"
        />
      </div>
    ) : (
      <div
        className="public-card-image media-carousel-single"
        style={{ backgroundImage: `url(${resolvedImageUrl})` }}
        role="img"
        aria-label={imageAlt}
      />
    );
  }

  if (!hasImage && hasVideo) {
    return (
      <div
        className={`media-carousel-single media-carousel-video p-2 ${
          isDetail ? "detail-media-video" : ""
        }`}
      >
        <VideoPlayer
          url={videoUrl}
          title={imageAlt}
          className="w-100 rounded"
        />
      </div>
    );
  }

  return (
    <div
      id={id}
      className={`carousel slide media-carousel ${
        isDetail ? "detail-media-carousel" : ""
      }`}
      data-bs-ride="false"
      data-bs-touch="true"
    >
      <div className="carousel-indicators">
        <button
          type="button"
          data-bs-target={`#${id}`}
          data-bs-slide-to="0"
          className="active"
          aria-current="true"
          aria-label="Imagen"
        />
        <button
          type="button"
          data-bs-target={`#${id}`}
          data-bs-slide-to="1"
          aria-label="Video"
        />
      </div>

      <div className="carousel-inner">
        <div className="carousel-item active">
          {isDetail ? (
            <div className="detail-media-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolvedImageUrl}
                alt={imageAlt}
                className="detail-media-image"
              />
            </div>
          ) : (
            <div
              className="public-card-image"
              style={{ backgroundImage: `url(${resolvedImageUrl})` }}
              role="img"
              aria-label={imageAlt}
            />
          )}
        </div>
        <div className="carousel-item">
          <div
            className={`media-carousel-video p-2 ${
              isDetail ? "detail-media-video" : ""
            }`}
          >
            <VideoPlayer
              url={videoUrl}
              title={imageAlt}
              className="w-100 rounded"
            />
          </div>
        </div>
      </div>

      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target={`#${id}`}
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true" />
        <span className="visually-hidden">Anterior</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target={`#${id}`}
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true" />
        <span className="visually-hidden">Siguiente</span>
      </button>
    </div>
  );
}
