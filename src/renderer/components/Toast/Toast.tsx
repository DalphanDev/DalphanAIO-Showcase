import { toast } from 'react-toastify';
import styles from './Toast.module.scss';

type ToastType = 'info' | 'success' | 'warning' | 'error';

function InfoToast({ title, message }: { title: string; message: string }) {
  return (
    <div className={styles.info}>
      <h1>{title}</h1>
      <h2>{message}</h2>
    </div>
  );
}

function SuccessToast({ title, message }: { title: string; message: string }) {
  return (
    <div className={styles.success}>
      <h1>{title}</h1>
      <h2>{message}</h2>
    </div>
  );
}

function WarningToast({ title, message }: { title: string; message: string }) {
  return (
    <div className={styles.warning}>
      <h1>{title}</h1>
      <h2>{message}</h2>
    </div>
  );
}

function ErrorToast({ title, message }: { title: string; message: string }) {
  return (
    <div className={styles.error}>
      <h1>{title}</h1>
      <h2>{message}</h2>
    </div>
  );
}

export default function showToast({
  type,
  title,
  message,
}: {
  type: ToastType;
  title: string;
  message: string;
}) {
  if (type === 'info')
    toast.info(<InfoToast title={title} message={message} />, {});
  if (type === 'success')
    toast.success(<SuccessToast title={title} message={message} />, {});
  if (type === 'warning')
    toast.warn(<WarningToast title={title} message={message} />, {});
  if (type === 'error')
    toast.error(<ErrorToast title={title} message={message} />, {});
}
