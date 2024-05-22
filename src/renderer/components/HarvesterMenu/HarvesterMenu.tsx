import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FocusTrap from 'focus-trap-react';
import Select from 'react-select';
import { RootState } from '../../store';
import DeleteTasksButton from '../../../../assets/images/DeleteTasksButton.svg';
import { updateHarvester } from '../Harvesters/slice';
import styles from './HarvesterMenu.module.scss';

const harvesterOptions = [
  { value: 'checkpoint', label: 'Shopify Checkpoint' },
  { value: 'account', label: 'Shopify Account' },
  { value: 'checkout', label: 'Shopify Checkout' },
  { value: 'fnl', label: 'FNL/JD' },
];

export default function HarvesterMenu({
  hideHarvesterMenu,
  saveData,
  menuData,
}: {
  hideHarvesterMenu: (event: any) => void;
  saveData: (
    id: string,
    name: string,
    type: string,
    status: string,
    statusColor: string,
    proxy: string,
  ) => void;
  menuData: {
    id: string;
    name: string;
    type: string;
    status: string;
    statusColor: string;
    proxy: string;
  };
}) {
  const dispatch = useDispatch();

  let defaultOption = harvesterOptions?.find(
    (option) => option.label === menuData.type,
  );

  if (!defaultOption) {
    // eslint-disable-next-line prefer-destructuring
    defaultOption = harvesterOptions[0];
  }

  const [show, setShow] = useState(false);
  const [mouseTargetDown, setMouseTargetDown] = useState('');

  useEffect(() => {
    const loginHarvesterSuccess = (args: any) => {
      const id = args;

      dispatch(
        updateHarvester({
          id,
          name: menuData.name,
          type: menuData.type,
          status: 'Session saved',
          statusColor: 'green',
          proxy: menuData.proxy,
        }),
      );
    };

    window.electron.ipcRenderer.on(
      'login-harvester-success',
      loginHarvesterSuccess,
    );

    return () => {
      window.electron.ipcRenderer.removeListener(
        'login-harvester-success',
        loginHarvesterSuccess,
      );
    };
  }, [dispatch, menuData.name, menuData.proxy, menuData.type]);

  const reduxData = useSelector((state: RootState) => {
    for (let i = 0; i < state.harvesters.length; i += 1) {
      if (state.harvesters[i].id === menuData.id) {
        return state.harvesters[i];
      }
    }
    return menuData;
  }); // use the useSelector hook to get the state

  const loginHarvester = () => {
    window.electron.ipcRenderer.send('login-harvester', menuData.id);
  };

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
            hideHarvesterMenu(event);
          }, 300);
        }
      }
    }
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
        <div id={styles.container}>
          <div id={styles.header}>
            <p>Harvester Settings</p>
            <button
              type="button"
              className="canClose"
              tabIndex={-1}
              id={styles.DeleteTasksButtonContainer}
            >
              <img height={8} width={8} src={DeleteTasksButton} alt="?" />
            </button>
          </div>
          <div id={styles.content}>
            <div id={styles.inputRow}>
              <div id={styles.inputContainer}>
                <p>Name</p>
                <input
                  type="text"
                  defaultValue={menuData.name}
                  placeholder="Name"
                  spellCheck={false}
                  onChange={(event) => {
                    saveData(
                      menuData.id,
                      event.target.value,
                      menuData.type,
                      menuData.status,
                      menuData.statusColor,
                      menuData.proxy,
                    );
                  }}
                />
              </div>
              <div
                id={styles.inputContainer}
                className={styles.hardWidthContainer}
              >
                <p>Type</p>
                <Select
                  theme={(theme) => ({
                    ...theme,
                    border: 0,
                    borderRadius: 0,
                    boxShadow: 'none',
                    colors: {
                      ...theme.colors,
                      primary25: '#111136',
                      primary50: '#1E1E4B',
                      primary75: 'red',
                      primary: '#1183e7c0',
                    },
                  })}
                  styles={{
                    container: (baseStyles) => ({
                      ...baseStyles,
                      boxShadow: 'none',
                      height: '35px',
                      width: '100%',
                      borderRadius: '5px 0px 5px 5px',
                      boxSizing: 'border-box',
                      flexShrink: 0,
                    }),
                    control: (baseStyles) => ({
                      ...baseStyles,
                      boxShadow: 'none',
                      background: '#040413',
                      fontSize: '13px',
                      borderColor: 'yellow',
                      outline: 'none !important',
                      border: '1px solid #1c1c3e',
                      borderRadius: '5px 0px 5px 5px',
                      minHeight: '35px',
                      height: '35px',
                      width: '100%',
                      ':hover': {
                        border: '1px solid #7a7ab7',
                      },
                    }),
                    input: (baseStyles) => ({
                      ...baseStyles,
                      color: '#FFF',
                      fontSize: '13px',
                    }),
                    singleValue: (baseStyles) => ({
                      ...baseStyles,
                      color: '#FFF',
                      fontSize: '13px',
                    }),
                    menu: (baseStyles) => ({
                      ...baseStyles,
                      background: '#040413',
                      border: '1px solid #1c1c3e',
                      color: '#FFF',
                      fontSize: '13px',
                    }),
                    valueContainer: (baseStyles) => ({
                      ...baseStyles,
                      height: '35px',
                    }),
                  }}
                  options={harvesterOptions}
                  defaultValue={defaultOption}
                  onChange={(e) => {
                    if (e === null) {
                      return;
                    }
                    saveData(
                      menuData.id,
                      menuData.name,
                      e.label,
                      menuData.status,
                      menuData.statusColor,
                      menuData.proxy,
                    );
                  }}
                />
              </div>
            </div>
            <div id={styles.inputRow}>
              <div id={styles.inputContainer}>
                <p>Proxy</p>
                <input
                  type="text"
                  defaultValue={menuData.proxy}
                  placeholder="Proxy"
                  spellCheck={false}
                  onChange={(event) => {
                    saveData(
                      menuData.id,
                      menuData.name,
                      menuData.type,
                      menuData.status,
                      menuData.statusColor,
                      event.target.value,
                    );
                  }}
                />
              </div>
            </div>
          </div>
          <div id={styles.content2}>
            <div id={styles.loginStatus}>
              <p>Login Status: </p>
              <p id={`${styles[reduxData.statusColor]}`}>{reduxData.status}</p>
            </div>
            <div id={styles.buttons}>
              <button id={styles.login} type="button" onClick={loginHarvester}>
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
