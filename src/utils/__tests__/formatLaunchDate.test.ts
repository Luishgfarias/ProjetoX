import { formatLaunchDate } from "../formatLaunchDate";

describe("formatLaunchDate", () => {
  it("formata date_utc de forma amigavel", () => {
    expect(formatLaunchDate("2006-03-24T22:30:00.000Z")).toBe(
      "24/03/2006 às 22:30 UTC",
    );
  });

  it("formata date_local preservando a hora local da string", () => {
    expect(formatLaunchDate("2006-03-25T10:30:00-04:00")).toBe(
      "25/03/2006 às 10:30",
    );
  });

  it("formata datas sem horario", () => {
    expect(formatLaunchDate("2026-05-14")).toBe("14/05/2026");
  });

  it("retorna o valor original quando a data for invalida", () => {
    expect(formatLaunchDate("data-invalida")).toBe("data-invalida");
  });
});
