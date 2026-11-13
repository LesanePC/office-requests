import styles from "./Toast.module.scss";

type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  return (
    <div
      className={`${styles.toast} ${styles[type]}`}
      role="status"
      aria-live="polite"
    >
      {message}
      <button
        type="button"
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Закрыть уведомление"
      >
        ×
      </button>
    </div>
  );
}

export default Toast;
