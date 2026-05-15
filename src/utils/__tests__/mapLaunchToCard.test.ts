import { mapLaunchToCard } from "../mapLaunchToCard";

type MapLaunchInput = Parameters<typeof mapLaunchToCard>[0];

function createLaunch(
  overrides: Partial<MapLaunchInput> = {},
  patchOverrides: Partial<MapLaunchInput["links"]["patch"]> = {},
): MapLaunchInput {
  return {
    id: "launch-1",
    name: "FalconSat",
    flight_number: 1,
    date_utc: "2006-03-24T22:30:00.000Z",
    date_local: "2006-03-25T10:30:00-04:00",
    upcoming: false,
    success: false,
    links: {
      patch: {
        small: "https://images.example.com/patch-small.png",
        ...patchOverrides,
      },
    },
    ...overrides,
  };
}

describe("mapLaunchToCard", () => {
  it("retorna os dados corretos", () => {
    const launch = createLaunch();

    expect(mapLaunchToCard(launch)).toEqual({
      id: "launch-1",
      name: "FalconSat",
      flight_number: 1,
      date_utc: "2006-03-24T22:30:00.000Z",
      date_local: "2006-03-25T10:30:00-04:00",
      upcoming: false,
      success: false,
      patchImage: "https://images.example.com/patch-small.png",
    });
  });

  it("usa o patch small quando estiver disponivel", () => {
    const launch = createLaunch(
      {},
      {
        small: "https://images.example.com/custom-small.png",
      },
    );

    const result = mapLaunchToCard(launch);

    expect(result.patchImage).toBe("https://images.example.com/custom-small.png");
  });

  it("retorna patchImage null quando nao houver imagem", () => {
    const launch = createLaunch({}, { small: null });

    const result = mapLaunchToCard(launch);

    expect(result.patchImage).toBeNull();
  });

  it("nao altera os dados originais", () => {
    const launch = createLaunch();
    const originalLaunch = structuredClone(launch);

    const result = mapLaunchToCard(launch);

    expect(launch).toEqual(originalLaunch);
    expect(result).not.toBe(launch);
    expect(result.patchImage).toBe(launch.links.patch.small);
  });
});
