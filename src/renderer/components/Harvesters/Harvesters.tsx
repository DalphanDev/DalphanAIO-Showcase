import { useDispatch, useSelector } from 'react-redux';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { RootState } from '../../store';
import Welcome from '../../../../assets/images/DashboardWelcome.svg';
import AddButton from '../../../../assets/images/AddButton.png';
import HarvesterItem from '../HarvesterItem/HarvesterItem';
import HarvesterMenu from '../HarvesterMenu/HarvesterMenu';
import NotificationCenter from '../NotificationCenter/NotificationCenter';
import styles from './Harvesters.module.scss';
import { addHarvester, updateHarvester, Harvester } from './slice';

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
  const harvesterData = useSelector((state: RootState) => state.harvesters);

  const [displayMenu, setDisplayMenu] = useState(false);
  const [menuData, setMenuData] = useState({
    id: '',
    name: '',
    type: '',
    status: '',
    statusColor: '',
    proxy: '',
  });

  const createHarvester = () => {
    const newHarvester = {
      id: uuidv4(),
      name: 'New Harvester',
      type: 'Shopify Checkpoint',
      status: 'Session not found',
      statusColor: 'red',
      proxy: '',
    };

    dispatch(addHarvester(newHarvester));

    // Write the data to the harvesters.json file
    window.electron.ipcRenderer.send('write-harvester', newHarvester);
  };

  const editHarvesterMenu = (
    id: string,
    name: string,
    type: string,
    status: string,
    statusColor: string,
    proxy: string,
  ) => {
    // This function takes in arguments from the harvester item and displays a menu
    setMenuData({
      id,
      name,
      type,
      status,
      statusColor,
      proxy,
    });
    setDisplayMenu(true);
  };

  const saveData = (
    id: string,
    name: string,
    type: string,
    status: string,
    statusColor: string,
    proxy: string,
  ) => {
    dispatch(updateHarvester({ id, name, type, status, statusColor, proxy }));

    // Write the data to the harvesters.json file
    window.electron.ipcRenderer.send('write-harvester', {
      id,
      name,
      type,
      status,
      statusColor,
      proxy,
    });
  };

  const hideHarvesterMenu = () => {
    setDisplayMenu(false);
  };

  const renderEditHarvesterMenu = () => {
    if (displayMenu) {
      return (
        <HarvesterMenu
          hideHarvesterMenu={hideHarvesterMenu}
          saveData={saveData}
          menuData={menuData}
        />
      );
    }
    return <div />;
  };

  return (
    <div id={styles.harvesters}>
      <div id={styles.title}>
        <p>Harvesters</p>
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
          <section id={styles.header}>
            <button id={styles.addTask} type="button" onClick={createHarvester}>
              <div id={styles.addButtonImgContainer}>
                <img
                  id={styles.addButtonImg}
                  src={AddButton}
                  alt="Add New Task"
                />
              </div>
              <div id={styles.addTaskTextContainer}>
                <p>Add Harvester</p>
              </div>
            </button>
          </section>
          <section id={styles.harvestersContainer}>
            <div id={styles.harvestersContent}>
              {harvesterData.map((harvester: Harvester) => {
                return (
                  <HarvesterItem
                    key={harvester.id}
                    id={harvester.id}
                    name={harvester.name}
                    type={harvester.type}
                    status={harvester.status}
                    statusColor={harvester.statusColor}
                    proxy={harvester.proxy}
                    editHarvesterMenu={editHarvesterMenu}
                  />
                );
              })}
            </div>
          </section>
        </div>
        <NotificationCenter />
      </div>
      {renderEditHarvesterMenu()}
    </div>
  );
}
