import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  Linking,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { ErrorState } from "../components/ErrorState";
import { LaunchVideoPlayer } from "../components/LaunchVideoPlayer";
import { LoadingState } from "../components/LoadingState";
import {
  LAUNCH_EMPTY_MESSAGES,
  LAUNCH_FALLBACK_TEXT,
} from "../constants/launchMessages";
import type { Launch } from "../@types/launch";
import { useLaunchDetails } from "../hooks/useLaunchDetails";
import { formatLaunchDate } from "../utils/formatLaunchDate";
import { getLaunchStatus } from "../utils/getLaunchStatus";

type Props = NativeStackScreenProps<RootStackParamList, "LaunchDetails">;

function formatDate(value: string | null) {
  if (!value) return LAUNCH_FALLBACK_TEXT.unknown;
  return formatLaunchDate(value);
}

function formatBoolean(value: boolean | null) {
  if (value === true) return "Sim";
  if (value === false) return "Não";
  return LAUNCH_FALLBACK_TEXT.unknown;
}

function formatList(values: string[] | null | undefined, emptyMessage: string) {
  return values?.length ? values.join(", ") : emptyMessage;
}

function hasValue(value: React.ReactNode | null | undefined) {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return true;
  }

  return true;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <View className="border-b border-app-border py-3 last:border-b-0 dark:border-app-border-dark">
      <Text className="text-xs font-semibold uppercase text-app-subtle dark:text-app-subtle-dark">
        {label}
      </Text>
      <Text className="mt-1 text-base text-app-text dark:text-app-text-dark">
        {value}
      </Text>
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
  const displayValue = value ?? LAUNCH_FALLBACK_TEXT.unknown;

  return (
    <Text className="text-sm text-app-muted dark:text-app-muted-dark">
      {label}: {displayValue}
    </Text>
  );
}

function SummaryMetric({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <View className="min-w-[47%] flex-1 rounded-2xl border border-app-border bg-app-background/70 px-4 py-3 dark:border-app-border-dark dark:bg-app-background-dark/60">
      <Text className="text-xs font-semibold uppercase tracking-wide text-app-subtle dark:text-app-subtle-dark">
        {label}
      </Text>
      <Text className="mt-1 text-base font-semibold text-app-text dark:text-app-text-dark">
        {value}
      </Text>
    </View>
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
      <Text className="mb-3 text-lg font-semibold text-app-text dark:text-app-text-dark">
        {title}
      </Text>
      <View className="rounded-lg border border-app-border bg-app-surface px-4 dark:border-app-border-dark dark:bg-app-surface-dark">
        {children}
      </View>
    </View>
  );
}

function SectionDescription({
  title,
  description,
}: {
  title: string;
  description?: string | null;
}) {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-lg font-semibold text-app-text dark:text-app-text-dark">
        {title}
      </Text>
      <View className="rounded-3xl border border-app-border bg-app-surface px-4 py-4 dark:border-app-border-dark dark:bg-app-surface-dark">
        <Text className="text-base leading-6 text-app-text dark:text-app-text-dark">
          {description ?? LAUNCH_FALLBACK_TEXT.noDetails}
        </Text>
      </View>
    </View>
  );
}

function LinkRow({ label, url }: { label: string; url: string | null }) {
  if (!url) return null;

  return (
    <Pressable
      accessibilityRole="link"
      className="rounded-2xl border border-app-border bg-app-background px-4 py-3 active:bg-app-surface-muted dark:border-app-border-dark dark:bg-app-background-dark dark:active:bg-app-surface-muted-dark"
      onPress={() => Linking.openURL(url)}
    >
      <Text className="text-xs font-semibold uppercase tracking-wide text-app-subtle dark:text-app-subtle-dark">
        {label}
      </Text>
      <Text className="mt-1 text-base font-medium text-app-accent dark:text-app-accent-dark">
        {url}
      </Text>
    </Pressable>
  );
}

function ArticleButton({
  onPress,
  url,
}: {
  onPress: (url: string) => void;
  url: string | null;
}) {
  if (!url) return null;

  return (
    <Pressable
      accessibilityLabel="Ler artigo"
      accessibilityRole="button"
      className="my-3 rounded-full bg-app-primary px-4 py-3 active:bg-app-primary-pressed dark:bg-app-primary-dark dark:active:bg-app-primary-pressed-dark"
      onPress={() => onPress(url)}
    >
      <Text className="text-center font-semibold text-white dark:text-gray-950">
        Ler artigo
      </Text>
    </Pressable>
  );
}

