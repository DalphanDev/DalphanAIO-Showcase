import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import FocusTrap from 'focus-trap-react';
import { RootState } from '../../store';
import ShowToast from '../Toast/Toast';
import DeleteTasksButton from '../../../../assets/images/DeleteTasksButton.svg';
import styles from './TaskMenu.module.scss';
import MySelect from '../Select/Select';
import { Task } from '../Tasks/slice';
import siteMap from '../../../main/siteMap';

interface Option {
  value: string;
  label: string;
}

const siteOptions = Array.from(siteMap.values()).map((site) => {
  return {
    value: site.value,
    label: site.label,
  };
});

const sizeOptions = [
  {
    value: 'random',
    label: 'Random',
  },
  {
    value: '1',
    label: '1',
  },
  {
    value: '1.5',
    label: '1.5',
  },
  {
    value: '2',
    label: '2',
  },
  {
    value: '2.5',
    label: '2.5',
  },
  {
    value: '3',
    label: '3',
  },
  {
    value: '3.5',
    label: '3.5',
  },
  {
    value: '4',
    label: '4',
  },
  {
    value: '4.5',
    label: '4.5',
  },
  {
    value: '5',
    label: '5',
  },
  {
    value: '5.5',
    label: '5.5',
  },
  {
    value: '6',
    label: '6',
  },
  {
    value: '6.5',
    label: '6.5',
  },
  {
    value: '7',
    label: '7',
  },
  {
    value: '7.5',
    label: '7.5',
  },
  {
    value: '8',
    label: '8',
  },
  {
    value: '8.5',
    label: '8.5',
  },
  {
    value: '9',
    label: '9',
  },
  {
    value: '9.5',
    label: '9.5',
  },
  {
    value: '10',
    label: '10',
  },
  {
    value: '10.5',
    label: '10.5',
  },
  {
    value: '11',
    label: '11',
  },
  {
    value: '11.5',
    label: '11.5',
  },
  {
    value: '12',
    label: '12',
  },
  {
    value: '12.5',
    label: '12.5',
  },
  {
    value: '13',
    label: '13',
  },
  {
    value: '13.5',
    label: '13.5',
  },
  {
    value: '14',
    label: '14',
  },
  {
    value: '14.5',
    label: '14.5',
  },
  {
    value: '15',
    label: '15',
  },
  {
    value: '15.5',
    label: '15.5',
  },
  {
    value: '16',
    label: '16',
  },
  {
    value: '16.5',
    label: '16.5',
  },
  {
    value: '17',
    label: '17',
  },
  {
    value: '17.5',
    label: '17.5',
  },
  {
    value: '18',
    label: '18',
  },
  {
    value: 'xxs',
    label: 'XXS',
  },
  {
    value: 'xs',
    label: 'XS',
  },
  {
    value: 's',
    label: 'S',
  },
  {
    value: 'm',
    label: 'M',
  },
  {
    value: 'l',
    label: 'L',
  },
  {
    value: 'xl',
    label: 'XL',
  },
  {
    value: 'xxl',
    label: 'XXL',
  },
  {
    value: '7 1/8',
    label: '7 1/8',
  },
  {
    value: '7 1/4',
    label: '7 1/4',
  },
  {
    value: '7 3/8',
    label: '7 3/8',
  },
  {
    value: '7 1/2',
    label: '7 1/2',
  },
  {
    value: '7 5/8',
    label: '7 5/8',
  },
  {
    value: '7 3/4',
    label: '7 3/4',
  },
  {
    value: '7 7/8',
    label: '7 7/8',
  },
];

