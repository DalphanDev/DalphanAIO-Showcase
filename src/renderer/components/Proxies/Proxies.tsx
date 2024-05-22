import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { RootState } from '../../store';
import Welcome from '../../../../assets/images/DashboardWelcome.svg';
import AddButton from '../../../../assets/images/AddButton.png';
import ProxyGroupItem from '../ProxyGroupItem/ProxyGroupItem';
import ProxyAuxMenu from '../ProxyAuxMenu/ProxyAuxMenu';
import ProxyMenu from '../ProxyMenu/ProxyMenu';
import NotificationCenter from '../NotificationCenter/NotificationCenter';
import styles from './Proxies.module.scss';
import {
  addProxyGroup,
  updateProxyGroup,
  removeProxyGroup,
  ProxyGroup,
} from './slice';

function minimizeWindow() {
  window.electron.ipcRenderer.send('window', ['minimize']);
}

function maximizeWindow() {
  window.electron.ipcRenderer.send('window', ['maximize']);
}

function closeApp() {
  window.electron.ipcRenderer.send('window', ['close']);
}

export default function Harvesters() {
  const dispatch = useDispatch();
  const proxyData = useSelector((state: RootState) => state.proxies);

  const [proxyList, setProxyList] = useState<string[]>([]);
  const [groupIsSelected, setGroupIsSelected] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [auxMenu, setAuxMenu] = useState({
    show: false,
    xCoordinate: 0,
    yCoordinate: 0,
    id: '',
  });
  const [proxyMenu, setProxyMenu] = useState(false);
  const [menuData, setMenuData] = useState({
    id: '',
    name: '',
    proxies: [''],
  });

  const selectGroup = (id: string) => {
    // This function takes in the id of the group that was clicked and sets it as the selected group
    setGroupIsSelected(true);
    setSelectedGroupId(id);
    setProxyList(proxyData.find((group) => group.id === id)!.proxies);
  };

  const createProxyGroup = () => {
    const newProxyGroup: ProxyGroup = {
      id: uuidv4(),
      name: 'New Group',
      proxies: [],
    };

    dispatch(addProxyGroup(newProxyGroup));

    // Write the data to the proxies.json file
    window.electron.ipcRenderer.send('write-proxy', newProxyGroup);
  };

  const saveProxyList = () => {
    const id = selectedGroupId;
    const { name } = proxyData.find((group) => group.id === id)!;

    const savedProxyGroup = {
      id,
      name,
      proxies: proxyList,
    };

    dispatch(updateProxyGroup(savedProxyGroup));

    // Write the data to the proxies.json file
    window.electron.ipcRenderer.send('write-proxy', savedProxyGroup);
  };

  const editProxyGroup = () => {
    setProxyMenu(true);
  };

  const deleteProxyGroup = (id: string) => {
    dispatch(removeProxyGroup(id));
    if (selectedGroupId === id) {
      setGroupIsSelected(false);
      setSelectedGroupId('');
      setProxyList([]);
    }
    window.electron.ipcRenderer.send('remove-proxy', id);
  };

  const displayMenu = (
    id: string,
    xCoordinate: number,
    yCoordinate: number,
  ) => {
    setAuxMenu({
      show: true,
      id,
      xCoordinate,
      yCoordinate,
    });

    const data = proxyData.find((group) => group.id === id)!;

    setMenuData({
      id,
      name: data.name,
      proxies: data.proxies,
    });
  };

  const renderAuxMenu = () => {
    if (auxMenu.show) {
      return (
        <ProxyAuxMenu
          id={auxMenu.id}
          xCoordinate={auxMenu.xCoordinate}
          yCoordinate={auxMenu.yCoordinate}
          edit={editProxyGroup}
          remove={deleteProxyGroup}
        />
      );
    }
    return <div />;
  };
  const hideMenu = () => {
    setProxyMenu(false);
  };

  const saveData = (id: string, name: string, proxies: string[]) => {
    dispatch(updateProxyGroup({ id, name, proxies }));
    setProxyMenu(false);

    // Write the data to the harvesters.json file
    window.electron.ipcRenderer.send('write-proxy', {
      id,
      name,
      proxies,
    });
  };

  const renderProxyMenu = () => {
    if (proxyMenu) {
      return (
        <ProxyMenu
          hideMenu={hideMenu}
          menuData={menuData}
          saveData={saveData}
        />
      );
    }
    return <div />;
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      id={styles.harvesters}
      onClick={() => {
        setAuxMenu({ show: false, xCoordinate: 0, yCoordinate: 0, id: '' });
      }}
    >
      <div id={styles.title}>
        <p>Proxies</p>
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
          <div id={styles.proxyBlocks}>
            <div id={styles.proxyGroups}>
              <p>Proxy Groups</p>
              <button
                type="button"
                id={styles.createGroupBtn}
                onClick={createProxyGroup}
              >
                <img src={AddButton} alt="" />
              </button>
              <div id={styles.proxyGroupList}>
                {proxyData.map((proxyGroup: ProxyGroup) => {
                  return (
                    <ProxyGroupItem
                      key={proxyGroup.id}
                      id={proxyGroup.id}
                      name={proxyGroup.name}
                      amount={proxyGroup.proxies.length}
                      selectGroup={selectGroup}
                      selected={selectedGroupId === proxyGroup.id}
                      displayMenu={displayMenu}
                    />
                  );
                })}
              </div>
            </div>
            <div id={styles.proxyList}>
              <section id={styles.listHeader}>Proxy List</section>
              <section id={styles.listContent}>
                <p>Enter Your Proxies</p>
                <textarea
                  onChange={(e) => {
                    const proxyString = e.target.value;
                    const parsedProxies = proxyString.split('\n');
                    setProxyList(parsedProxies);
                  }}
                  spellCheck={false}
                  placeholder={
                    !groupIsSelected
                      ? 'Select a group to add proxies'
                      : 'Enter your proxies'
                  }
                  value={proxyList.join('\n')}
                  disabled={!groupIsSelected}
                />
                <div id={styles.buttons}>
                  <button
                    id={styles.save}
                    type="button"
                    onClick={saveProxyList}
                  >
                    Save
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
        <NotificationCenter />
      </div>
      {renderAuxMenu()}
      {renderProxyMenu()}
    </div>
  );
}
