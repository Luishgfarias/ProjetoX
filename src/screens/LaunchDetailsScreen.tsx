import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  Linking,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { getLaunchById } from "../services/launchService";
import { Launch } from "../@types/launch";
import { ErrorState } from "../components/ErrorState";
import { LaunchVideoPlayer } from "../components/LaunchVideoPlayer";
import { LoadingState } from "../components/LoadingState";
import { useLaunchStore } from "../store/launchStore";

type Props = NativeStackScreenProps<RootStackParamList, "LaunchDetails">;

type LaunchStatus = {
  label: string;
  className: string;
};

function getLaunchStatus(launch: Launch): LaunchStatus {
  if (launch.upcoming) {
    return {
      label: "Agendado",
      className: "bg-sky-100 text-slate-700",
    };
  }

  if (launch.success === true) {
    return {
      label: "Sucesso",
      className: "bg-emerald-50 text-stone-600",
    };
  }

  if (launch.success === false) {
    return {
      label: "Falha",
      className: "bg-rose-50 text-stone-600",
    };
  }

  return {
    label: "Indefinido",
    className: "bg-gray-100 text-gray-700",
  };
}

function formatDate(value: string | null) {
  if (!value) return "Não informado";
  return new Date(value).toLocaleString();
}

function formatBoolean(value: boolean | null) {
  if (value === true) return "Sim";
  if (value === false) return "Não";
  return "Não informado";
}

function formatList(values: string[] | null | undefined, emptyMessage: string) {
  return values?.length ? values.join(", ") : emptyMessage;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <View className="border-b border-gray-100 py-3">
      <Text className="text-xs font-semibold uppercase text-gray-500">
        {label}
      </Text>
      <Text className="mt-1 text-base text-gray-900">{value}</Text>
    </View>
  );
}

function InlineDetail({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode | null;
}) {
  const displayValue = value ?? "Não informado";

  return (
    <Text className="text-sm text-gray-700">
      {label}: {displayValue}
    </Text>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-lg font-semibold text-gray-950">{title}</Text>
      <View className="rounded-lg border border-gray-200 bg-white px-4">
        {children}
      </View>
    </View>
  );
}

function LinkRow({ label, url }: { label: string; url: string | null }) {
  if (!url) return null;

  return (
    <Pressable
      accessibilityRole="link"
      className="border-b border-gray-100 py-3 active:bg-gray-50"
      onPress={() => Linking.openURL(url)}
    >
      <Text className="text-xs font-semibold uppercase text-gray-500">
        {label}
      </Text>
      <Text className="mt-1 text-base font-medium text-blue-700">{url}</Text>
    </Pressable>
  );
}

