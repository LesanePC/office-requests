import type { PurchaseRequest } from "../types/purchase-request";

export function buildPurchaseRequestsCsv(requests: PurchaseRequest[]): string {
  const headers = [
    "ID",
    "Наименование",
    "Количество",
    "Единица измерения",
    "Отдел",
    "Ссылка на товар",
    "Комментарий",
    "Кем создана",
    "Дата создания",
    "Дата обновления",
  ];

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleString("ru-RU");
  };

  const rows = requests.map((request) => [
    request.id,
    request.name,
    request.quantity,
    request.unit,
    request.department === "office" ? "Офис" : "IT",
    request.productUrl ?? "",
    request.comment ?? "",
    request.createdBy ?? "",
    formatDate(request.createdAt),
    formatDate(request.updatedAt),
  ]);

  const escapeCsvValue = (value: string | number): string => {
    const stringValue = String(value);

    if (/[;"\r\n]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  };

  const csvContent = [
    headers.map(escapeCsvValue).join(";"),
    ...rows.map((row) => row.map(escapeCsvValue).join(";")),
  ].join("\r\n");

  return "\uFEFF" + csvContent;
}

export function exportPurchaseRequests(requests: PurchaseRequest[]): void {
  const csvContent = buildPurchaseRequestsCsv(requests);

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `purchase-requests-${new Date().toISOString().slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
