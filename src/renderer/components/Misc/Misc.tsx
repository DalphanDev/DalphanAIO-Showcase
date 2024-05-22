import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { RootState } from '../../store';
import Welcome from '../../../../assets/images/DashboardWelcome.svg';
import NotificationCenter from '../NotificationCenter/NotificationCenter';
import styles from './Misc.module.scss';
import { setMiscData, Misc } from './slice';
import CustomShopifyMenu from '../CustomShopifyMenu/CustomShopifyMenu';

function minimizeWindow() {
  window.electron.ipcRenderer.send('window', ['minimize']);
}

function maximizeWindow() {
  window.electron.ipcRenderer.send('window', ['maximize']);
}

function closeApp() {
  window.electron.ipcRenderer.send('window', ['close']);
}

export default function Settings() {
  const dispatch = useDispatch();
  const miscData = useSelector((state: RootState) => state.misc);

  const [displayCustomShopifyMenu, setDisplayCustomShopifyMenu] =
    useState(false);

  useEffect(() => {
    const updateMiscData = () => {
      const data = {
        automations: {
          shopify: [],
          nike: [],
        },
        customShopify: miscData.customShopify,
      } as Misc;
      dispatch(setMiscData(data));

      // Write the data to the misc.json file
      window.electron.ipcRenderer.send('write-misc', data);
    };

    updateMiscData();
  }, [dispatch, miscData.customShopify]);

  const customShopifyMenu = () => {
    // This function takes in arguments from the harvester item and displays a menu
    setDisplayCustomShopifyMenu(true);
  };

  const hideCustomShopifyMenu = () => {
    setDisplayCustomShopifyMenu(false);
  };

  const renderCustomShopifyMenu = () => {
    if (displayCustomShopifyMenu) {
      return (
        <CustomShopifyMenu
          hideMenu={hideCustomShopifyMenu}
          menuData={miscData.customShopify}
        />
      );
    }
    return <div />;
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div id={styles.harvesters}>
      <div id={styles.title}>
        <p>Miscellaneous</p>
        <img
          src={Welcome}
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
          <div id={styles.settingsBlocks}>
            <button
              type="button"
              id={styles.customShopifyButton}
              className={styles.buttonStyling}
              onClick={customShopifyMenu}
            >
              Custom Shopify
            </button>
            <button
              type="button"
              id={styles.shopifyAutomationButton}
              className={styles.buttonStyling}
            >
              Shopify Automation
            </button>
            <button
              type="button"
              id={styles.nikeAutomationButton}
              className={styles.buttonStyling}
            >
              Nike Automation
            </button>
          </div>
        </div>
        <NotificationCenter />
      </div>
      {renderCustomShopifyMenu()}
    </div>
  );
}
