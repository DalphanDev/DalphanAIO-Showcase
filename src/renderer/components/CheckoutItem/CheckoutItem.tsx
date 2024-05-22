import styles from './CheckoutItem.module.scss';

export default function CheckoutItem({
  id,
  img,
  product,
  size,
  site,
  proxy,
  orderNumber,
}: {
  id: string;
  img: string;
  product: string;
  size: string;
  site: string;
  proxy: string;
  orderNumber: string;
}) {
  return (
    <div id={styles.container} key={id}>
      <img src={img} alt="?" />
      <p id={styles.product}>{product}</p>
      <p id={styles.size}>{size}</p>
      <p id={styles.site}>{site}</p>
      <p id={styles.proxy}>{proxy}</p>
      <p id={styles.orderNumber}>{orderNumber}</p>
    </div>
  );
}
