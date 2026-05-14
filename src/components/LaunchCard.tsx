import React, { memo, useCallback, useMemo } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { LaunchCard as LancamentoCard } from "../@types/launch";
import { getLaunchStatus } from "../constants/launchStatus";

export type LaunchCardProps = {
  lancamento: LancamentoCard;
  onPress: (id: string) => void;
};

function LaunchCardComponent({ lancamento, onPress }: LaunchCardProps) {
  const status = useMemo(() => getLaunchStatus(lancamento), [lancamento]);
  const formattedDate = useMemo(
    () => new Date(lancamento.date_local).toLocaleDateString(),
    [lancamento.date_local],
  );
  const imageSource = useMemo(
    () =>
      lancamento.patchImage
        ? { uri: lancamento.patchImage }
        : require("../../assets/noMissionImage.png"),
    [lancamento.patchImage],
  );
  const handlePress = useCallback(() => {
    onPress(lancamento.id);
  }, [lancamento.id, onPress]);

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
            {lancamento.name}
          </Text>
          <Text
            className={`rounded-full px-2 py-1 text-xs font-semibold ${status.className}`}
          >
            {status.label}
          </Text>
        </View>

        <Text className="text-sm text-app-muted dark:text-app-muted-dark">
          Voo #{lancamento.flight_number}
        </Text>
        <Text className="mt-1 text-sm text-app-muted dark:text-app-muted-dark">
          Data: {formattedDate}
        </Text>
      </View>
    </Pressable>
  );
}

export const LaunchCard = memo(
  LaunchCardComponent,
  (previousProps, nextProps) =>
    previousProps.onPress === nextProps.onPress &&
    previousProps.lancamento.id === nextProps.lancamento.id &&
    previousProps.lancamento.name === nextProps.lancamento.name &&
    previousProps.lancamento.flight_number ===
      nextProps.lancamento.flight_number &&
    previousProps.lancamento.date_local === nextProps.lancamento.date_local &&
    previousProps.lancamento.upcoming === nextProps.lancamento.upcoming &&
    previousProps.lancamento.success === nextProps.lancamento.success &&
    previousProps.lancamento.patchImage === nextProps.lancamento.patchImage,
);
