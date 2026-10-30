import { useEffect, useRef, useState } from "react";
import type {
  CreatePurchaseRequestDto,
  PurchaseRequest,
} from "../types/purchase-request";
import styles from "./PurchaseRequestForm.module.scss";

type PurchaseRequestFormProps = {
  initialData: PurchaseRequest | null;
  onSave: (data: CreatePurchaseRequestDto) => void | Promise<void>;
  onCancel: () => void;
};

function PurchaseRequestForm(props: PurchaseRequestFormProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);
  const [name, setName] = useState(
    props.initialData !== null ? props.initialData.name : "",
  );
  const [quantity, setQuantity] = useState(
    props.initialData !== null ? props.initialData.quantity : 1,
  );
  const [department, setDepartment] = useState<"it" | "office">(
    props.initialData !== null ? props.initialData.department : "it",
  );
  const [comment, setComment] = useState(
    props.initialData ? (props.initialData.comment ?? "") : "",
  );
  const [productUrl, setProductUrl] = useState(
    props.initialData ? (props.initialData.productUrl ?? "") : "",
  );
  const [nameError, setNameError] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [productUrlError, setProductUrlError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handleSave() {
    if (isSaving) {
      return;
    }
    setProductUrlError("");
    setNameError("");
    setQuantityError("");

    if (name.trim() === "") {
      setNameError("Введи наименование товара");
    }

    if (
      quantity < 1 ||
      !Number.isInteger(quantity) ||
      !Number.isFinite(quantity)
    ) {
      setQuantityError("Укажи целое число больше нуля");
    }

    if (
      name.trim() === "" ||
      quantity < 1 ||
      !Number.isInteger(quantity) ||
      !Number.isFinite(quantity)
    ) {
      return;
    }
    if (productUrl.trim() !== "") {
      try {
        const url = new URL(productUrl);

        if (url.protocol !== "http:" && url.protocol !== "https:") {
          throw new Error("Недопустимый протокол ссылки");
        }
      } catch {
        setProductUrlError(
          "Введи корректную ссылку на товар, например https://example.com",
        );
        return;
      }
    }
    const data: CreatePurchaseRequestDto = {
      productUrl: productUrl.trim() || null,
      comment: comment.trim() || null,
      name: name.trim(),
      quantity: quantity,
      unit: "шт.",
      department: department,
    };
    setIsSaving(true);
    setSaveError("");

    try {
      await props.onSave(data);
    } catch {
      setSaveError("Не удалось сохранить заявку. Попробуй ещё раз.");
    } finally {
      setIsSaving(false);
    }
  }
  return (
    <div className={styles.form}>
      <h2>{props.initialData ? "Редактирование заявки" : "Новая заявка"}</h2>
      {saveError && <span className={styles.error}>{saveError}</span>}
      <label htmlFor="request-name">
        Наименование
        <input
          ref={nameInputRef}
          id="request-name"
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setNameError("");
          }}
        />
        {nameError && <span className={styles.error}>{nameError}</span>}
      </label>
      <label htmlFor="request-quantity">
        Количество
        <input
          id="request-quantity"
          type="number"
          min="1"
          value={Number.isNaN(quantity) ? "" : quantity}
          onChange={(event) => {
            const value = event.target.value;

            setQuantity(value === "" ? NaN : Number(value));
            setQuantityError("");
          }}
        />
        {quantityError && <span className={styles.error}>{quantityError}</span>}
      </label>
      <label htmlFor="request-department">
        Отдел
        <select
          id="request-department"
          value={department}
          onChange={(event) =>
            setDepartment(event.target.value as "it" | "office")
          }
        >
          <option value="it">IT</option>
          <option value="office">Офис</option>
        </select>
      </label>
      <label htmlFor="request-comment">
        Комментарий
        <textarea
          id="request-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Для чего нужна покупка?"
        />
      </label>
      <label>
        Ссылка на товар
        <input
          type="url"
          value={productUrl}
          onChange={(event) => {
            setProductUrl(event.target.value);
            setProductUrlError("");
          }}
          placeholder="https://..."
        />
        {productUrlError && (
          <span className={styles.error}>{productUrlError}</span>
        )}
      </label>
      <div className={styles.actions}>
        <button type="button" onClick={props.onCancel}>
          Отменить
        </button>

        <button type="button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Сохранение..." : "Сохранить"}
        </button>
      </div>
    </div>
  );
}

export default PurchaseRequestForm;
