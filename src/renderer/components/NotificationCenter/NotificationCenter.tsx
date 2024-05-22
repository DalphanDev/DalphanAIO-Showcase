import Checkout from '../CheckoutNotification/CheckoutNotification';
import styles from './NotificationCenter.module.scss';

export default function NotificationCenter() {
  return (
    <div id={styles.checkouts}>
      <div id={styles.blur} />
      <ul id={styles.inner}>
        <Checkout />
        <Checkout />
        <Checkout />
        <Checkout />
        <Checkout />
        <Checkout />
        <Checkout />
        <Checkout />
      </ul>
    </div>
  );
}
