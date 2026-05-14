export const DIRECT_VIDEO_URL_PATTERN =
  /\.(mp4|m4v|mov|webm|m3u8|mpd)(\?.*)?$/i;

export const YOUTUBE_EMBED_ORIGIN = "https://www.youtube.com";
export const YOUTUBE_APP_REFERRER = "https://com.projetox.app";

export const YOUTUBE_URL_PATTERNS = [
  /youtu\.be\/([^?&/]+)/i,
  /youtube\.com\/watch\?.*v=([^?&]+)/i,
  /youtube\.com\/embed\/([^?&/]+)/i,
  /youtube\.com\/live\/([^?&/]+)/i,
  /youtube\.com\/shorts\/([^?&/]+)/i,
];

export const SCREEN_HORIZONTAL_PADDING = 32;
export const MIN_YOUTUBE_HEIGHT = 380;
export const MAX_YOUTUBE_HEIGHT = 560;
export const VIDEO_ASPECT_RATIO = 16 / 9;
