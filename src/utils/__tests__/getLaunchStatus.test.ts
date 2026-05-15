import { getLaunchStatus, LAUNCH_STATUS } from "../getLaunchStatus";

describe("getLaunchStatus", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-15T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("retorna futuro quando o lançamento estiver marcado como upcoming", () => {
    expect(
      getLaunchStatus({
        upcoming: true,
        success: null,
        date_utc: "2099-03-24T22:30:00.000Z",
        date_precision: "hour",
      }),
    ).toEqual(
      LAUNCH_STATUS.upcoming,
    );
  });

  it("retorna sucesso quando o lançamento não for futuro e tiver success true", () => {
    expect(
      getLaunchStatus({
        upcoming: false,
        success: true,
        date_utc: "2006-03-24T22:30:00.000Z",
        date_precision: "hour",
      }),
    ).toEqual(
      LAUNCH_STATUS.success,
    );
  });

  it("retorna falha quando o lançamento não for futuro e tiver success false", () => {
    expect(
      getLaunchStatus({
        upcoming: false,
        success: false,
        date_utc: "2006-03-24T22:30:00.000Z",
        date_precision: "hour",
      }),
    ).toEqual(
      LAUNCH_STATUS.failure,
    );
  });

  it("retorna indefinido quando não houver status resolvido", () => {
    expect(
      getLaunchStatus({
        upcoming: false,
        success: null,
        date_utc: "2006-03-24T22:30:00.000Z",
        date_precision: "hour",
      }),
    ).toEqual(
      LAUNCH_STATUS.unknown,
    );
  });

  it("prioriza atrasado sobre success quando upcoming estiver inconsistente e a data já tiver passado", () => {
    expect(
      getLaunchStatus({
        upcoming: true,
        success: false,
        date_utc: "2022-12-01T00:00:00.000Z",
        date_precision: "month",
      }),
    ).toEqual(
      LAUNCH_STATUS.delayed,
    );
  });

  it("não marca como atrasado antes do fim do período quando a precisão for mensal", () => {
    expect(
      getLaunchStatus({
        upcoming: true,
        success: null,
        date_utc: "2026-05-01T00:00:00.000Z",
        date_precision: "month",
      }),
    ).toEqual(
      LAUNCH_STATUS.upcoming,
    );
  });
});
