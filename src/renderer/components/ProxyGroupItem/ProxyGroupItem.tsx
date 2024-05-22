import styles from './ProxyGroupItem.module.scss';

export default function ProxyGroupItem({
  id,
  name,
  amount,
  selectGroup,
  selected,
  displayMenu,
}: {
  id: string;
  name: string;
  amount: number;
  selectGroup: (id: string) => void;
  selected: boolean;
  displayMenu: (id: string, xCoordinate: number, yCoordinate: number) => void;
}) {
  return (
    <button
      type="button"
      id={selected ? styles.container2 : styles.container}
      onClick={() => {
        selectGroup(id);
      }}
      onAuxClick={(e) => {
        displayMenu(id, e.clientX, e.clientY);
      }}
    >
      <p id={styles.name}>{name}</p>
      <p id={styles.number}>{amount} Proxies</p>
    </button>
  );
}
