import type { PurchaseRequest } from "../../types/purchase-request";
import styles from "./PurchaseRequestTable.module.scss";

interface PurchaseRequestTableProps {
  requests: PurchaseRequest[];
  hasRequests: boolean;
  isLoading: boolean;
  loadError: string;
  sortBy: "name" | "createdAt";
  sortOrder: "asc" | "desc";
  onSort: (field: "name" | "createdAt") => void;
  onRetry: () => void;
  onEdit: (request: PurchaseRequest) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

function PurchaseRequestTable({
  requests,
  hasRequests,
  isLoading,
  loadError,
  sortBy,
  sortOrder,
  onSort,
  onRetry,
  onEdit,
  onDelete,
  onAdd,
}: PurchaseRequestTableProps) {
  return (
    <>
      <p className={styles.count}>
        Найдено заявок: <span>{requests.length}</span>
      </p>

      <p className={styles.mobileTableHint}>
        Прокручивайте таблицу вправо, чтобы увидеть остальные столбцы →
      </p>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <button type="button" onClick={() => onSort("name")}>
                  Наименование
                  {sortBy === "name" && (sortOrder === "asc" ? " ↑" : " ↓")}
                </button>
              </th>
              <th>
                <button type="button" onClick={() => onSort("createdAt")}>
                  Дата создания
                  {sortBy === "createdAt" &&
                    (sortOrder === "asc" ? " ↑" : " ↓")}
                </button>
              </th>
              <th>Количество</th>
              <th>Единица</th>
              <th>Отдел</th>
              <th>Комментарий</th>
              <th>Ссылка</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={8}
                  className={styles.emptyState}
                  aria-live="polite"
                >
                  Загрузка заявок...
                </td>
              </tr>
            ) : loadError ? (
              <tr>
                <td
                  colSpan={8}
                  className={styles.emptyState}
                  aria-live="polite"
                >
                  <p>{loadError}</p>
                  <button
                    type="button"
                    onClick={onRetry}
                    className={styles.actionButton}
                  >
                    Повторить загрузку
                  </button>
                </td>
              </tr>
            ) : requests.length > 0 ? (
              requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.name}</td>
                  <td>{new Date(request.createdAt).toLocaleString("ru-RU")}</td>
                  <td>{request.quantity}</td>
                  <td>{request.unit}</td>
                  <td>{request.department === "it" ? "IT" : "Офис"}</td>
                  <td>{request.comment || "—"}</td>
                  <td>
                    {request.productUrl ? (
                      <a
                        href={request.productUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Открыть
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() => onEdit(request)}
                    >
                      Редактировать
                    </button>

                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => onDelete(request.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className={styles.emptyState}>
                  {hasRequests ? (
                    "По заданным условиям ничего не найдено."
                  ) : (
                    <div>
                      <p>Пока нет ни одной заявки</p>
                      <p>
                        Добавь первую заявку, чтобы она появилась в общем
                        списке.
                      </p>
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={onAdd}
                      >
                        Добавить заявку
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default PurchaseRequestTable;
