import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import dalphan from '../../../../assets/images/dalphan.svg';
import person from '../../../../assets/images/person.svg';
import popout from '../../../../assets/images/popout.svg';
import trash from '../../../../assets/images/trash.svg';
import styles from './HarvesterItem.module.scss';
import { removeHarvester } from '../Harvesters/slice';

export default function HarvesterItem({
  id,
  name,
  type,
  status,
  statusColor,
  proxy,
  editHarvesterMenu,
}: {
  id: string;
  name: string;
  type: string;
  status: string;
  statusColor: string;
  proxy: string;
  editHarvesterMenu: (
    id: string,
    name: string,
    type: string,
    status: string,
    statusColor: string,
    proxy: string,
  ) => void;
}) {
  const dispatch = useDispatch();

  const remove = () => {
    dispatch(removeHarvester(id));

    window.electron.ipcRenderer.send('remove-harvester', id);
  };

  const launch = () => {
    window.electron.ipcRenderer.send('launch-harvester', {
      id,
      name,
      type,
      status,
      statusColor,
      proxy,
    });
  };

  return (
    <div id={styles.container}>
      <p id={styles.name}>{name}</p>
      <p id={styles.type}>{type}</p>
      <div id={styles.iconContainer}>
        <div className={styles.spinner1}>
          <div className={styles.spinner2}>
            <div />
          </div>
        </div>
        <img id={styles.icon} src={dalphan} alt="" />
      </div>
      <div id={styles.buttons}>
        <button
          id={styles.login}
          type="button"
          tabIndex={-1}
          onClick={() => {
            editHarvesterMenu(id, name, type, status, statusColor, proxy);
          }}
        >
          <img src={person} alt="" />
        </button>
        <button id={styles.open} type="button" tabIndex={-1} onClick={launch}>
          <img src={popout} alt="" />
        </button>
        <button id={styles.delete} type="button" tabIndex={-1} onClick={remove}>
          <img src={trash} alt="" />
        </button>
      </div>
    </div>
  );
}

HarvesterItem.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  proxy: PropTypes.string.isRequired,
};
