import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { RootState } from '../../store';
import Welcome from '../../../../assets/images/DashboardWelcome.svg';
// import ViewLicense from '../../../../assets/images/ViewLicenseButton.svg';
import NotificationCenter from '../NotificationCenter/NotificationCenter';
import styles from './Settings.module.scss';
import { setSettingsData } from './slice';

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
  const userData = useSelector((state: RootState) => state.user.userData);
  const settingsData = useSelector((state: RootState) => state.settings);

  const [successWebhook, setSuccessWebhook] = useState(
    settingsData.webhook.success,
  );
  const [failureWebhook, setFailureWebhook] = useState(
    settingsData.webhook.failure,
  );
  const [miscWebhook, setMiscWebhook] = useState(settingsData.webhook.misc);
  const [updateStatus, setUpdateStatus] = useState('Checking for updates...');
  const [apiKey, setApiKey] = useState(settingsData.aycd.apiKey);
  const [aiKey, setAiKey] = useState(settingsData.aycd.aiKey);

  useEffect(() => {
    const updateSettingsData = () => {
      const data = {
        aycd: {
          apiKey,
          aiKey,
        },
        version: {
          main: settingsData.version.main,
          hotfix: settingsData.version.hotfix,
        },
        webhook: {
          success: successWebhook,
          failure: failureWebhook,
          misc: miscWebhook,
        },
      };

      dispatch(setSettingsData(data));

      // Write the data to the proxies.json file
      window.electron.ipcRenderer.send('write-settings', data);
    };

    updateSettingsData();
  }, [
    successWebhook,
    failureWebhook,
    miscWebhook,
    settingsData.version.main,
    settingsData.version.hotfix,
    dispatch,
    aiKey,
    apiKey,
  ]);

  useEffect(() => {
    const updateVersionStatus = (arg: any) => {
      setUpdateStatus(arg);
    };

    window.electron.ipcRenderer.on('check-for-updates', updateVersionStatus);

    return () => {
      window.electron.ipcRenderer.removeListener(
        'check-for-updates',
        updateVersionStatus,
      );
    };
  });

  const testSuccessWebhook = () => {
    window.electron.ipcRenderer.send('test-webhook', [
      'success',
      successWebhook,
    ]);
  };

  const testFailureWebhook = () => {
    window.electron.ipcRenderer.send('test-webhook', [
      'failure',
      failureWebhook,
    ]);
  };

  const testMiscWebhook = () => {
    window.electron.ipcRenderer.send('test-webhook', ['misc', miscWebhook]);
  };

  const checkForUpdates = async () => {
    window.electron.ipcRenderer.send('check-for-updates');
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div id={styles.harvesters}>
      <div id={styles.title}>
        <p>Settings</p>
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
            <div id={styles.leftSection}>
              <div id={styles.licenseBlock}>
                <div id={styles.blockTitle}>
                  <p>License</p>
                </div>
                <div id={styles.blockContent}>
                  <div id={styles.user}>
                    <div id={styles.imgContainer}>
                      <img
                        src={userData ? userData.img : ''}
                        width={80}
                        height={80}
                        alt="?"
                      />
                    </div>
                    <div id={styles.userText} className="bold">
                      <h2>{userData ? userData.name : ''}</h2>
                    </div>
                  </div>
                  <div id={styles.key}>
                    License Key:{' '}
                    <span className="bold">
                      {userData ? userData.key : '?'}
                    </span>
                  </div>
                  <div id={styles.keyButtons}>
                    {/* <button
                      id={styles.view}
                      type="button"
                      aria-label="ViewLicense"
                    >
                      <img src={ViewLicense} alt="View License" />
                    </button> */}
                  </div>
                </div>
              </div>
              <div id={styles.webhookBlock}>
                <div id={styles.blockTitle}>
                  <p>Discord Webhooks</p>
                </div>
                <div id={styles.blockContent}>
                  <div id={styles.inputRow}>
                    <div id={styles.inputContainer}>
                      <p>Success Webhook</p>
                      <div id={styles.inputData}>
                        <input
                          type="text"
                          placeholder="Webhook"
                          defaultValue={successWebhook}
                          onChange={(e) => setSuccessWebhook(e.target.value)}
                          spellCheck={false}
                        />
                        <button
                          id={styles.test}
                          type="button"
                          onClick={testSuccessWebhook}
                        >
                          Test
                        </button>
                      </div>
                    </div>
                  </div>
                  <div id={styles.inputRow}>
                    <div id={styles.inputContainer}>
                      <p>Failure Webhook</p>
                      <div id={styles.inputData}>
                        <input
                          type="text"
                          placeholder="Webhook"
                          defaultValue={failureWebhook}
                          onChange={(e) => setFailureWebhook(e.target.value)}
                          spellCheck={false}
                        />
                        <button
                          id={styles.test}
                          type="button"
                          onClick={testFailureWebhook}
                        >
                          Test
                        </button>
                      </div>
                    </div>
                  </div>

                  <div id={styles.inputRow}>
                    <div id={styles.inputContainer}>
                      <p>Misc Webhook</p>
                      <div id={styles.inputData}>
                        <input
                          type="text"
                          placeholder="Webhook"
                          defaultValue={miscWebhook}
                          onChange={(e) => setMiscWebhook(e.target.value)}
                          spellCheck={false}
                        />
                        <button
                          id={styles.test}
                          type="button"
                          onClick={testMiscWebhook}
                        >
                          Test
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div id={styles.rightSection}>
              <div id={styles.versionBlock}>
                <div id={styles.blockTitle}>
                  <p>Version</p>
                </div>
                <div id={styles.blockContent}>
                  <div id={styles.inputRow}>
                    <div id={styles.inputContainer}>
                      <p>Main</p>
                      <div id={styles.inputData}>
                        <input
                          type="text"
                          placeholder="Webhook"
                          defaultValue={`Version v${settingsData.version.main}`}
                          disabled
                          spellCheck={false}
                        />
                      </div>
                    </div>
                  </div>
                  <div id={styles.inputRow}>
                    <div id={styles.inputContainer}>
                      <p>Hotfix</p>
                      <div id={styles.inputData}>
                        <input
                          type="text"
                          placeholder="Webhook"
                          defaultValue={`Version v${settingsData.version.hotfix}`}
                          disabled
                          spellCheck={false}
                        />
                      </div>
                    </div>
                  </div>
                  <div id={styles.buttonRow}>
                    <p>Status: {updateStatus}</p>
                    <button
                      id={styles.checkForUpdates}
                      type="button"
                      onClick={checkForUpdates}
                    >
                      Check for Updates
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div id={styles.aycdBlock}>
                <div id={styles.blockTitle}>
                  <p>AYCD</p>
                </div>
                <div id={styles.blockContent}>
                  <div id={styles.inputRow}>
                    <div id={styles.inputContainer}>
                      <p>Bot API Key</p>
                      <div id={styles.inputData}>
                        <input
                          type="text"
                          placeholder="Bot API Key"
                          defaultValue={apiKey.key}
                          spellCheck={false}
                          onChange={(e: any) => {
                            setApiKey({
                              key: e.target.value,
                              connected: false,
                            });
                          }}
                        />
                        <div
                          id={
                            settingsData.aycd.apiKey.connected
                              ? styles.connected
                              : styles.disconnected
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div id={styles.inputRow}>
                    <div id={styles.inputContainer}>
                      <p>Autosolve AI Key</p>
                      <div id={styles.inputData}>
                        <input
                          type="text"
                          placeholder="Autosolve AI Key"
                          defaultValue={aiKey.key}
                          spellCheck={false}
                          onChange={(e: any) => {
                            setAiKey({
                              key: e.target.value,
                              connected: false,
                            });
                          }}
                        />
                        <div
                          id={
                            settingsData.aycd.aiKey.connected
                              ? styles.connected
                              : styles.disconnected
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <NotificationCenter />
      </div>
    </div>
  );
}