export default function LaunchDetailsScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const cachedLaunch = useLaunchStore((state) => state.launchDetailsById[id]);
  const setLaunchDetail = useLaunchStore((state) => state.setLaunchDetail);
  const [launch, setLaunch] = useState<Launch | null>(cachedLaunch ?? null);
  const [loading, setLoading] = useState(!cachedLaunch);
  const [error, setError] = useState<string | null>(null);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const fetchLaunch = useCallback(async () => {
    if (cachedLaunch) {
      setLaunch(cachedLaunch);
      setLoading(false);
      setError(null);
      setEmptyMessage(null);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLaunch(null);
    setLoading(true);
    setError(null);
    setEmptyMessage(null);

    const canUpdate = () =>
      isMountedRef.current && requestId === requestIdRef.current;

    try {
      const data = await getLaunchById(id);
      if (!canUpdate()) return;
      setLaunchDetail(data);
      setLaunch(data);
    } catch (requestError) {
      if (!canUpdate()) return;

      if (
        axios.isAxiosError(requestError) &&
        requestError.response?.status === 404
      ) {
        setEmptyMessage("Lançamento não encontrado.");
        return;
      }

      setError("Não foi possível carregar os detalhes do lançamento.");
    } finally {
      if (!canUpdate()) return;
      setLoading(false);
    }
  }, [cachedLaunch, id, setLaunchDetail]);

  useEffect(() => {
    fetchLaunch();
  }, [fetchLaunch]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <LoadingState text="Carregando detalhes..." />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <ErrorState
          message={error}
          onRetry={fetchLaunch}
          onBack={navigation.goBack}
        />
      </View>
    );
  }

  if (emptyMessage || !launch) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="mb-4 text-center text-lg font-medium text-stone-700">
          {emptyMessage ?? "Nenhum dado encontrado para este lançamento."}
        </Text>
        <Pressable
          accessibilityLabel="Voltar"
          accessibilityRole="button"
          className="rounded-full bg-gray-900 px-4 py-2.5 active:bg-gray-700"
          onPress={navigation.goBack}
        >
          <Text className="text-center font-semibold text-white">Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const patchImage = launch.links?.patch?.large ?? launch.links?.patch?.small;
  const flickrImages = launch.links?.flickr?.original?.length ?? 0;
  const payloads = formatList(launch.payloads, "Nenhuma carga informada");
  const ships = formatList(launch.ships, "Nenhum navio informado");
  const capsules = formatList(launch.capsules, "Nenhuma cápsula informada");
  const crew = formatList(launch.crew, "Nenhuma tripulação informada");
  const cores = launch.cores ?? [];
  const failures = launch.failures ?? [];
  const status = getLaunchStatus(launch);

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="mb-6 rounded-lg border border-gray-200 bg-slate-50 p-5">
        <Image
          className="mb-4 h-36 w-full rounded-lg"
          resizeMode="contain"
          source={
            patchImage
              ? { uri: patchImage }
              : require("../../public/noMissionImage.png")
          }
        />
        <Text className="text-2xl font-bold text-gray-950">{launch.name}</Text>
        <Text className="mt-1 text-base text-gray-600">
          Voo #{launch.flight_number ?? "Não informado"}
        </Text>
        <View className="mt-3 self-start">
          <Text
            className={`rounded-full px-3 py-1 text-sm font-semibold ${status.className}`}
          >
            {status.label}
          </Text>
        </View>
      </View>

      <Section title="Detalhes">
        <View className="py-3">
          <Text className="text-base leading-6 text-gray-800">
            {launch.details ?? "Sem detalhes disponíveis."}
          </Text>
        </View>
      </Section>

      <LaunchVideoPlayer videoUrl={launch.links?.webcast ?? null} />

      <Section title="Informações principais">
        <DetailRow label="Número do voo" value={`#${launch.flight_number}`} />
        <DetailRow label="Data local" value={formatDate(launch.date_local)} />
        <DetailRow label="Data UTC" value={formatDate(launch.date_utc)} />
        <DetailRow label="Status" value={status.label} />
        <DetailRow label="Rocket ID" value={launch.rocket ?? "Não informado"} />
        <DetailRow
          label="Launchpad ID"
          value={launch.launchpad ?? "Não informado"}
        />
        <DetailRow
          label="Precisão da data"
          value={launch.date_precision ?? "Não informado"}
        />
        <DetailRow
          label="Janela de lançamento"
          value={
            launch.window != null
              ? `${launch.window} segundos`
              : "Não informado"
          }
        />
      </Section>

      <Section title="Payloads">
        <DetailRow label="Payload IDs" value={payloads} />
      </Section>

      <Section title="Cores">
        {cores.length ? (
          cores.map((core, index) => (
            <View
              className="border-b border-gray-100 py-3"
              key={`${core.core ?? "core"}-${index}`}
            >
              <Text className="mb-2 text-base font-semibold text-gray-900">
                Core {index + 1}
              </Text>
              <InlineDetail label="ID" value={core.core} />
              <InlineDetail label="Voo" value={core.flight} />
              <InlineDetail
                label="Reutilizado"
                value={formatBoolean(core.reused)}
              />
              <InlineDetail
                label="Tentativa de pouso"
                value={formatBoolean(core.landing_attempt)}
              />
              <InlineDetail
                label="Pouso bem-sucedido"
                value={formatBoolean(core.landing_success)}
              />
              <InlineDetail label="Tipo de pouso" value={core.landing_type} />
              <InlineDetail label="Landpad" value={core.landpad} />
            </View>
          ))
        ) : (
          <DetailRow label="Cores" value="Nenhum core informado" />
        )}
      </Section>

      <Section title="Falhas">
        {failures.length ? (
          failures.map((failure, index) => (
            <View
              className="border-b border-rose-100 bg-rose-50 px-3 py-3"
              key={`${failure.time ?? "failure"}-${index}`}
            >
              <InlineDetail label="Tempo" value={failure.time} />
              <InlineDetail label="Altitude" value={failure.altitude} />
              <InlineDetail label="Motivo" value={failure.reason} />
            </View>
          ))
        ) : (
          <DetailRow label="Falhas" value="Nenhuma falha registrada" />
        )}
      </Section>

      <Section title="Outros dados">
        <DetailRow label="Tripulação" value={crew} />
        <DetailRow label="Navios" value={ships} />
        <DetailRow label="Cápsulas" value={capsules} />
        <DetailRow label="Imagens no Flickr" value={String(flickrImages)} />
        <DetailRow
          label="Atualização automática"
          value={formatBoolean(launch.auto_update)}
        />
        <DetailRow label="A definir" value={formatBoolean(launch.tbd)} />
        <DetailRow label="NET" value={formatBoolean(launch.net)} />
      </Section>

      <Section title="Coifa">
        <DetailRow
          label="Reutilizada"
          value={formatBoolean(launch.fairings?.reused ?? null)}
        />
        <DetailRow
          label="Tentativa de recuperação"
          value={formatBoolean(launch.fairings?.recovery_attempt ?? null)}
        />
        <DetailRow
          label="Recuperada"
          value={formatBoolean(launch.fairings?.recovered ?? null)}
        />
        <DetailRow
          label="Navios da coifa"
          value={formatList(launch.fairings?.ships, "Nenhum navio informado")}
        />
      </Section>

      <Section title="Links úteis">
        <LinkRow label="Transmissão" url={launch.links?.webcast ?? null} />
        <LinkRow label="Artigo" url={launch.links?.article ?? null} />
        <LinkRow label="Wikipedia" url={launch.links?.wikipedia ?? null} />
        <LinkRow label="Presskit" url={launch.links?.presskit ?? null} />
        <LinkRow
          label="Reddit campanha"
          url={launch.links?.reddit?.campaign ?? null}
        />
        <LinkRow
          label="Reddit lançamento"
          url={launch.links?.reddit?.launch ?? null}
        />
        <LinkRow
          label="Reddit mídia"
          url={launch.links?.reddit?.media ?? null}
        />
        <LinkRow
          label="Reddit recuperação"
          url={launch.links?.reddit?.recovery ?? null}
        />
        {!launch.links?.webcast &&
        !launch.links?.article &&
        !launch.links?.wikipedia &&
        !launch.links?.presskit &&
        !launch.links?.reddit?.campaign &&
        !launch.links?.reddit?.launch &&
        !launch.links?.reddit?.media &&
        !launch.links?.reddit?.recovery ? (
          <DetailRow label="Links" value="Nenhum link disponível" />
        ) : null}
      </Section>

      <View className="mb-8">
        <Text className="text-center text-xs text-gray-500">
          ID do lançamento: {launch.id}
        </Text>
      </View>
    </ScrollView>
  );
}
