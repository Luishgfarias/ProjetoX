const mockPost = jest.fn();

const mockApiInstance = {
  get: jest.fn(),
  post: mockPost,
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
};

const mockCreate = jest.fn(() => mockApiInstance);

jest.mock("axios", () => ({
  create: mockCreate,
}));

import type { LaunchCard, LaunchList } from "../../@types/launch";
import { LAUNCH_LIST_PAGE_SIZE } from "../../constants/launchList";
import { mapLaunchToCard } from "../../utils/mapLaunchToCard";

const { getPaginatedLaunches } = require("../launchService") as typeof import("../launchService");

type LaunchListItemResponse = Parameters<typeof mapLaunchToCard>[0];
type PaginatedLaunchApiResponse = Omit<LaunchList<LaunchCard>, "docs"> & {
  docs: LaunchListItemResponse[];
};
type LaunchListItemPatch = NonNullable<LaunchListItemResponse["links"]["patch"]>;

function createLaunchListItem(
  overrides: Partial<LaunchListItemResponse> = {},
  patchOverrides: Partial<LaunchListItemPatch> = {},
): LaunchListItemResponse {
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

function createPaginatedResponse(
  docs: LaunchListItemResponse[],
): PaginatedLaunchApiResponse {
  return {
    docs,
    totalDocs: docs.length,
    limit: LAUNCH_LIST_PAGE_SIZE,
    totalPages: 1,
    page: 1,
    pagingCounter: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  };
}

describe("launchService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("busca a pagina 1", async () => {
    const apiResponse = createPaginatedResponse([createLaunchListItem()]);
    mockPost.mockResolvedValueOnce({ data: apiResponse });

    const result: LaunchList<LaunchCard> = await getPaginatedLaunches(1);

    expect(mockPost).toHaveBeenCalledWith("launches/query", {
      query: {},
      options: {
        page: 1,
        limit: LAUNCH_LIST_PAGE_SIZE,
        select: [
          "id",
          "name",
          "flight_number",
          "date_utc",
          "date_local",
          "upcoming",
          "success",
          "links.patch.small",
        ],
        sort: {
          date_utc: "desc",
        },
      },
    });
    expect(result.docs).toEqual([mapLaunchToCard(apiResponse.docs[0])]);
    expect(result.page).toBe(1);
  });

  it("busca uma pagina especifica", async () => {
    const apiResponse = {
      ...createPaginatedResponse([
        createLaunchListItem({
          id: "launch-2",
          name: "Starlink",
          flight_number: 2,
        }),
      ]),
      page: 3,
      totalPages: 5,
      hasPrevPage: true,
      hasNextPage: true,
      prevPage: 2,
      nextPage: 4,
    };

    mockPost.mockResolvedValueOnce({ data: apiResponse });

    const result: LaunchList<LaunchCard> = await getPaginatedLaunches(3);

    expect(mockPost).toHaveBeenCalledWith(
      "launches/query",
      expect.objectContaining({
        options: expect.objectContaining({
          page: 3,
        }),
      }),
    );
    expect(result.page).toBe(3);
    expect(result.totalPages).toBe(5);
    expect(result.docs[0]).toEqual(mapLaunchToCard(apiResponse.docs[0]));
  });

  it("usa limit 10", async () => {
    mockPost.mockResolvedValueOnce({
      data: createPaginatedResponse([createLaunchListItem()]),
    });

    await getPaginatedLaunches(2);

    expect(mockPost).toHaveBeenCalledWith(
      "launches/query",
      expect.objectContaining({
        options: expect.objectContaining({
          limit: 10,
        }),
      }),
    );
  });

  it("trata erro da API", async () => {
    const apiError = new Error("Falha na API");
    mockPost.mockRejectedValueOnce(apiError);

    await expect(getPaginatedLaunches(1)).rejects.toThrow("Falha na API");
  });

  it("mapeia patchImage como null quando patch vier nulo", async () => {
    mockPost.mockResolvedValueOnce({
      data: createPaginatedResponse([
        createLaunchListItem({
          links: {
            patch: null,
          },
        }),
      ]),
    });

    const result: LaunchList<LaunchCard> = await getPaginatedLaunches(1);

    expect(result.docs[0]?.patchImage).toBeNull();
  });
});
