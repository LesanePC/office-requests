// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFilteredPurchaseRequests } from "./useFilteredPurchaseRequests";
import type { PurchaseRequest } from "../types/purchase-request";

const mockRequests: PurchaseRequest[] = [
  {
    id: "1",
    name: "Монитор",
    quantity: 2,
    unit: "шт.",
    department: "it",
    productUrl: null,
    comment: null,
    createdBy: "Евгений",
    createdAt: "2026-10-27T10:00:00.000Z",
    updatedAt: "2026-10-27T10:00:00.000Z",
  },
  {
    id: "2",
    name: "Клавиатура",
    quantity: 5,
    unit: "шт.",
    department: "it",
    productUrl: null,
    comment: null,
    createdBy: "Евгений",
    createdAt: "2026-10-28T10:00:00.000Z",
    updatedAt: "2026-10-28T10:00:00.000Z",
  },
  {
    id: "3",
    name: "Кресло",
    quantity: 3,
    unit: "шт.",
    department: "office",
    productUrl: null,
    comment: null,
    createdBy: "Евгений",
    createdAt: "2026-10-29T10:00:00.000Z",
    updatedAt: "2026-10-29T10:00:00.000Z",
  },
];

describe("useFilteredPurchaseRequests", () => {
  it("возвращает все заявки при первоначальном рендере", () => {
    const { result } = renderHook(() =>
      useFilteredPurchaseRequests(mockRequests),
    );

    expect(result.current.search).toBe("");
    expect(result.current.departmentFilter).toBe("all");
    expect(result.current.sortBy).toBe("name");
    expect(result.current.sortOrder).toBe("asc");

    expect(result.current.filteredRequests).toHaveLength(3);
    expect(result.current.sortedRequests).toHaveLength(3);
  });
});

it("выполняет поиск без учёта регистра", () => {
  const { result } = renderHook(() =>
    useFilteredPurchaseRequests(mockRequests),
  );

  act(() => {
    result.current.setSearch("МОНИТОР");
  });

  expect(result.current.filteredRequests).toHaveLength(1);
  expect(result.current.filteredRequests[0].id).toBe("1");
});

it("фильтрует заявки по отделу", () => {
  const { result } = renderHook(() =>
    useFilteredPurchaseRequests(mockRequests),
  );

  act(() => {
    result.current.setDepartmentFilter("it");
  });

  expect(result.current.filteredRequests).toHaveLength(2);
  expect(
    result.current.filteredRequests.every(
      (request) => request.department === "it",
    ),
  ).toBe(true);
});

it("применяет поиск и фильтр по отделу одновременно", () => {
  const { result } = renderHook(() =>
    useFilteredPurchaseRequests(mockRequests),
  );

  act(() => {
    result.current.setSearch("К");
    result.current.setDepartmentFilter("it");
  });

  expect(result.current.filteredRequests).toHaveLength(1);
  expect(result.current.filteredRequests[0].id).toBe("2");
});

it("сортирует заявки по названию по возрастанию", () => {
  const { result } = renderHook(() =>
    useFilteredPurchaseRequests(mockRequests),
  );

  expect(result.current.sortedRequests.map((request) => request.name)).toEqual([
    "Клавиатура",
    "Кресло",
    "Монитор",
  ]);
});

it("сортирует заявки по названию по убыванию", () => {
  const { result } = renderHook(() =>
    useFilteredPurchaseRequests(mockRequests),
  );

  act(() => {
    result.current.handleSort("name");
  });

  expect(result.current.sortOrder).toBe("desc");

  expect(result.current.sortedRequests.map((request) => request.name)).toEqual([
    "Монитор",
    "Кресло",
    "Клавиатура",
  ]);
});

it("сортирует заявки по дате создания по возрастанию", () => {
  const { result } = renderHook(() =>
    useFilteredPurchaseRequests(mockRequests),
  );

  act(() => {
    result.current.handleSort("createdAt");
  });

  expect(result.current.sortBy).toBe("createdAt");
  expect(result.current.sortOrder).toBe("asc");

  expect(result.current.sortedRequests.map((request) => request.id)).toEqual([
    "1",
    "2",
    "3",
  ]);
});

it("сортирует заявки по дате создания по убыванию", () => {
  const { result } = renderHook(() =>
    useFilteredPurchaseRequests(mockRequests),
  );

  act(() => {
    result.current.handleSort("createdAt");
  });

  act(() => {
    result.current.handleSort("createdAt");
  });

  expect(result.current.sortOrder).toBe("desc");

  expect(result.current.sortedRequests.map((request) => request.id)).toEqual([
    "3",
    "2",
    "1",
  ]);
});

it("возвращает false, если фильтры не заданы", () => {
  const { result } = renderHook(() =>
    useFilteredPurchaseRequests(mockRequests),
  );

  expect(result.current.hasActiveFilters).toBe(false);
});

it("возвращает true, если задан поисковый запрос", () => {
  const { result } = renderHook(() =>
    useFilteredPurchaseRequests(mockRequests),
  );

  act(() => {
    result.current.setSearch("Монитор");
  });

  expect(result.current.hasActiveFilters).toBe(true);
});

it("возвращает true, если выбран конкретный отдел", () => {
  const { result } = renderHook(() =>
    useFilteredPurchaseRequests(mockRequests),
  );

  act(() => {
    result.current.setDepartmentFilter("it");
  });

  expect(result.current.hasActiveFilters).toBe(true);
});

it("возвращает false после сброса фильтров", () => {
  const { result } = renderHook(() =>
    useFilteredPurchaseRequests(mockRequests),
  );

  act(() => {
    result.current.setSearch("Монитор");
    result.current.setDepartmentFilter("it");
  });

  expect(result.current.hasActiveFilters).toBe(true);

  act(() => {
    result.current.setSearch("");
    result.current.setDepartmentFilter("all");
  });

  expect(result.current.hasActiveFilters).toBe(false);
});

it("возвращает пустой массив, если совпадений нет", () => {
  const { result } = renderHook(() =>
    useFilteredPurchaseRequests(mockRequests),
  );

  act(() => {
    result.current.setSearch("Несуществующая заявка");
  });

  expect(result.current.filteredRequests).toHaveLength(0);
  expect(result.current.sortedRequests).toHaveLength(0);
});
