import { Image } from "react-native";
import type { Launch } from "../@types/launch";

const missaoEspecialImage = require("../../assets/missaoEspecial.png");
const missaoEspecialImageUri =
  Image.resolveAssetSource(missaoEspecialImage).uri;
const missaoEspecialVideoAssetId = require("../../assets/missaoEspecial.mp4");
const missaoEspecialVideo: Launch["links"]["webcast"] = {
  assetId: missaoEspecialVideoAssetId,
};

export const missaoEspecial: Launch = {
  id: "missao-especial",
  name: "Missão Especial",
  flight_number: 2026,
  rocket: "React Native + Expo",
  payloads: [
    "Olá, meu nome é Luis Henrique! É um prazer estar aqui para compartilhar um pouco da minha trajetória, das minhas habilidades e da forma como enxergo tecnologia. Desde muito jovem, sempre fui um entusiasta da área, e essa curiosidade foi o que me levou a explorar o mundo do desenvolvimento de software.\n\nMinha jornada começou ainda no ensino médio, quando entrei em uma escola profissionalizante e escolhi o curso de Informática. Foi ali que tive meus primeiros contatos mais profundos com programação: conheci fundamentos, pratiquei os primeiros códigos, entendi um pouco da história da computação e comecei a perceber que tecnologia poderia ser mais do que um interesse, poderia ser um caminho profissional.\n\nDepois de me formar, entrei em uma dev house local em São Gonçalo. Foi nessa experiência que aprendi, de verdade, como é a rotina de um programador no mundo real. Não foi simples: eu era muito jovem, estava começando a vida adulta e já precisava atuar como profissional. Mesmo com os desafios, consegui evoluir, ganhar confiança e entender melhor como trabalhar em equipe, lidar com prazos e entregar soluções com responsabilidade.\n\nEm 2024, encerrei esse ciclo na dev house e entrei na Pontotel como desenvolvedor. Desde então, sigo aprendendo, contribuindo e amadurecendo como profissional. Gosto de criar interfaces úteis, pensar na experiência de quem usa o produto e transformar ideias em aplicações que façam sentido.\n\nE é aqui que estamos agora. Mais uma vez, é um prazer estar com vocês. Vamos juntos nessa jornada que é a minha Missão Especial!",
  ],
  launchpad: "Fortaleza, CE",
  upcoming: false,
  success: true,
  details:
    "Uma missão especial para apresentar quem eu sou, minha trajetória, minhas habilidades e o que eu quero construir.",
  date_utc: "2026-05-14T00:00:00.000Z",
  date_unix: 1778716800,
  date_local: "2026-05-14T00:00:00-03:00",
  date_precision: "day",
  static_fire_date_utc: null,
  static_fire_date_unix: null,
  net: false,
  window: null,
  tbd: false,
  crew: ["Luis Farias"],
  ships: [],
  capsules: [],
  fairings: {
    reused: null,
    recovery_attempt: null,
    recovered: null,
    ships: [],
  },
  links: {
    patch: {
      small: missaoEspecialImageUri,
      large: missaoEspecialImageUri,
    },
    reddit: {
      campaign: null,
      launch: null,
      media: null,
      recovery: null,
    },
    flickr: {
      small: [],
      original: [],
    },
    presskit: null,
    webcast: missaoEspecialVideo,
    youtube_id: null,
    article: null,
    wikipedia: null,
  },
  failures: [
    {
      time: 0,
      altitude: 0,
      reason:
        "As falhas fazem parte da jornada, mas nesta missão especial tudo sairá conforme o planejado!",
    },
  ],
  cores: [],
  auto_update: false,
  launch_library_id: null,
};
