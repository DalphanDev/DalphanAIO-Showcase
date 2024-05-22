import styles from './CheckoutNotification.module.scss';

export default function Checkout() {
  return (
    <li>
      <div className={styles.contents}>
        <div className={styles.contentsImg}>
          <img
            src="https://imageresize.24i.com/?url=https://www.nakedcph.com/images/65781/open_graph.jpg"
            alt="?"
          />
        </div>
        <div className={styles.contentsText}>
          <h3 className="bold">Checkout</h3>
          <h4>Jordan 1 High OG</h4>
          <h5>Size 10 US</h5>
        </div>
      </div>
    </li>
  );
}
