import React, { memo } from "react";
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { WebView } from "react-native-webview";
import {
  DIRECT_VIDEO_URL_PATTERN,
  MAX_YOUTUBE_HEIGHT,
  MIN_YOUTUBE_HEIGHT,
  SCREEN_HORIZONTAL_PADDING,
  VIDEO_ASPECT_RATIO,
  YOUTUBE_MOBILE_ORIGIN,
  YOUTUBE_URL_PATTERNS,
} from "../constants/launchVideo";

type LaunchVideoPlayerProps = {
  videoUrl?: string | null;
};

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

function getYoutubeWatchUrl(url: string) {
  const youtubeId = getYoutubeId(url);

  if (!youtubeId) {
    return null;
  }

  return `${YOUTUBE_MOBILE_ORIGIN}/watch?v=${youtubeId}`;
}

function LaunchVideoPlayerComponent({ videoUrl }: LaunchVideoPlayerProps) {
  const { width } = useWindowDimensions();
  const source = videoUrl && isDirectVideoUrl(videoUrl) ? videoUrl : null;
  const player = useVideoPlayer(source);
  const youtubeHeight = Math.min(
    MAX_YOUTUBE_HEIGHT,
    Math.max(MIN_YOUTUBE_HEIGHT, width - SCREEN_HORIZONTAL_PADDING),
  );

  if (!videoUrl) {
    return null;
  }

  const youtubeWatchUrl = getYoutubeWatchUrl(videoUrl);

  if (youtubeWatchUrl) {
    return (
      <View className="mb-6">
        <Text className="mb-3 text-lg font-semibold text-gray-950">
          Vídeo do lançamento
        </Text>
        <View className="overflow-hidden rounded-lg border border-gray-200 bg-black">
          <WebView
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            domStorageEnabled
            javaScriptEnabled
            mediaPlaybackRequiresUserAction={false}
            originWhitelist={["*"]}
            source={{ uri: youtubeWatchUrl }}
            startInLoadingState
            style={[styles.youtubeVideo, { height: youtubeHeight }]}
          />
        </View>
      </View>
    );
  }

  if (!source) {
    return (
      <View className="mb-6">
        <Text className="mb-3 text-lg font-semibold text-gray-950">
          Vídeo do lançamento
        </Text>
        <Pressable
          accessibilityRole="link"
          className="overflow-hidden rounded-lg border border-gray-200 bg-gray-950 active:opacity-90"
          onPress={() => Linking.openURL(videoUrl)}
        >
          <View className="aspect-video w-full items-center justify-center px-6">
            <Text className="text-center text-base font-semibold text-white">
              Abrir vídeo do lançamento
            </Text>
          </View>
        </Pressable>
        <Text className="mt-2 text-sm text-gray-600">
          Não foi possível embutir este formato de vídeo.
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-6">
      <Text className="mb-3 text-lg font-semibold text-gray-950">
        Vídeo do lançamento
      </Text>
      <View className="overflow-hidden rounded-lg border border-gray-200 bg-black">
        <VideoView
          allowsFullscreen
          contentFit="contain"
          nativeControls
          player={player}
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
    width: "100%",
  },
});

export const LaunchVideoPlayer = memo(LaunchVideoPlayerComponent);
