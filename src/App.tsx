import { useEffect, useRef, useState } from "react";
import { usePurchaseRequests } from "./hooks/usePurchaseRequests";
import type {
  CreatePurchaseRequestDto,
  PurchaseRequest,
} from "./types/purchase-request";
import PurchaseRequestForm from "./components/PurchaseRequestForm";
import styles from "./App.module.scss";
import { useFilteredPurchaseRequests } from "./hooks/useFilteredPurchaseRequests";

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const wasFormOpenRef = useRef(false);

  const {
    requests,
    isLoading,
    loadError,
    loadRequests,
    createRequest,
    updateRequest,
    deleteRequest,
  } = usePurchaseRequests();

  const {
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
  } = useFilteredPurchaseRequests(requests);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isFormOpen) {
        return;
      }

      if (event.key === "Escape") {
        resetForm();
        return;
      }

      if (event.key === "Tab") {
        const modal = modalRef.current;

        if (!modal) {
          return;
        }

        const focusableElements = modal.querySelectorAll<HTMLElement>(
          "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]",
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFormOpen]);

  useEffect(() => {
    if (wasFormOpenRef.current && !isFormOpen) {
      addButtonRef.current?.focus();
    }

    wasFormOpenRef.current = isFormOpen;
  }, [isFormOpen]);

  async function handleCreateRequest(data: CreatePurchaseRequestDto) {
    try {
      if (editingId === null) {
        await createRequest(data);
      } else {
        await updateRequest(editingId, data);
      }

      resetForm();
    } catch (error) {
      console.error("Ошибка сохранения заявки:", error);
      throw error;
    }
  }

  function handleEditRequest(request: PurchaseRequest) {
    setEditingId(request.id);
    setIsFormOpen(true);
  }

  function resetForm() {
    setIsFormOpen(false);
    setEditingId(null);
  }

  async function handleDeleteRequest(id: string) {
    const confirmed = window.confirm(
      "Ты действительно хочешь удалить эту заявку?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteRequest(id);
    } catch (error) {
      console.error("Ошибка удаления заявки:", error);
      alert("Не удалось удалить заявку. Попробуй ещё раз.");
    }
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Заявки на закупку</h1>

      <div className={styles.toolbar}>
        <button
          ref={addButtonRef}
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
        >
          Добавить заявку
        </button>

        <input
          className={styles.search}
          type="text"
          placeholder="Поиск по наименованию..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          className={styles.filter}
          value={departmentFilter}
          onChange={(event) => setDepartmentFilter(event.target.value)}
        >
          <option value="all">Все отделы</option>
          <option value="it">IT</option>
          <option value="office">Офис</option>
        </select>
        {hasActiveFilters && (
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => {
              setSearch("");
              setDepartmentFilter("all");
            }}
          >
            Сбросить фильтры
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className={styles.modalOverlay} onClick={resetForm}>
          <div
            ref={modalRef}
            className={styles.modalContent}
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <PurchaseRequestForm
              initialData={
                requests.find((request) => request.id === editingId) ?? null
              }
              onSave={handleCreateRequest}
              onCancel={resetForm}
            />
          </div>
        </div>
      )}

      <p className={styles.count}>
        Найдено заявок: <span>{filteredRequests.length}</span>
      </p>
      <p className={styles.mobileTableHint}>
        Прокручивайте таблицу вправо, чтобы увидеть остальные столбцы →
      </p>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <button type="button" onClick={() => handleSort("name")}>
                  Наименование
                  {sortBy === "name" && (sortOrder === "asc" ? " ↑" : " ↓")}
                </button>
              </th>
              <th>
                <button type="button" onClick={() => handleSort("createdAt")}>
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
                    onClick={loadRequests}
                    className={styles.actionButton}
                  >
                    Повторить загрузку
                  </button>
                </td>
              </tr>
            ) : sortedRequests.length > 0 ? (
              sortedRequests.map((request) => (
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
                      className={styles.actionButton}
                      onClick={() => handleEditRequest(request)}
                    >
                      Редактировать
                    </button>

                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteRequest(request.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className={styles.emptyState}>
                  {requests.length === 0 ? (
                    <div>
                      <p>Пока нет ни одной заявки</p>
                      <p>
                        Добавь первую заявку, чтобы она появилась в общем
                        списке.
                      </p>
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => setIsFormOpen(true)}
                      >
                        Добавить заявку
                      </button>
                    </div>
                  ) : (
                    "По заданным условиям ничего не найдено."
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default App;
