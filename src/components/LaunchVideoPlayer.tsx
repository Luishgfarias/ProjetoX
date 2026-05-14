import React, { memo } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import {
  useVideoPlayer,
  VideoView,
  type ContentType,
  type VideoSource,
} from "expo-video";
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

  if (typeof videoUrl === "object" && videoUrl?.uri) {
    return videoUrl.uri;
  }

  return null;
}

function getDirectVideoContentType(videoUri: string): ContentType {
  if (/\.m3u8(\?.*)?$/i.test(videoUri)) {
    return "hls";
  }

  if (/\.mpd(\?.*)?$/i.test(videoUri)) {
    return "dash";
  }

  return "progressive";
}

function getNativeVideoSource(
  videoUrl: LaunchVideoSource,
  videoUri: string | null,
): VideoSource {
  if (typeof videoUrl === "number") {
    return { assetId: videoUrl, contentType: "progressive" };
  }

  if (typeof videoUrl === "object" && typeof videoUrl?.assetId === "number") {
    return { assetId: videoUrl.assetId, contentType: "progressive" };
  }

  if (videoUri && isDirectVideoUrl(videoUri)) {
    return {
      uri: videoUri,
      contentType: getDirectVideoContentType(videoUri),
    };
  }

  return null;
}

function NativeVideoPlayer({ source }: { source: VideoSource }) {
  const player = useVideoPlayer(source);

  return (
    <VideoView
      contentFit="contain"
      fullscreenOptions={{ enable: true }}
      nativeControls
      player={player}
      style={styles.video}
      surfaceType="textureView"
    />
  );
}

function LaunchVideoPlayerComponent({ videoUrl }: LaunchVideoPlayerProps) {
  const videoUri = getVideoUri(videoUrl ?? null);
  const youtubeEmbedUrl = videoUri ? getYoutubeEmbedUrl(videoUri) : null;
  const nativeVideoSource = getNativeVideoSource(
    videoUrl ?? null,
    youtubeEmbedUrl ? null : videoUri,
  );

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

  if (!nativeVideoSource && videoUri) {
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

  if (!nativeVideoSource) {
    return null;
  }

  return (
    <View className="mb-6">
      <Text className="mb-3 text-lg font-semibold text-app-text dark:text-app-text-dark">
        Vídeo do lançamento
      </Text>
      <View className="overflow-hidden rounded-lg border border-app-border bg-black dark:border-app-border-dark">
        <NativeVideoPlayer source={nativeVideoSource} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  video: {
    aspectRatio: VIDEO_ASPECT_RATIO,
    backgroundColor: "#000",
    width: "100%",
  },
  youtubeVideo: {
    aspectRatio: VIDEO_ASPECT_RATIO,
    width: "100%",
  },
});

export const LaunchVideoPlayer = memo(LaunchVideoPlayerComponent);