function MissionPatchImage({
  patchImage,
  statusLabel,
  statusClassName,
}: {
  patchImage: string | null;
  statusLabel: string;
  statusClassName: string;
}) {
  const [isLoading, setIsLoading] = React.useState(Boolean(patchImage));

  return (
    <View className="relative mb-5 items-center justify-center rounded-[24px] bg-app-background/70 p-4 dark:bg-app-background-dark/50">
      <View className="absolute right-4 top-4 z-10 self-start">
        <Text
          className={`rounded-full px-3 py-1 text-sm font-semibold ${statusClassName}`}
        >
          {statusLabel}
        </Text>
      </View>

      {isLoading && patchImage ? (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator size="small" />
        </View>
      ) : null}

      <Image
        className="h-40 w-full"
        resizeMode="contain"
        source={
          patchImage
            ? { uri: patchImage }
            : require("../../assets/noMissionImage.png")
        }
        onLoadEnd={() => setIsLoading(false)}
      />
    </View>
  );
}

export default function LaunchDetailsScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { height } = useWindowDimensions();
  const bottomContentGap = height / 8;
  const { launch, loading, error, emptyMessage, fetchLaunch } =
    useLaunchDetails(id);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-app-background dark:bg-app-background-dark">
        <LoadingState text="Carregando detalhes..." />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-app-background p-4 dark:bg-app-background-dark">
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
      <View className="flex-1 items-center justify-center bg-app-background p-4 dark:bg-app-background-dark">
        <Text className="mb-4 text-center text-lg font-medium text-app-muted dark:text-app-muted-dark">
          {emptyMessage ?? LAUNCH_EMPTY_MESSAGES.details}
        </Text>
        <Pressable
          accessibilityLabel="Voltar"
          accessibilityRole="button"
          className="rounded-full bg-app-primary px-4 py-2.5 active:bg-app-primary-pressed dark:bg-app-primary-dark dark:active:bg-app-primary-pressed-dark"
          onPress={navigation.goBack}
        >
          <Text className="text-center font-semibold text-white dark:text-gray-950">
            Voltar
          </Text>
        </Pressable>
      </View>
    );
  }

  const patchImage = launch.links?.patch?.large ?? launch.links?.patch?.small;
  const flickrImages = launch.links?.flickr?.original?.length ?? 0;
  const payloads = formatList(launch.payloads, LAUNCH_EMPTY_MESSAGES.payloads);
  const ships = formatList(launch.ships, LAUNCH_EMPTY_MESSAGES.ships);
  const capsules = formatList(launch.capsules, LAUNCH_EMPTY_MESSAGES.capsules);
  const crewMembers = launch.crew ?? [];
  const cores = launch.cores ?? [];
  const failures = launch.failures ?? [];
  const status = getLaunchStatus(launch);
  const articleUrl = launch.links?.article ?? null;
  const webcastUrl =
    typeof launch.links?.webcast === "string" ? launch.links.webcast : null;
  const availableLinks = [
    { label: "Artigo", url: articleUrl },
    { label: "Transmissão", url: webcastUrl },
    { label: "Wikipedia", url: launch.links?.wikipedia ?? null },
    { label: "Presskit", url: launch.links?.presskit ?? null },
    { label: "Reddit campanha", url: launch.links?.reddit?.campaign ?? null },
    { label: "Reddit lançamento", url: launch.links?.reddit?.launch ?? null },
    { label: "Reddit mídia", url: launch.links?.reddit?.media ?? null },
    { label: "Reddit recuperação", url: launch.links?.reddit?.recovery ?? null },
  ].filter((link) => Boolean(link.url));
  const hasVideo = Boolean(launch.links?.webcast);
  const hasDescription = hasValue(launch.details);
  const hasCrew = crewMembers.length > 0;
  const hasTechnicalData = [
    launch.flight_number,
    launch.date_local,
    launch.date_utc,
    launch.static_fire_date_utc,
    launch.rocket,
    launch.launchpad,
    launch.date_precision,
    launch.window,
  ].some(hasValue);
  const hasPayloads = launch.payloads.length > 0;
  const hasCores = cores.length > 0;
  const hasFailures = failures.length > 0;
  const hasOtherData =
    launch.ships.length > 0 ||
    launch.capsules.length > 0 ||
    flickrImages > 0 ||
    launch.auto_update !== null ||
    launch.tbd !== null ||
    launch.net !== null;
  const hasFairingsData =
    launch.fairings?.reused != null ||
    launch.fairings?.recovery_attempt != null ||
    launch.fairings?.recovered != null ||
    Boolean(launch.fairings?.ships?.length);
  const hasUsefulLinks = availableLinks.length > 0;

  return (
    <ScrollView
      className="flex-1 bg-app-background p-4 dark:bg-app-background-dark"
      contentContainerStyle={{ paddingBottom: bottomContentGap }}
    >
      <View className="mb-6 overflow-hidden rounded-[28px] border border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-surface-dark">
        <View className="border-b border-app-border px-5 pb-5 pt-6 dark:border-app-border-dark">
          <MissionPatchImage
            patchImage={patchImage}
            statusClassName={status.className}
            statusLabel={status.label}
          />

          <Text className="text-center text-3xl font-bold text-app-text dark:text-app-text-dark">
            {launch.name}
          </Text>
          <Text className="mt-2 text-center text-base text-app-muted dark:text-app-muted-dark">
            Voo #{launch.flight_number ?? LAUNCH_FALLBACK_TEXT.unknown}
          </Text>
        </View>

        <View className="gap-3 px-5 py-5">
          <View className="flex-row flex-wrap gap-3">
            <SummaryMetric
              label="Data local"
              value={formatDate(launch.date_local)}
            />
            <SummaryMetric label="Data UTC" value={formatDate(launch.date_utc)} />
          </View>
          <View className="flex-row flex-wrap gap-3">
            <SummaryMetric
              label="Foguete"
              value={launch.rocket ?? LAUNCH_FALLBACK_TEXT.unknown}
            />
            <SummaryMetric
              label="Launchpad"
              value={launch.launchpad ?? LAUNCH_FALLBACK_TEXT.unknown}
            />
          </View>
        </View>
      </View>

      {hasDescription && (
        <SectionDescription title="Descrição" description={launch.details} />
      )}

      {hasVideo && <LaunchVideoPlayer videoUrl={launch.links?.webcast ?? null} />}

      {hasUsefulLinks && (
        <Section title="Links úteis">
          <View className="py-4">
            <ArticleButton
              url={articleUrl}
              onPress={(url) =>
                navigation.navigate("ArticleWebView", {
                  url,
                  title: launch.name,
                })
              }
            />
            <View className="mt-1 gap-3">
              {availableLinks.map((link) => (
                <LinkRow
                  key={`${link.label}-${link.url}`}
                  label={link.label}
                  url={link.url}
                />
              ))}
            </View>
          </View>
        </Section>
      )}

      {hasTechnicalData && (
        <Section title="Dados técnicos">
          <DetailRow label="Número do voo" value={`#${launch.flight_number}`} />
          <DetailRow label="Status" value={status.label} />
          <DetailRow label="Data local" value={formatDate(launch.date_local)} />
          <DetailRow label="Data UTC" value={formatDate(launch.date_utc)} />
          <DetailRow
            label="Queima estática (UTC)"
            value={formatDate(launch.static_fire_date_utc)}
          />
          <DetailRow
            label="Rocket ID"
            value={launch.rocket ?? LAUNCH_FALLBACK_TEXT.unknown}
          />
          <DetailRow
            label="Launchpad ID"
            value={launch.launchpad ?? LAUNCH_FALLBACK_TEXT.unknown}
          />
          <DetailRow
            label="Precisão da data"
            value={launch.date_precision ?? LAUNCH_FALLBACK_TEXT.unknown}
          />
          <DetailRow
            label="Janela de lançamento"
            value={
              launch.window != null
                ? `${launch.window} segundos`
                : LAUNCH_FALLBACK_TEXT.unknown
            }
          />
        </Section>
      )}

      {hasPayloads && (
        <Section title="Payloads">
          <DetailRow label="Payload IDs" value={payloads} />
        </Section>
      )}

      {hasCrew && (
        <Section title="Tripulação">
          {crewMembers.map((member, index) => (
            <View
              className="border-b border-app-border py-3 last:border-b-0 dark:border-app-border-dark"
              key={`${member.crew}-${index}`}
            >
              <Text className="mb-2 text-base font-semibold text-app-text dark:text-app-text-dark">
                Membro {index + 1}
              </Text>
              <InlineDetail label="ID" value={member.crew} />
              <InlineDetail label="Função" value={member.role} />
            </View>
          ))}
        </Section>
      )}

      {hasCores && (
        <Section title="Cores">
          {cores.map((core, index) => (
            <View
              className="border-b border-app-border py-3 dark:border-app-border-dark"
              key={`${core.core ?? "core"}-${index}`}
            >
              <Text className="mb-2 text-base font-semibold text-app-text dark:text-app-text-dark">
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
          ))}
        </Section>
      )}

      {hasFailures && (
        <Section title="Falhas">
          {failures.map((failure, index) => (
            <View
              className="border-b border-rose-200 bg-rose-50 px-3 py-3 dark:border-rose-900 dark:bg-rose-950/60"
              key={`${failure.time ?? "failure"}-${index}`}
            >
              <InlineDetail label="Tempo" value={failure.time} />
              <InlineDetail label="Altitude" value={failure.altitude} />
              <InlineDetail label="Motivo" value={failure.reason} />
            </View>
          ))}
        </Section>
      )}

      {hasOtherData && (
        <Section title="Outros dados">
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
      )}

      {hasFairingsData && (
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
            value={formatList(
              launch.fairings?.ships,
              LAUNCH_EMPTY_MESSAGES.ships,
            )}
          />
        </Section>
      )}

      <View className="mb-8">
        <Text className="text-center text-xs text-app-subtle dark:text-app-subtle-dark">
          ID do lançamento: {launch.id}
        </Text>
      </View>
    </ScrollView>
  );
}
