import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import FocusTrap from 'focus-trap-react';
import ShowToast from '../Toast/Toast';
import DeleteTasksButton from '../../../../assets/images/DeleteTasksButton.svg';
import styles from './AccountMenu.module.scss';
import { Account } from '../Accounts/slice';

export default function AccountMenu({
  hideMenu,
  saveData,
  editAccount,
  editAccountData,
}: {
  hideMenu: (event: any) => void;
  saveData: (accounts: Account) => void;
  editAccount: boolean;
  editAccountData: Account;
}) {
  const [name, setName] = useState(editAccount ? editAccountData.name : '');

  const [username, setUsername] = useState(
    editAccount ? editAccountData.username : '',
  );

  const [password, setPassword] = useState(
    editAccount ? editAccountData.password : '',
  );

  const [show, setShow] = useState(false);
  const [mouseTargetDown, setMouseTargetDown] = useState('');

  useEffect(() => {
    // When the component mounts, set the state to trigger the fade-in effect.
    setShow(true);
  }, []);

  const handleMouseDown = (event: any) => {
    setMouseTargetDown(event.target);
  };

  const handleMouseUp = (event: any) => {
    if (event.target === mouseTargetDown) {
      if (event.target.className.includes !== undefined) {
        if (event.target.className.includes('canClose')) {
          setShow(false);

          setTimeout(() => {
            // Unmount or perform any other cleanup logic here.
            hideMenu(event);
          }, 300);
        }
      }
    }
  };

  const displayMenuTitle = () => {
    if (editAccount) {
      return 'Edit Account';
    }

    return 'Create Accounts';
  };

  const displaySaveButtonText = () => {
    if (editAccount) {
      return 'Save';
    }

    return 'Create';
  };

  const saveAccount = () => {
    if (name === '') {
      ShowToast({
        type: 'warning',
        title: 'Account Warning',
        message: 'Please enter a name.',
      });
      return;
    }

    if (username === '') {
      ShowToast({
        type: 'warning',
        title: 'Account Warning',
        message: 'Please enter a username.',
      });
      return;
    }

    if (password === '') {
      ShowToast({
        type: 'warning',
        title: 'Account Warning',
        message: 'Please enter a password.',
      });
      return;
    }

    // Edit Task makes this a bit janky.

    // If we are editing a task, we will exit out of here real quick.

    if (editAccount) {
      ShowToast({
        type: 'success',
        title: 'Account Success',
        message: `Edited account!`,
      });

      const myAccount: Account = {
        id: editAccountData.id,
        name,
        username,
        password,
      };

      saveData(myAccount);

      return;
    }

    // Now calculate how many tasks we need to create.
    // The inputs that dictate this are the profiles and task proxy.
    // We only want to create 1 task per profile and proxy combination IDEALLY.
    // However if someone wants to reuse profiles, that's okay.
    // However, we don't want to reuse proxies.

    // So, therefore, if someone selects 10 profiles, and 5 proxies, we want to create 5 tasks.
    // However, if someone selects 5 profiles, and 10 proxies, we want to create 5 tasks.
    // DalphanAIO is designed to use 1 proxy to its full potential.

    // So, we need to get the length of the profiles.

    ShowToast({
      type: 'success',
      title: 'Account Success',
      message: `Created account!`,
    });

    // Now we need to create the tasks.
    // We need to for loop using tasksToCreate.

    const myAccount: Account = {
      id: uuidv4(),
      name,
      username,
      password,
    };

    saveData(myAccount);
  };

  return (
    <FocusTrap>
      <div
        role="presentation"
        id={styles.background}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className={`canClose ${styles.fade} ${show ? styles.active : ''}`}
      >
        <div id={styles.container} className={styles.transition}>
          <div id={styles.header}>
            <p>{displayMenuTitle()}</p>
            <div id={styles.buttons}>
              <button
                type="button"
                className="canClose"
                id={styles.DeleteTasksButtonContainer}
                tabIndex={-1}
              >
                <img height={8} width={8} src={DeleteTasksButton} alt="?" />
              </button>
            </div>
          </div>
          <div id={styles.content}>
            <div id={styles.inputRow}>
              <div
                id={styles.inputContainer}
                className={styles.hardWidthContainer}
              >
                <p>Name</p>
                <input
                  type="text"
                  placeholder="Name"
                  spellCheck={false}
                  onChange={(event) => {
                    setName(event.target.value);
                  }}
                  value={name}
                />
              </div>
            </div>
            <div id={styles.inputRow}>
              <div
                id={styles.inputContainer}
                className={styles.hardWidthContainer}
              >
                <p>Username</p>
                <input
                  type="text"
                  placeholder="Username"
                  spellCheck={false}
                  onChange={(event) => {
                    setUsername(event.target.value);
                  }}
                  value={username}
                />
              </div>
            </div>
            <div id={styles.inputRow}>
              <div
                id={styles.inputContainer}
                className={styles.hardWidthContainer}
              >
                <p>Password</p>
                <input
                  type="text"
                  placeholder="Password"
                  spellCheck={false}
                  onChange={(event) => {
                    setPassword(event.target.value);
                  }}
                  value={password}
                />
              </div>
            </div>
          </div>
          <div id={styles.content2}>
            <div id={styles.buttons}>
              <button
                id={styles.save}
                type="button"
                onClick={saveAccount}
                tabIndex={-1}
              >
                {displaySaveButtonText()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
