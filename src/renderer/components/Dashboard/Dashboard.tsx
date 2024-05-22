import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Checkout } from '../../appSlice';
import DashboardWelcome from '../../../../assets/images/DashboardWelcome.svg';
import ViewLicense from '../../../../assets/images/ViewLicenseButton.svg';
import Texture from '../../../../assets/images/StatsTexture.svg';
import NikeIcon from '../../../../assets/images/NikeIcon.svg';
import Dollar1 from '../../../../assets/images/Dollar1.png';
import Dollar2 from '../../../../assets/images/Dollar2.png';
import styles from './Dashboard.module.scss';
import CheckoutItem from '../CheckoutItem/CheckoutItem';

const greenStatText = `${styles.green} ${styles.stat} bold truncate`;
const blueStatText = `${styles.blue} ${styles.stat} bold truncate`;

function minimizeWindow() {
  window.electron.ipcRenderer.send('window', ['minimize']);
}

function maximizeWindow() {
  window.electron.ipcRenderer.send('window', ['maximize']);
}

function closeApp() {
  window.electron.ipcRenderer.send('window', ['close']);
}

export default function Dashboard() {
  const userData = useSelector((state: RootState) => state.user.userData);
  const checkoutData = useSelector(
    (state: RootState) => state.user.checkoutData,
  );

  if (userData == null) {
    return <div>?</div>;
  }

  if (checkoutData == null) {
    return <div>?</div>;
  }

  const openManageUrl = () => {
    window.electron.ipcRenderer.send('open-url', [userData.manage_url]);
  };

  return (
    <div id={styles.dashboard}>
      <div id={styles.title}>
        <p>Dashboard</p>
        <img
          src={DashboardWelcome}
          alt="
        Welcome to Dalphan AIO"
        />
        <div id={styles.windowActions}>
          <button
            id={styles.windowButton}
            type="button"
            onClick={minimizeWindow}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
              />
            </svg>
          </button>
          <button
            id={styles.windowButton}
            type="button"
            onClick={minimizeWindow}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
              />
            </svg>
          </button>
          <button
            id={styles.windowButton}
            type="button"
            onClick={minimizeWindow}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 12h-15"
              />
            </svg>
          </button>
          <button
            id={styles.windowButton}
            type="button"
            onClick={maximizeWindow}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"
              />
            </svg>
          </button>
          <button id={styles.exitButton} type="button" onClick={closeApp}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
      <div id={styles.content}>
        <div id={styles.main}>
          <section id={styles.header}>
            <div id={styles.user}>
              <div id={styles.imgContainer}>
                <img src={userData.img} width={80} height={80} alt="" />
              </div>
              <div id={styles.userText} className="bold">
                <h3>Welcome Back,</h3>
                <h2>{userData.name}</h2>
              </div>
            </div>
            {/* <button id={styles.reset} type="button" aria-label="ResetKey">
              <img src={ResetKey} alt="Reset Key" />
            </button> */}
            <button
              id={styles.view}
              type="button"
              aria-label="ViewLicense"
              onClick={openManageUrl}
            >
              <img src={ViewLicense} alt="View License" />
            </button>
          </section>
          <div id={styles.fade} />
          <section id={styles.stats}>
            <div id={styles.statsCheckouts}>
              <div className={styles.texture}>
                <img src={Texture} alt="" />
              </div>
              <div className={styles.greenShape} />
              <div id={styles.statsCheckoutsText} className={styles.statText}>
                <div className={styles.titleWrapper}>
                  <h5 className="normal">Total</h5>
                  <h4 className="semibold">Checkouts</h4>
                </div>
                <h2 className={greenStatText}>
                  {checkoutData?.totalCheckouts}
                </h2>
              </div>
            </div>
            <div id={styles.statsSite}>
              <div className={styles.texture}>
                <img src={Texture} alt="" />
              </div>

              <div className={styles.blueShape} />
              <div id={styles.siteIcon}>
                <img src={NikeIcon} alt="?" />
              </div>
              <div id={styles.statsSiteText} className={styles.statText}>
                <div className={styles.titleWrapper}>
                  <h5 className="normal">Best</h5>
                  <h4 className="semibold">Performing Site</h4>
                </div>
                <h2 className={blueStatText}>{checkoutData?.bestSite}</h2>
              </div>
            </div>
            <div id={styles.statsSpent}>
              <div className={styles.texture}>
                <img src={Texture} alt="" />
              </div>
              <div className={styles.greenShape} />
              <img id={styles.dollar1} src={Dollar1} alt="?" />
              <img id={styles.dollar2} src={Dollar2} width={1000} alt="?" />
              <div id={styles.statsSpentText} className={styles.statText}>
                <div className={styles.titleWrapper}>
                  <h5 className="normal">Total</h5>
                  <h4 className="semibold">Money Spent</h4>
                </div>
                <div id={styles.amountSpent}>
                  <h4 className={`heavy ${styles.green}`}>$</h4>
                  <h2 className={greenStatText}>{checkoutData?.totalSpent}</h2>
                </div>
              </div>
            </div>
            <div id={styles.statsProxy}>
              <div className={styles.texture}>
                <img src={Texture} alt="" />
              </div>

              <div className={styles.blueShape} />
              <div id={styles.statsProxyText} className={styles.statText}>
                <div className={styles.titleWrapper}>
                  <h5 className="normal">Best</h5>
                  <h4 className="semibold">Performing Proxy</h4>
                </div>
                <h2 className={blueStatText}>{checkoutData?.bestProxy}</h2>
              </div>
            </div>
          </section>
          <section id={styles.checkouts}>
            <div id={styles.checkoutsHeader}>
              <div id={styles.img} />
              <p id={styles.product}>Product</p>
              <p id={styles.size}>Size</p>
              <p id={styles.site}>Site</p>
              <p id={styles.proxy}>Proxy</p>
              <p id={styles.orderNumber}>Order Number</p>
            </div>
            <div id={styles.checkoutsContainer}>
              <div id={styles.blur} />
              <ul>
                {checkoutData.recentCheckouts.map((checkout: Checkout) => {
                  return (
                    <CheckoutItem
                      id={checkout.id}
                      img={checkout.img}
                      product={checkout.product}
                      size={checkout.size}
                      site={checkout.site}
                      proxy={checkout.proxy}
                      orderNumber={checkout.order_num}
                    />
                  );
                })}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
