import { useDispatch, useSelector } from 'react-redux';
import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { RootState } from '../../store';
import { updateSelectedAccountGroup } from '../../appSlice';
import DashboardWelcome from '../../../../assets/images/DashboardWelcome.svg';
import AddButton from '../../../../assets/images/AddButton.png';
import SearchTaskImage from '../../../../assets/images/SearchTaskImage.svg';
import styles from './Accounts.module.scss';
import AccountGroupItem from '../AccountGroupItem/AccountGroupItem';
import AccountItem from '../AccountItem/AccountItem';
import AccountAuxMenu from '../AccountAuxMenu/AccountAuxMenu';
import AccountGroupMenu from '../AccountGroupMenu/AccountGroupMenu';
import AccountMenu from '../AccountMenu/AccountMenu';
import ShowToast from '../Toast/Toast';
import {
  addAccountGroup,
  updateAccountGroup,
  removeAccountGroup,
  AccountGroup,
  Account,
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

export default function Accounts() {
  const dispatch = useDispatch();
  const selectedAccountGroup = useSelector(
    (state: RootState) => state.user.selectedAccountGroup,
  );
  const accountData = useSelector((state: RootState) => state.accounts);

  const fileImportRef = useRef<HTMLInputElement>(null);

  const [editAccount, setEditAccount] = useState(false);
  const [editAccountData, setEditAccountData] = useState({} as Account);
  const [selectedGroupId, setSelectedGroupId] = useState(selectedAccountGroup);
  const [auxMenu, setAuxMenu] = useState({
    show: false,
    xCoordinate: 0,
    yCoordinate: 0,
    id: '',
  });
  const [groupMenu, setGroupMenu] = useState(false);
  const [menuData, setMenuData] = useState({
    id: '',
    name: '',
    accounts: [] as Account[],
  });
  const [accountMenu, setAccountMenu] = useState(false);

  const createAccountGroup = () => {
    const newAccountGroup: AccountGroup = {
      id: uuidv4(),
      name: 'New Group',
      accounts: [],
    };

    dispatch(addAccountGroup(newAccountGroup));

    // Write the data to the proxies.json file
    window.electron.ipcRenderer.send('write-account', newAccountGroup);
  };

  const editAccountGroup = () => {
    setGroupMenu(true);
  };

  const deleteAccountGroup = (id: string) => {
    dispatch(removeAccountGroup(id));
    if (selectedGroupId === id) {
      setSelectedGroupId('');
    }
    window.electron.ipcRenderer.send('remove-account', id);
  };

  const selectGroup = (id: string) => {
    // This function takes in the id of the group that was clicked and sets it as the selected group
    setSelectedGroupId(id);
    dispatch(updateSelectedAccountGroup(id));
  };

  const displayGroupMenu = (
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

    const data = accountData.find((group) => group.id === id)!;

    setMenuData({
      id,
      name: data.name,
      accounts: data.accounts,
    });
  };

  const handleImportClick = () => {
    if (fileImportRef.current) {
      fileImportRef.current.click();
    }
  };

  const handleFileChange = (event: any) => {
    try {
      const file = event.target.files[0];
      // Process the file here as needed
      const reader = new FileReader();
      reader.onload = (e) => {
        const contents = e.target?.result as string;
        // You can process the file contents here as needed

        // The file format is as follows:
        // username:password\n
        // username:password\n

        const importedAccounts = contents.split('\n');

        // Rewrite the profileGroup as redux requires us to do so.

        const myGroup: AccountGroup = accountData.find(
          (group) => group.id === selectedGroupId,
        )!;

        const newAccounts = myGroup.accounts.map((item) => {
          return item;
        });

        const newGroup = { ...myGroup, accounts: newAccounts };

        // Now loop through the parsed contents and add each profile to the selected group.

        for (let i = 0; i < importedAccounts.length; i += 1) {
          const splitAccount = importedAccounts[i].split(':');

          const myUsername = splitAccount[0];
          const myPassword = splitAccount[1];

          const myUUID = uuidv4();

          const myAccount: Account = {
            name: myUUID,
            id: myUUID,
            username: myUsername,
            password: myPassword,
          };
          newGroup.accounts.push(myAccount);
        }

        dispatch(updateAccountGroup(newGroup));

        const { accounts, id, name } = newGroup;

        window.electron.ipcRenderer.send('write-account', {
          id,
          name,
          accounts,
        });

        ShowToast({
          type: 'success',
          title: 'Account Success',
          message: 'Accounts successfully imported.',
        });
      };
      reader.readAsText(file);
    } catch (error) {
      ShowToast({
        type: 'error',
        title: 'Account Error',
        message: 'Error importing accounts.',
      });
    }
  };

  const displayAccountMenu = () => {
    setEditAccount(false);
    setAccountMenu(true);
  };

  const renderAuxMenu = () => {
    if (auxMenu.show) {
      return (
        <AccountAuxMenu
          id={auxMenu.id}
          xCoordinate={auxMenu.xCoordinate}
          yCoordinate={auxMenu.yCoordinate}
          edit={editAccountGroup}
          remove={deleteAccountGroup}
        />
      );
    }
    return <div />;
  };

  const hideGroupMenu = () => {
    setGroupMenu(false);
  };

  const hideAccountMenu = () => {
    setAccountMenu(false);
  };

  const saveGroupData = (id: string, name: string, accounts: Account[]) => {
    dispatch(updateAccountGroup({ id, name, accounts }));
    setGroupMenu(false);

    console.log('writing accounts');

    // Write the data to the harvesters.json file
    window.electron.ipcRenderer.send('write-account', {
      id,
      name,
      accounts,
    });
  };

  const saveAccountData = (account: Account) => {
    // We need to push profile to the profiles array in the selected group
    const myGroup: AccountGroup = accountData.find(
      (group) => group.id === selectedGroupId,
    )!;

    const newAccounts = myGroup.accounts.map((item) => {
      return item;
    });

    const newGroup = { ...myGroup, accounts: newAccounts };

    // Filter out the profile with the same id as the one we are saving.
    newGroup.accounts = newGroup.accounts.filter(
      (item) => item.id !== account.id,
    );

    newGroup.accounts.push(account);

    dispatch(updateAccountGroup(newGroup));
    setAccountMenu(false);

    console.log('writing accounts');

    window.electron.ipcRenderer.send('write-account', newGroup);
  };

  const editAccountItem = (id: string) => {
    // First, find the profile in reference.
    const myGroup: AccountGroup = accountData.find(
      (group) => group.id === selectedGroupId,
    )!;

    const myAccount: Account = myGroup.accounts.find(
      (account) => account.id === id,
    )!;

    setEditAccountData(myAccount);
    setEditAccount(true);
    setAccountMenu(true);
  };

  const deleteAccountItem = (id: string) => {
    // We need to remove the profile from the profiles array in the selected group
    const myGroup: AccountGroup = accountData.find(
      (group) => group.id === selectedGroupId,
    )!;

    const newAccounts = myGroup.accounts.filter((item) => {
      return item.id !== id;
    });

    const newGroup = { ...myGroup, accounts: newAccounts };

    dispatch(updateAccountGroup(newGroup));

    window.electron.ipcRenderer.send('write-account', newGroup);
  };

  const renderGroupMenu = () => {
    if (groupMenu) {
      console.log(groupMenu);

      return (
        <AccountGroupMenu
          hideMenu={hideGroupMenu}
          menuData={menuData}
          saveData={saveGroupData}
        />
      );
    }
    return <div />;
  };

  const renderAccountMenu = () => {
    if (accountMenu) {
      return (
        <AccountMenu
          hideMenu={hideAccountMenu}
          saveData={saveAccountData}
          editAccount={editAccount}
          editAccountData={editAccountData}
        />
      );
    }

    return <div />;
  };

  const renderAccountContent = () => {
    if (selectedGroupId !== '') {
      return (
        <div id={styles.content}>
          <div id={styles.taskControls}>
            <div id={styles.leftTaskControls}>
              <button
                id={styles.addAccount}
                type="button"
                onClick={displayAccountMenu}
              >
                <div id={styles.addButtonImgContainer}>
                  <img id={styles.addButtonImg} src={AddButton} alt="" />
                </div>
                <div id={styles.addAccountTextContainer}>
                  <p>Add New Account</p>
                </div>
              </button>
              <button
                id={styles.importAccount}
                type="button"
                onClick={handleImportClick}
              >
                <div id={styles.importButtonImgContainer}>
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
                      d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25"
                    />
                  </svg>
                  <input
                    type="file"
                    ref={fileImportRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
                <div id={styles.importAccountTextContainer}>
                  <p>Import</p>
                </div>
              </button>
              <button id={styles.exportAccount} type="button">
                <div id={styles.exportButtonImgContainer}>
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
                      d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15"
                    />
                  </svg>
                </div>
                <div id={styles.exportAccountTextContainer}>
                  <p>Export</p>
                </div>
              </button>
              <div id={styles.SearchTasks}>
                <div id={styles.SearchTasksImgContainer}>
                  <img width={17} height={17} src={SearchTaskImage} alt="?" />
                </div>
                <div id={styles.SearchTasksInputContainer}>
                  <input
                    id={styles.SearchTasksInput}
                    placeholder="Search Here"
                  />
                </div>
              </div>
            </div>
          </div>
          <div id={styles.tasksContainer}>
            <div id={styles.tasksHeader}>
              <p id={styles.name}>Account Name</p>
              <p id={styles.email}>Username</p>
              <p id={styles.phone}>Password</p>
              <p id={styles.actions}>Actions</p>
            </div>
            <ul id={styles.tasksList}>
              {accountData.map((accountGroup: AccountGroup) => {
                if (accountGroup.id === selectedGroupId) {
                  return accountGroup.accounts.map((account: Account) => {
                    return (
                      <AccountItem
                        key={account.id}
                        id={account.id}
                        name={account.name}
                        username={account.username}
                        password={account.password}
                        editAccount={editAccountItem}
                        deleteAccount={deleteAccountItem}
                      />
                    );
                  });
                }
                return <div />;
              })}
            </ul>
          </div>
        </div>
      );
    }

    return (
      <div id={styles.content}>
        <div id={styles.emptyContainer}>
          <div>
            <p id={styles.emptyText}>Select a group to view accounts</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      id={styles.tasks}
      role="presentation"
      onClick={() => {
        setAuxMenu({ show: false, xCoordinate: 0, yCoordinate: 0, id: '' });
      }}
    >
      <div id={styles.taskGroups}>
        <p>Account Groups</p>

        <button id={styles.addGroup} type="button" onClick={createAccountGroup}>
          <div id={styles.addButtonImgContainer}>
            <img id={styles.addButtonImg} src={AddButton} alt="Add New Group" />
          </div>
          <div id={styles.addGroupTextContainer}>
            <p>Add New Group</p>
          </div>
        </button>

        <div id={styles.groupContainer}>
          <ul id={styles.groupList}>
            {accountData.map((accountGroup: AccountGroup) => {
              return (
                <AccountGroupItem
                  key={accountGroup.id}
                  id={accountGroup.id}
                  name={accountGroup.name}
                  amount={accountGroup.accounts.length}
                  selectGroup={selectGroup}
                  selected={selectedGroupId === accountGroup.id}
                  displayMenu={displayGroupMenu}
                />
              );
            })}
          </ul>
          <div id={styles.groupListShade} />
        </div>
      </div>
      <div id={styles.main}>
        <div id={styles.title}>
          <p>Accounts</p>
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
        {renderAccountContent()}
      </div>
      {renderAuxMenu()}
      {renderGroupMenu()}
      {renderAccountMenu()}
    </div>
  );
}
