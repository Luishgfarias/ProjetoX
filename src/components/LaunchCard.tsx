import React, { memo } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { LaunchCard as LancamentoCard } from "../@types/launch";
import { getLaunchStatus } from "../constants/launchStatus";

export type LaunchCardProps = {
  lancamento: LancamentoCard;
  onPress: (id: string) => void;
};

function LaunchCardComponent({ lancamento, onPress }: LaunchCardProps) {
  const status = getLaunchStatus(lancamento);
  const formattedDate = new Date(lancamento.date_local).toLocaleDateString();

  return (
    <Pressable
      className="mb-3 flex-row items-center rounded-lg border border-gray-200 bg-slate-50 p-4 shadow-sm active:bg-slate-100"
      onPress={() => onPress(lancamento.id)}
    >
      {lancamento.patchImage ? (
        <Image
          className="mr-4 h-16 w-16 rounded-md"
          resizeMode="contain"
          source={{ uri: lancamento.patchImage }}
        />
      ) : (
        <Image
          className="mr-4 h-16 w-16 rounded-md"
          resizeMode="contain"
          source={require("../../public/noMissionImage.png")}
        />
      )}

      <View className="min-w-0 flex-1">
        <View className="mb-2 flex-row items-start justify-between">
          <Text className="mr-3 flex-1 text-lg font-semibold text-gray-900">
            {lancamento.name}
          </Text>
          <Text
            className={`rounded-full px-2 py-1 text-xs font-semibold ${status.className}`}
          >
            {status.label}
          </Text>
        </View>

        <Text className="text-sm text-gray-600">
          Voo #{lancamento.flight_number}
        </Text>
        <Text className="mt-1 text-sm text-gray-600">
          Data: {formattedDate}
        </Text>
      </View>
    </Pressable>
  );
}

export const LaunchCard = memo(LaunchCardComponent);
