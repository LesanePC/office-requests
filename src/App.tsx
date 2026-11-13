import { useEffect, useRef, useState } from "react";
import { usePurchaseRequests } from "./hooks/usePurchaseRequests";
import type {
  CreatePurchaseRequestDto,
  PurchaseRequest,
} from "./types/purchase-request";
import PurchaseRequestForm from "./components/PurchaseRequestForm";
import styles from "./App.module.scss";
import { useFilteredPurchaseRequests } from "./hooks/useFilteredPurchaseRequests";
import PurchaseRequestTable from "./components/PurchaseRequestTable/PurchaseRequestTable";
import Toast from "./components/Toast/Toast";

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

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

  function handleEditRequest(request: PurchaseRequest) {
    setEditingId(request.id);
    setIsFormOpen(true);
  }

  function resetForm() {
    setIsFormOpen(false);
    setEditingId(null);
  }

  async function handleCreateRequest(data: CreatePurchaseRequestDto) {
    try {
      if (editingId === null) {
        await createRequest(data);
        setToast({
          message: "Заявка успешно добавлена",
          type: "success",
        });
      } else {
        await updateRequest(editingId, data);
        setToast({
          message: "Изменения успешно сохранены",
          type: "success",
        });
      }

      resetForm();
    } catch (error) {
      console.error("Ошибка сохранения заявки:", error);
      throw error;
    }
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

      setToast({
        message: "Заявка успешно удалена",
        type: "success",
      });
    } catch (error) {
      console.error("Ошибка удаления заявки:", error);

      setToast({
        message: "Не удалось удалить заявку. Попробуй ещё раз.",
        type: "error",
      });
    }
  }
  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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

        <PurchaseRequestTable
          requests={sortedRequests}
          hasRequests={requests.length > 0}
          isLoading={isLoading}
          loadError={loadError}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onRetry={loadRequests}
          onEdit={handleEditRequest}
          onDelete={handleDeleteRequest}
          onAdd={() => setIsFormOpen(true)}
        />
      </main>
    </>
  );
}

export default App;
