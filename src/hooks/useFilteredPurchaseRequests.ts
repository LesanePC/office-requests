import { useState } from "react";
import type { PurchaseRequest } from "../types/purchase-request";

export function useFilteredPurchaseRequests(requests: PurchaseRequest[]) {
  const [search, setSearch] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "createdAt">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesDepartment =
      departmentFilter === "all" || request.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    let result = 0;

    if (sortBy === "name") {
      result = a.name.localeCompare(b.name, "ru");
    } else {
      result =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    return sortOrder === "asc" ? result : -result;
  });

  function handleSort(field: "name" | "createdAt") {
    if (sortBy === field) {
      setSortOrder((currentOrder) => (currentOrder === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  const hasActiveFilters = search.trim() !== "" || departmentFilter !== "all";

  return {
    search,
    setSearch,
    departmentFilter,
    setDepartmentFilter,
    sortBy,
    sortOrder,
    hasActiveFilters,
    filteredRequests,
    sortedRequests,
    handleSort,
  };
}
