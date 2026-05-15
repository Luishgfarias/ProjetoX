import React, { memo, useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import type { LaunchCard as LaunchCardData } from "../@types/launch";
import { formatLaunchDate } from "../utils/formatLaunchDate";
import { getLaunchStatus } from "../utils/getLaunchStatus";

export type LaunchCardProps = {
  launch: LaunchCardData;
  onPress: (id: string) => void;
};

function LaunchCardComponent({ launch, onPress }: LaunchCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(Boolean(launch.patchImage));
  const status = useMemo(() => getLaunchStatus(launch), [launch]);
  const formattedDate = useMemo(
    () => formatLaunchDate(launch.date_local),
    [launch.date_local],
  );
  const imageSource = useMemo(
    () =>
      launch.patchImage
        ? { uri: launch.patchImage }
        : require("../../assets/noMissionImage.png"),
    [launch.patchImage],
  );
  const handlePress = useCallback(() => {
    onPress(launch.id);
  }, [launch.id, onPress]);

  return (
    <Pressable
      className="mb-3 flex-row items-center rounded-lg border border-app-border bg-app-surface p-4 shadow-sm active:bg-app-surface-muted dark:border-app-border-dark dark:bg-app-surface-dark dark:active:bg-app-surface-muted-dark"
      onPress={handlePress}
    >
      <View className="relative mr-4 h-16 w-16 items-center justify-center">
        {isImageLoading && launch.patchImage && (
          <View className="absolute inset-0 items-center justify-center">
            <ActivityIndicator size="small" />
          </View>
        )}

        <Image
          className="h-16 w-16 rounded-md"
          resizeMode="contain"
          source={imageSource}
          onLoadEnd={() => setIsImageLoading(false)}
        />
      </View>

      <View className="min-w-0 flex-1">
        <View className="mb-2 flex-row items-start justify-between">
          <Text className="mr-3 flex-1 text-lg font-semibold text-app-text dark:text-app-text-dark">
            {launch.name}
          </Text>
          <Text
            className={`rounded-full px-2 py-1 text-xs font-semibold ${status.className}`}
          >
            {status.label}
          </Text>
        </View>

        <Text className="text-sm text-app-muted dark:text-app-muted-dark">
          Voo #{launch.flight_number}
        </Text>
        <Text className="mt-1 text-sm text-app-muted dark:text-app-muted-dark">
          Data: {formattedDate}
        </Text>
      </View>
    </Pressable>
  );
}

export const LaunchCard = memo(LaunchCardComponent);