export default function TaskMenu({
  hideMenu,
  saveData,
  editTask,
  editTaskData,
  massEdit,
}: {
  hideMenu: (event: any) => void;
  saveData: (tasks: Task[]) => void;
  editTask: boolean;
  editTaskData: Task;
  massEdit: boolean;
}) {
  const [selectedSite, setSelectedSite] = useState<Option | Option[]>(
    editTask ? editTaskData.site : ({} as Option),
  );
  const [modes, setModes] = useState([] as Option[]);
  const [selectedMode, setSelectedMode] = useState<Option | Option[]>(
    editTask ? editTaskData.mode : ({} as Option),
  );

  const [monitorInput, setMonitorInput] = useState(
    editTask ? editTaskData.input : '',
  );

  const [size, setSize] = useState<Option | Option[]>(
    editTask ? editTaskData.size : ([] as Option[]),
  );
  const [profileGroup, setProfileGroup] = useState<Option | Option[]>(
    editTask ? editTaskData.profile.group : ({} as Option),
  );
  const [profiles, setProfiles] = useState<Option[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<Option | Option[]>(
    editTask ? editTaskData.profile.item : ([] as Option[]),
  );
  const [monitorProxyGroup, setMonitorProxyGroup] = useState<Option | Option[]>(
    editTask ? editTaskData.proxy.monitor : ({} as Option),
  );
  const [taskProxyGroup, setTaskProxyGroup] = useState<Option | Option[]>(
    editTask ? editTaskData.proxy.task : ({} as Option),
  );
  const [accountGroup, setAccountGroup] = useState<Option | Option[]>(
    editTask ? editTaskData.account.group : ({} as Option),
  );
  const [accounts, setAccounts] = useState<Option[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<Option | Option[]>(
    editTask ? editTaskData.account.item : ([] as Option[]),
  );
  const [minSizesLoaded, setMinSizesLoaded] = useState(
    editTask ? editTaskData.minSizesLoaded : '',
  );
  const [minPrice, setMinPrice] = useState(
    editTask ? editTaskData.minPrice : '',
  );
  const [maxPrice, setMaxPrice] = useState(
    editTask ? editTaskData.maxPrice : '',
  );
  const [monitorDelay, setMonitorDelay] = useState(
    editTask ? editTaskData.monitorDelay : '',
  );
  const [retryDelay, setRetryDelay] = useState(
    editTask ? editTaskData.retryDelay : '',
  );
  const [productQuantity, setProductQuantity] = useState(
    editTask ? editTaskData.productQuantity : '',
  );

  const [show, setShow] = useState(false);
  const [mouseTargetDown, setMouseTargetDown] = useState('');

  const profileData = useSelector((state: RootState) => state.profiles);
  const proxyData = useSelector((state: RootState) => state.proxies);
  const accountData = useSelector((state: RootState) => state.accounts);
  const miscData = useSelector((state: RootState) => state.misc);

  const profileGroupOptions = profileData.map((myProfileGroup: any) => {
    return {
      value: myProfileGroup.id,
      label: myProfileGroup.name,
    };
  });

  // Now I need to add the miscDataCustomShopifySites to the sites array

  const allSiteOptions = siteOptions.concat(miscData.customShopify);

  const customOption = {
    value: 'localhost',
    label: 'Localhost',
  };

  const customAccountOption = {
    value: 'no account',
    label: 'No Account',
  };

  const proxyGroupOptions = [customOption].concat(
    proxyData.map((myProxyGroup: any) => {
      return {
        value: myProxyGroup.id,
        label: myProxyGroup.name,
      };
    }),
  );

  const accountGroupOptions = [customAccountOption].concat(
    accountData.map((myAccountGroup: any) => {
      return {
        value: myAccountGroup.id,
        label: myAccountGroup.name,
      };
    }),
  );

  const hasMountedProfilesRef = useRef(false);
  const hasMountedAccountsRef = useRef(false);

  useEffect(() => {
    // When the component mounts, set the state to trigger the fade-in effect.
    setShow(true);
  }, []);

  useEffect(() => {
    // If our profile group changes, we need to reset the selected profiles.
    if (editTask) {
      if (hasMountedProfilesRef.current) {
        // If our profile group changes, we need to reset the selected profiles.
        console.log('Resetting selected profiles!');
        setSelectedProfiles({} as Option); // Empty object if edit task. Empty array if mass edit or create task.
      } else {
        hasMountedProfilesRef.current = true;
      }
    } else if (hasMountedProfilesRef.current) {
      // If our profile group changes, we need to reset the selected profiles.
      console.log('Resetting selected profiles!');
      setSelectedProfiles([] as Option[]); // Empty object if edit task. Empty array if mass edit or create task.
    } else {
      hasMountedProfilesRef.current = true;
    }
  }, [editTask, profileGroup, setSelectedProfiles]);

  useEffect(() => {
    if (editTask) {
      if (hasMountedAccountsRef.current) {
        // If our account group changes, we need to reset the selected profiles.
        console.log('Resetting selected accounts!');
        setSelectedAccounts({} as Option);
      } else {
        hasMountedAccountsRef.current = true;
      }
    } else if (hasMountedAccountsRef.current) {
      console.log('Resetting selected accounts!');
      setSelectedAccounts([] as Option[]);
    } else {
      hasMountedAccountsRef.current = true;
    }
  }, [accountGroup, editTask, setSelectedAccounts]);

  useEffect(() => {
    const fetchModes = () => {
      // Fetch the modes tied to the selected site.

      // First, we need to get the site type.

      console.log(selectedSite);
      console.log(siteMap.get((selectedSite as Option).value));

      const siteType = siteMap.get((selectedSite as Option).value)?.platform;

      console.log(siteType);

      if (siteType === undefined) {
        setModes([
          { value: 'shopify_safe', label: 'Safe' },
          { value: 'shopify_fast', label: 'Fast' },
          { value: 'shopify_preload', label: 'Preload' },
        ]);
        return;
      }

      // If the site type is shopify, we need to set the modes to the following:

      if (siteType === 'shopify') {
        setModes([
          { value: 'shopify_safe', label: 'Safe' },
          { value: 'shopify_fast', label: 'Fast' },
          { value: 'shopify_preload', label: 'Preload' },
        ]);
        return;
      }

      if (siteType === 'goat') {
        setModes([
          { value: 'goat_drop', label: 'Drop' },
          { value: 'goat_account', label: 'Account' },
          { value: 'goat_trivia', label: 'Trivia' },
          { value: 'goat_ticket', label: 'Ticket' },
        ]);
        return;
      }

      if (siteType === 'confirmed') {
        setModes([{ value: 'confirmed_raffle', label: 'Raffle' }]);
        return;
      }

      if (siteType === 'nike') {
        setModes([
          {
            value: 'nike_browser',
            label: 'Browser',
          },
          {
            value: 'nike_mobile',
            label: 'Mobile',
          },
        ]);
        return;
      }

      setModes([]);
    };

    fetchModes();
  }, [selectedSite]);

  useEffect(() => {
    // This effect will prevent us from ever choosing a mode that doesn't correspond to the site.

    // If we are editing a task, find the index of the current mode.
    if (editTask) {
      if (editTaskData.site === selectedSite) {
        const currentModeIndex = modes.findIndex(
          (mode) => mode === editTaskData.mode,
        );
        if (currentModeIndex !== -1) {
          setSelectedMode(modes[currentModeIndex]);
        }
        return; // Return early so the following logic doesn't overwrite this.
      }
    }

    if (modes[0] !== undefined) {
      setSelectedMode(modes[0]);
    }
  }, [editTask, editTaskData.mode, editTaskData.site, modes, selectedSite]);

  useEffect(() => {
    const fetchProfiles = () => {
      // Fetch the profiles tied to the selected group.

      // Simply filter the profiles by the selected group.

      if (
        (profileGroup as Option).value === undefined ||
        profileGroup === undefined
      ) {
        return;
      }

      // Loop through the profile data and find the profile group that matches the selected profile group.
      for (let i = 0; i < profileData.length; i += 1) {
        if (profileData[i].id === (profileGroup as Option).value) {
          // Now return the profiles 1 by 1.
          const myProfiles = profileData[i].profiles.map((profile: any) => {
            return {
              value: profile.id,
              label: profile.name,
            };
          });
          setProfiles(myProfiles);
          return;
        }
      }

      // If we get here, then we need to set the profiles to an empty array.
      setProfiles([]);
    };

    fetchProfiles();
  }, [profileData, profileGroup]);

  useEffect(() => {
    const fetchAccounts = () => {
      // Fetch the profiles tied to the selected group.

      // Simply filter the profiles by the selected group.

      console.log(accountGroup);

      if (
        (accountGroup as Option).value === undefined ||
        accountGroup === undefined
      ) {
        return;
      }

      // Loop through the profile data and find the profile group that matches the selected profile group.
      for (let i = 0; i < accountData.length; i += 1) {
        if (accountData[i].id === (accountGroup as Option).value) {
          // Now return the profiles 1 by 1.
          const myAccounts = accountData[i].accounts.map((account: any) => {
            return {
              value: account.id,
              label: account.name,
            };
          });
          console.log(myAccounts);
          setAccounts(myAccounts);
          return;
        }
      }

      // If we get here, then we need to set the profiles to an empty array.
      console.log('Setting accounts to empty array!');
      setAccounts([]);
    };

    fetchAccounts();
  }, [accountData, accountGroup]);

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
    if (massEdit) {
      return 'Mass Edit Tasks';
    }

    if (editTask) {
      return 'Edit Task';
    }

    return 'Create Tasks';
  };

  const displaySaveButtonText = () => {
    if (massEdit) {
      return 'Save';
    }

    if (editTask) {
      return 'Save';
    }

    return 'Create';
  };

  const saveTask = () => {
    if (massEdit) {
      // You can mass edit with no changed values. No need to check if inputs are empty.
      // When mass editing also, proxy groups do not influence the amount of tasks created.
      // We will just save the data.

      console.log(selectedProfiles);

      const profilesLength = (selectedProfiles as Option[]).length;

      // Now some simple math.

      const tasksToCreate = Math.max(profilesLength, 1);

      const tasksArray: Task[] = [];

      console.log(profilesLength);

      console.log(tasksToCreate);

      console.log(profiles);
      console.log(accounts);

      for (let i = 0; i < tasksToCreate; i += 1) {
        try {
          const myTask: Task = {
            id: uuidv4(),
            status: 'Idle',
            statusType: 'info',
            isRunning: false,
            site: selectedSite as Option,
            mode: selectedMode as Option,
            input: monitorInput,
            size: size as Option[],
            monitorDelay: monitorDelay === '' ? '3500' : monitorDelay,
            retryDelay: retryDelay === '' ? '3500' : retryDelay,
            minSizesLoaded: minSizesLoaded === '' ? '0' : minSizesLoaded,
            minPrice: minPrice === '' ? '0' : minPrice,
            maxPrice: maxPrice === '' ? '0' : maxPrice,
            productQuantity: productQuantity === '' ? '1' : productQuantity,
            profile: {
              group: profileGroup as Option,
              item: (selectedProfiles as Option[])[i] as Option,
            },
            proxy: {
              monitor: monitorProxyGroup as Option,
              task: taskProxyGroup as Option,
            },
            account: {
              group: accountGroup as Option,
              item: (selectedAccounts as Option[])[i] as Option,
            },
          };

          console.log(myTask);
          tasksArray.push(myTask);
        } catch (err) {
          console.log(err);
        }
      }

      console.log(tasksArray);

      saveData(tasksArray);

      return;
    }

    if ((selectedSite as Option).value === undefined) {
      ShowToast({
        type: 'warning',
        title: 'Task Warning',
        message: 'Please select a site.',
      });
      return;
    }

    if ((selectedMode as Option).value === undefined) {
      ShowToast({
        type: 'warning',
        title: 'Task Warning',
        message: 'Please select a mode.',
      });
      return;
    }

    if (monitorInput === '') {
      ShowToast({
        type: 'warning',
        title: 'Task Warning',
        message: 'Please enter an input.',
      });
      return;
    }

    if ((size as Option[])[0] === undefined) {
      ShowToast({
        type: 'warning',
        title: 'Task Warning',
        message: 'Please select a size.',
      });
      return;
    }

    if ((profileGroup as Option).value === undefined) {
      ShowToast({
        type: 'warning',
        title: 'Task Warning',
        message: 'Select a profile group.',
      });
      return;
    }

    // Edit Task makes this a bit janky.

    if (editTask) {
      if ((selectedProfiles as Option).value === undefined) {
        ShowToast({
          type: 'warning',
          title: 'Task Warning',
          message: 'Select a profile.',
        });
        return;
      }
    } else if ((selectedProfiles as Option[])[0] === undefined) {
      ShowToast({
        type: 'warning',
        title: 'Task Warning',
        message: 'Select a profile.',
      });
      return;
    }

    if ((monitorProxyGroup as Option).value === undefined) {
      ShowToast({
        type: 'warning',
        title: 'Task Warning',
        message: 'Select a monitor proxy.',
      });
      return;
    }

    if ((taskProxyGroup as Option).value === undefined) {
      ShowToast({
        type: 'warning',
        title: 'Task Warning',
        message: 'Select a task proxy.',
      });
      return;
    }

    if ((accountGroup as Option).value === undefined) {
      ShowToast({
        type: 'warning',
        title: 'Task Warning',
        message: 'Select an account setting.',
      });
      return;
    }

    console.log(accountGroup);

    let noAccountSelected = false;

    console.log(accounts);

    if (editTask) {
      if ((selectedAccounts as Option).value === undefined) {
        // We did not select an account.
        // We need to check if the account group is set to no account.
        // If it is, we can continue.
        // Otherwise, we need to throw an error.

        console.log(accountGroup);

        if ((accountGroup as Option).value !== 'no account') {
          ShowToast({
            type: 'warning',
            title: 'Task Warning',
            message: 'Select an account.',
          });
          return;
        }

        noAccountSelected = true;
      }
    } else if ((selectedAccounts as Option[]).length === 0) {
      // We did not select an account.
      // We need to check if the account group is set to no account.
      // If it is, we can continue.
      // Otherwise, we need to throw an error.

      console.log(accountGroup);

      if ((accountGroup as Option).value !== 'no account') {
        ShowToast({
          type: 'warning',
          title: 'Task Warning',
          message: 'Select an account.',
        });
        return;
      }

      noAccountSelected = true;
    }

    // If we are editing a task, we will exit out of here real quick.

    if (editTask) {
      ShowToast({
        type: 'success',
        title: 'Task Success',
        message: `Edited 1 task!`,
      });

      const tempArray: Task[] = [];

      const myTask: Task = {
        id: editTaskData.id,
        status: editTaskData.status,
        statusType: editTaskData.statusType,
        isRunning: editTaskData.isRunning,
        site: selectedSite as Option,
        mode: selectedMode as Option,
        input: monitorInput,
        size: size as Option[],
        monitorDelay: monitorDelay === '' ? '3500' : monitorDelay,
        retryDelay: retryDelay === '' ? '3500' : retryDelay,
        minSizesLoaded: minSizesLoaded === '' ? '0' : minSizesLoaded,
        minPrice: minPrice === '' ? '0' : minPrice,
        maxPrice: maxPrice === '' ? '0' : maxPrice,
        productQuantity: productQuantity === '' ? '1' : productQuantity,
        profile: {
          group: profileGroup as Option,
          item: selectedProfiles as Option,
        },
        proxy: {
          monitor: monitorProxyGroup as Option,
          task: taskProxyGroup as Option,
        },
        account: {
          group: accountGroup as Option,
          item: noAccountSelected
            ? ({} as Option)
            : (selectedAccounts as Option),
        },
      };

      tempArray.push(myTask);

      console.log(tempArray);

      saveData(tempArray);

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

    const profilesLength = (selectedProfiles as Option[]).length;

    // So, we need to get the length of the proxies.

    let taskProxyGroupLength = 0;

    if ((taskProxyGroup as Option).value === 'localhost') {
      taskProxyGroupLength = 1;
    } else {
      taskProxyGroupLength = proxyData.filter((myProxyGroup: any) => {
        return myProxyGroup.id === (taskProxyGroup as Option).value;
      })[0].proxies.length;
    }

    // Now some simple math.

    const tasksToCreate = Math.min(profilesLength, taskProxyGroupLength);

    ShowToast({
      type: 'success',
      title: 'Task Success',
      message: `Created ${tasksToCreate} tasks!`,
    });

    // Now we need to create the tasks.
    // We need to for loop using tasksToCreate.

    const tasksArray: Task[] = [];

    for (let i = 0; i < tasksToCreate; i += 1) {
      let myAccount = {} as Option;

      if (noAccountSelected) {
        myAccount = {} as Option;
      } else if (((selectedAccounts as Option[])[i] as Option) === undefined) {
        myAccount = {} as Option;
      } else {
        myAccount = (selectedAccounts as Option[])[i] as Option;
      }

      const myTask: Task = {
        id: uuidv4(),
        status: 'Idle',
        statusType: 'info',
        isRunning: false,
        site: selectedSite as Option,
        mode: selectedMode as Option,
        input: monitorInput,
        size: size as Option[],
        monitorDelay: monitorDelay === '' ? '3500' : monitorDelay,
        retryDelay: retryDelay === '' ? '3500' : retryDelay,
        minSizesLoaded: minSizesLoaded === '' ? '0' : minSizesLoaded,
        minPrice: minPrice === '' ? '0' : minPrice,
        maxPrice: maxPrice === '' ? '0' : maxPrice,
        productQuantity: productQuantity === '' ? '1' : productQuantity,
        profile: {
          group: profileGroup as Option,
          item: (selectedProfiles as Option[])[i] as Option,
        },
        proxy: {
          monitor: monitorProxyGroup as Option,
          task: taskProxyGroup as Option,
        },
        account: {
          group: accountGroup as Option,
          item: myAccount,
        },
      };

      tasksArray.push(myTask);
    }

    console.log(tasksArray);

    saveData(tasksArray);
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
                <p>Site</p>
                <MySelect
                  options={allSiteOptions}
                  value={selectedSite}
                  setValue={setSelectedSite}
                  placeholder="Site"
                />
              </div>
              <div
                id={styles.inputContainer}
                className={styles.hardWidthContainer}
              >
                <p>Mode</p>
                <MySelect
                  options={modes}
                  value={selectedMode}
                  setValue={setSelectedMode}
                  placeholder="Site"
                />
              </div>
            </div>
            <div id={styles.inputRow}>
              <div
                id={styles.inputContainer}
                className={styles.hardWidthContainer}
              >
                <p>Monitor Input</p>
                <input
                  type="text"
                  placeholder="Monitor Input"
                  spellCheck={false}
                  onChange={(event) => {
                    setMonitorInput(event.target.value);
                  }}
                  value={monitorInput}
                />
              </div>
              <div
                id={styles.inputContainer}
                className={styles.hardWidthContainer}
              >
                <p>Size</p>
                <MySelect
                  isMulti
                  options={sizeOptions}
                  value={size}
                  setValue={setSize}
                  placeholder="Size"
                />
              </div>
            </div>
            <div id={styles.inputRow}>
              <div
                id={styles.inputContainer}
                className={styles.hardWidthContainer}
              >
                <p>Profile Group</p>
                <MySelect
                  options={profileGroupOptions}
                  value={profileGroup}
                  setValue={setProfileGroup}
                  placeholder="Profile Group"
                />
              </div>
              <div
                id={styles.inputContainer}
                className={styles.hardWidthContainer}
              >
                <p>Profiles</p>
                <MySelect
                  isMulti={!editTask}
                  options={profiles}
                  value={selectedProfiles}
                  setValue={setSelectedProfiles}
                  placeholder="Profiles"
                />
              </div>
            </div>
            <div id={styles.inputRow}>
              <div id={styles.inputContainer}>
                <p>Monitor Proxy</p>
                <MySelect
                  options={proxyGroupOptions}
                  value={monitorProxyGroup}
                  setValue={setMonitorProxyGroup}
                  placeholder="Monitor Proxy"
                />
              </div>
              <div id={styles.inputContainer}>
                <p>Task Proxy</p>
                <MySelect
                  options={proxyGroupOptions}
                  value={taskProxyGroup}
                  setValue={setTaskProxyGroup}
                  placeholder="Task Proxy"
                />
              </div>
            </div>
            <div id={styles.inputRow}>
              <div
                id={styles.inputContainer}
                className={styles.hardSetTwoInputWidth}
              >
                <p>Account Group</p>
                <MySelect
                  options={accountGroupOptions}
                  value={accountGroup}
                  setValue={setAccountGroup}
                  placeholder="Account Group"
                />
              </div>
              <div
                id={styles.inputContainer}
                className={styles.hardSetTwoInputWidth}
              >
                <p>Accounts</p>
                <MySelect
                  isMulti={!editTask}
                  options={accounts}
                  value={selectedAccounts}
                  setValue={setSelectedAccounts}
                  placeholder="Accounts"
                />
              </div>
            </div>
            <div id={styles.inputRow}>
              <div id={styles.inputContainer}>
                <p>Min Sizes Loaded</p>
                <input
                  type="text"
                  placeholder="0"
                  spellCheck={false}
                  onChange={(event) => {
                    const { value } = event.target;
                    const regex = /^[0-9]*$/;
                    if (regex.test(value)) {
                      setMinSizesLoaded(value);
                    }
                  }}
                  value={minSizesLoaded}
                />
              </div>
              <div id={styles.inputContainer}>
                <p>Min Price</p>
                <input
                  type="text"
                  placeholder="0"
                  spellCheck={false}
                  onChange={(event) => {
                    const { value } = event.target;
                    const regex = /^[0-9]*$/;
                    if (regex.test(value)) {
                      setMinPrice(value);
                    }
                  }}
                  value={minPrice}
                />
              </div>
              <div id={styles.inputContainer}>
                <p>Max Price</p>
                <input
                  type="text"
                  placeholder="0"
                  spellCheck={false}
                  onChange={(event) => {
                    const { value } = event.target;
                    const regex = /^[0-9]*$/;
                    if (regex.test(value)) {
                      setMaxPrice(value);
                    }
                  }}
                  value={maxPrice}
                />
              </div>
            </div>
            <div id={styles.inputRow}>
              <div id={styles.inputContainer}>
                <p>Monitor Delay</p>
                <input
                  type="text"
                  placeholder="3500"
                  spellCheck={false}
                  onChange={(event) => {
                    const { value } = event.target;
                    const regex = /^[0-9]*$/;
                    if (regex.test(value)) {
                      setMonitorDelay(value);
                    }
                  }}
                  value={monitorDelay}
                />
              </div>
              <div id={styles.inputContainer}>
                <p>Retry Delay</p>
                <input
                  type="text"
                  placeholder="3500"
                  spellCheck={false}
                  onChange={(event) => {
                    const { value } = event.target;
                    const regex = /^[0-9]*$/;
                    if (regex.test(value)) {
                      setRetryDelay(value);
                    }
                  }}
                  value={retryDelay}
                />
              </div>
              <div id={styles.inputContainer}>
                <p>Product Quantity</p>
                <input
                  type="text"
                  placeholder="1"
                  spellCheck={false}
                  onChange={(event) => {
                    const { value } = event.target;
                    const regex = /^[0-9]*$/;
                    if (regex.test(value)) {
                      setProductQuantity(value);
                    }
                  }}
                  value={productQuantity}
                />
              </div>
            </div>
          </div>
          <div id={styles.content2}>
            <div id={styles.buttons}>
              <button
                id={styles.save}
                type="button"
                onClick={saveTask}
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
