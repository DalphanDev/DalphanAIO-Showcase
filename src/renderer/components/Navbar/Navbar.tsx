import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { RootState } from '../../store';
import titleIcon from '../../../../assets/images/DalphanAIOTitle.svg';
import settingsIcon from '../../../../assets/images/SettingsIcon.svg';
import miscIcon from '../../../../assets/images/MiscIcon.png';
import accountsIcon from '../../../../assets/images/AccountsIcon.svg';
import harvestersIcon from '../../../../assets/images/HarvestersIcon.svg';
import proxiesIcon from '../../../../assets/images/ProxiesIcon.svg';
import profilesIcon from '../../../../assets/images/ProfilesIcon.svg';
import tasksIcon from '../../../../assets/images/TasksIcon.svg';
import dashboardIcon from '../../../../assets/images/DashboardIcon.svg';
import styles from './Navbar.module.scss';

const iconSelected = `${styles.icon} ${styles.iconSelected}`;
const optionSelected = `${styles.text} ${styles.textbox} ${styles.textSelected} semibold`;

const iconUnselected = `${styles.icon} ${styles.iconUnselected}`;
const optionUnselected = `${styles.text} ${styles.textbox} ${styles.textUnselected}`;

export default function Navbar({ wsStatus }: { wsStatus: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();

  const version = useSelector(
    (state: RootState) => state.settings.version.main,
  );

  const isCurrentPath = (path: string) => location.pathname === `/${path}`;

  return (
    <nav id={styles.groupNavbar}>
      <header id={styles.header}>
        <div id={styles.headerBar} />
        <img id={styles.headerImg} src={titleIcon} alt="icon" />
      </header>
      <ul className={`medium ${styles.options}`}>
        <button
          id={isCurrentPath('') ? styles.buttonSelected : ''}
          type="button"
          onClick={() => navigate('')}
        >
          <div className={isCurrentPath('') ? iconSelected : iconUnselected}>
            <img src={dashboardIcon} alt="?" />
          </div>
          <div
            className={isCurrentPath('') ? optionSelected : optionUnselected}
          >
            Dashboard
          </div>
        </button>
        <button
          id={isCurrentPath('tasks') ? styles.buttonSelected : ''}
          type="button"
          onClick={() => navigate('/tasks')}
        >
          <div
            className={isCurrentPath('tasks') ? iconSelected : iconUnselected}
          >
            <img src={tasksIcon} alt="?" />
          </div>
          <div
            className={
              isCurrentPath('tasks') ? optionSelected : optionUnselected
            }
          >
            Tasks
          </div>
        </button>
        <button
          id={isCurrentPath('profiles') ? styles.buttonSelected : ''}
          type="button"
          onClick={() => navigate('/profiles')}
        >
          <div
            className={
              isCurrentPath('profiles') ? iconSelected : iconUnselected
            }
          >
            <img src={profilesIcon} alt="?" />
          </div>
          <div
            className={
              isCurrentPath('profiles') ? optionSelected : optionUnselected
            }
          >
            Profiles
          </div>
        </button>
        <button
          id={isCurrentPath('proxies') ? styles.buttonSelected : ''}
          type="button"
          onClick={() => navigate('/proxies')}
        >
          <div
            className={isCurrentPath('proxies') ? iconSelected : iconUnselected}
          >
            <img src={proxiesIcon} alt="?" />
          </div>
          <div
            className={
              isCurrentPath('proxies') ? optionSelected : optionUnselected
            }
          >
            Proxies
          </div>
        </button>
        <button
          id={isCurrentPath('harvesters') ? styles.buttonSelected : ''}
          type="button"
          onClick={() => navigate('/harvesters')}
        >
          <div
            className={
              isCurrentPath('harvesters') ? iconSelected : iconUnselected
            }
          >
            <img src={harvestersIcon} alt="?" />
          </div>
          <div
            className={
              isCurrentPath('harvesters') ? optionSelected : optionUnselected
            }
          >
            Harvesters
          </div>
        </button>
        <button
          id={isCurrentPath('accounts') ? styles.buttonSelected : ''}
          type="button"
          onClick={() => navigate('/accounts')}
        >
          <div
            className={
              isCurrentPath('accounts') ? iconSelected : iconUnselected
            }
          >
            <img src={accountsIcon} alt="?" />
          </div>
          <div
            className={
              isCurrentPath('accounts') ? optionSelected : optionUnselected
            }
          >
            Accounts
          </div>
        </button>
        <button
          id={isCurrentPath('misc') ? styles.buttonSelected : ''}
          type="button"
          onClick={() => navigate('/misc')}
        >
          <div
            className={isCurrentPath('misc') ? iconSelected : iconUnselected}
          >
            <img id={styles.miscIcon} src={miscIcon} alt="?" />
          </div>
          <div
            className={
              isCurrentPath('misc') ? optionSelected : optionUnselected
            }
          >
            Misc
          </div>
        </button>
        <button
          id={isCurrentPath('settings') ? styles.buttonSelected : ''}
          type="button"
          onClick={() => navigate('/settings')}
        >
          <div
            className={
              isCurrentPath('settings') ? iconSelected : iconUnselected
            }
          >
            <img src={settingsIcon} alt="?" />
          </div>
          <div
            className={
              isCurrentPath('settings') ? optionSelected : optionUnselected
            }
          >
            Settings
          </div>
        </button>
      </ul>
      <footer id={styles.footer}>
        <div id={styles.footerText}>
          <p className="bold">Version {version}</p>
          <div id={styles.status}>
            <div
              className={wsStatus ? styles.connected : styles.disconnected}
            />
            <p>{wsStatus ? 'Connected' : 'Disconnected'}</p>
          </div>
        </div>
      </footer>
    </nav>
  );
}
