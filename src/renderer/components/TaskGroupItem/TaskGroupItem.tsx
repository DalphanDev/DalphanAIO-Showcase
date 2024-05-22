import styles from './TaskGroupItem.module.scss';

export default function TaskGroupItem({
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
        console.log(e);
        displayMenu(id, e.clientX, e.clientY);
      }}
    >
      <p id={styles.name}>{name}</p>
      <p id={styles.number}>{amount} Tasks</p>
    </button>
  );
}
