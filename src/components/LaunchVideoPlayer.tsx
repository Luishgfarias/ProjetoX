import React, { memo } from "react";
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import type { Launch } from "../@types/launch";
import {
  DIRECT_VIDEO_URL_PATTERN,
  VIDEO_ASPECT_RATIO,
  YOUTUBE_APP_REFERRER,
  YOUTUBE_EMBED_ORIGIN,
  YOUTUBE_URL_PATTERNS,
} from "../constants/launchVideo";

type LaunchVideoPlayerProps = {
  videoUrl?: Launch["links"]["webcast"];
};

type LaunchVideoSource = Launch["links"]["webcast"];

function getYoutubeId(url: string) {
  for (const pattern of YOUTUBE_URL_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function isDirectVideoUrl(url: string) {
  return DIRECT_VIDEO_URL_PATTERN.test(url);
}

function getYoutubeEmbedUrl(url: string) {
  const youtubeId = getYoutubeId(url);

  if (!youtubeId) {
    return null;
  }

  const params = new URLSearchParams({
    playsinline: "1",
    rel: "0",
    origin: YOUTUBE_APP_REFERRER,
  });

  return `${YOUTUBE_EMBED_ORIGIN}/embed/${youtubeId}?${params.toString()}`;
}

function getVideoUri(videoUrl: LaunchVideoSource) {
  if (typeof videoUrl === "string") {
    return videoUrl;
  }

  if (typeof videoUrl === "number") {
    return Image.resolveAssetSource(videoUrl)?.uri ?? null;
  }

  if (typeof videoUrl === "object" && videoUrl?.assetId) {
    return Image.resolveAssetSource(videoUrl.assetId)?.uri ?? null;
  }

  if (typeof videoUrl === "object" && videoUrl?.uri) {
    return videoUrl.uri;
  }

  return null;
}

function hasLocalVideoAsset(videoUrl: LaunchVideoSource) {
  return (
    typeof videoUrl === "number" ||
    (typeof videoUrl === "object" && Boolean(videoUrl?.assetId))
  );
}

function escapeHtmlAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function getHtmlVideoSource(videoUri: string) {
  const escapedVideoUri = escapeHtmlAttribute(videoUri);

  return `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          html,
          body {
            background: #000;
            height: 100%;
            margin: 0;
            overflow: hidden;
            width: 100%;
          }

          video {
            background: #000;
            height: 100%;
            object-fit: contain;
            width: 100%;
          }
        </style>
      </head>
      <body>
        <video controls playsinline preload="metadata" src="${escapedVideoUri}"></video>
      </body>
    </html>
  `;
}

function LaunchVideoPlayerComponent({ videoUrl }: LaunchVideoPlayerProps) {
  const videoUri = getVideoUri(videoUrl ?? null);
  const youtubeEmbedUrl = videoUri ? getYoutubeEmbedUrl(videoUri) : null;
  const htmlVideoSource =
    videoUri &&
    !youtubeEmbedUrl &&
    (hasLocalVideoAsset(videoUrl ?? null) || isDirectVideoUrl(videoUri))
      ? getHtmlVideoSource(videoUri)
      : null;

  if (!videoUrl) {
    return null;
  }

  if (youtubeEmbedUrl) {
    return (
      <View className="mb-6">
        <Text className="mb-3 text-lg font-semibold text-app-text dark:text-app-text-dark">
          Vídeo do lançamento
        </Text>
        <View className="overflow-hidden rounded-lg border border-app-border bg-black dark:border-app-border-dark">
          <WebView
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            domStorageEnabled
            javaScriptEnabled
            mediaPlaybackRequiresUserAction={false}
            originWhitelist={["*"]}
            source={{
              uri: youtubeEmbedUrl,
              headers: {
                Referer: YOUTUBE_APP_REFERRER,
              },
            }}
            startInLoadingState
            style={styles.youtubeVideo}
          />
        </View>
      </View>
    );
  }

  if (!htmlVideoSource && videoUri) {
    return (
      <View className="mb-6">
        <Text className="mb-3 text-lg font-semibold text-app-text dark:text-app-text-dark">
          Vídeo do lançamento
        </Text>
        <Pressable
          accessibilityRole="link"
          className="overflow-hidden rounded-lg border border-app-border bg-app-primary active:opacity-90 dark:border-app-border-dark dark:bg-app-primary-dark"
          onPress={() => Linking.openURL(videoUri)}
        >
          <View className="aspect-video w-full items-center justify-center px-6">
            <Text className="text-center text-base font-semibold text-white dark:text-gray-950">
              Abrir vídeo do lançamento
            </Text>
          </View>
        </Pressable>
        <Text className="mt-2 text-sm text-app-muted dark:text-app-muted-dark">
          Não foi possível embutir este formato de vídeo.
        </Text>
      </View>
    );
  }

  if (!htmlVideoSource) {
    return null;
  }

  return (
    <View className="mb-6">
      <Text className="mb-3 text-lg font-semibold text-app-text dark:text-app-text-dark">
        Vídeo do lançamento
      </Text>
      <View className="overflow-hidden rounded-lg border border-app-border bg-black dark:border-app-border-dark">
        <WebView
          allowFileAccess
          allowFileAccessFromFileURLs
          allowUniversalAccessFromFileURLs
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          javaScriptEnabled
          mediaPlaybackRequiresUserAction={false}
          originWhitelist={["*"]}
          source={{ html: htmlVideoSource }}
          style={styles.video}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  video: {
    aspectRatio: VIDEO_ASPECT_RATIO,
    width: "100%",
  },
  youtubeVideo: {
    aspectRatio: VIDEO_ASPECT_RATIO,
    width: "100%",
  },
});

export const LaunchVideoPlayer = memo(LaunchVideoPlayerComponent);
