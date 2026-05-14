import React, { memo, useCallback, useMemo } from "react";
import { Image, Pressable, Text, View } from "react-native";
import type { LaunchCard as LaunchCardData } from "../@types/launch";
import { getLaunchStatus } from "../constants/launchStatus";

export type LaunchCardProps = {
  launch: LaunchCardData;
  onPress: (id: string) => void;
};

function LaunchCardComponent({ launch, onPress }: LaunchCardProps) {
  const status = useMemo(() => getLaunchStatus(launch), [launch]);
  const formattedDate = useMemo(
    () => new Date(launch.date_local).toLocaleDateString(),
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
      <Image
        className="mr-4 h-16 w-16 rounded-md"
        resizeMode="contain"
        source={imageSource}
      />

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
