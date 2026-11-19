import { describe, expect, it } from "vitest";
import { buildPurchaseRequestsCsv } from "./exportPurchaseRequests";

describe("buildPurchaseRequestsCsv", () => {
  const mockRequest = {
    id: "1",
    name: "Монитор",
    quantity: 2,
    unit: "шт.",
    department: "it" as const,
    productUrl: "https://example.com/monitor",
    comment: "Для новых сотрудников",
    createdBy: "Евгений",
    createdAt: "2026-10-27T10:00:00.000Z",
    updatedAt: "2026-10-27T11:00:00.000Z",
  };

  it("преобразует заявку в строку CSV", () => {
    const result = buildPurchaseRequestsCsv([mockRequest]);

    expect(result).toContain(
      "1;Монитор;2;шт.;IT;https://example.com/monitor;Для новых сотрудников;Евгений;",
    );
  });

  it("добавляет BOM и заголовки CSV", () => {
    const result = buildPurchaseRequestsCsv([]);

    expect(result.startsWith("\uFEFF")).toBe(true);

    expect(result).toContain(
      "ID;Наименование;Количество;Единица измерения;Отдел;Ссылка на товар;Комментарий;Кем создана;Дата создания;Дата обновления",
    );
  });
  it("экранирует специальные символы в значениях CSV", () => {
    const requestWithSpecialCharacters = {
      ...mockRequest,
      comment: 'Для офиса; модель "Pro"\nСрочная закупка',
    };

    const result = buildPurchaseRequestsCsv([requestWithSpecialCharacters]);

    expect(result).toContain('"Для офиса; модель ""Pro""\nСрочная закупка"');
  });
  it("возвращает только заголовки, если заявок нет", () => {
    const result = buildPurchaseRequestsCsv([]);

    const rows = result.replace("\uFEFF", "").split("\r\n");

    expect(rows).toHaveLength(1);
    expect(rows[0]).toContain("ID;Наименование;Количество");
  });
  it("заменяет null на пустые ячейки", () => {
    const requestWithEmptyFields = {
      ...mockRequest,
      department: "office" as const,
      productUrl: null,
      comment: null,
      createdBy: null,
    };

    const result = buildPurchaseRequestsCsv([requestWithEmptyFields]);

    expect(result).toContain(";Офис;;;;");
    expect(result).not.toContain("null");
  });
});
