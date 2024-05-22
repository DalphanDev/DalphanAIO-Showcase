import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { RootState } from '../../store';
import { updateSelectedTaskGroup } from '../../appSlice';
import DashboardWelcome from '../../../../assets/images/DashboardWelcome.svg';
import AddButton from '../../../../assets/images/AddButton.png';
import StartTasksButton from '../../../../assets/images/StartTasksButton.svg';
import StopTasksButton from '../../../../assets/images/StopTasksButton.svg';
import MassEditButton from '../../../../assets/images/MassEditButton.svg';
import DeleteTasksButton from '../../../../assets/images/DeleteTasksButton.svg';
import SearchTaskImage from '../../../../assets/images/SearchTaskImage.svg';
import NotificationCenter from '../NotificationCenter/NotificationCenter';
import TaskGroupAuxMenu from '../TaskGroupAuxMenu/TaskGroupAuxMenu';
import TaskGroupMenu from '../TaskGroupMenu/TaskGroupMenu';
import TaskItemAuxMenu from '../TaskItemAuxMenu/TaskItemAuxMenu';
import TaskMenu from '../TaskMenu/TaskMenu';
import styles from './Tasks.module.scss';
import TaskGroupItem from '../TaskGroupItem/TaskGroupItem';
import TaskItem from '../TaskItem/TaskItem';
import ShowToast from '../Toast/Toast';
import {
  addTaskGroup,
  updateTaskGroup,
  removeTaskGroup,
  TaskGroup,
  Task,
} from './slice';
import { Account } from '../Accounts/slice';

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zip: string;
}

interface BillingInfo {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zip: string;
}

interface PaymentInfo {
  cardType: string;
  cardHolder: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
}

interface Profile {
  id: string;
  sameAsShipping: boolean;
  shipping: ShippingInfo;
  billing: BillingInfo;
  payment: PaymentInfo;
}

interface Signal {
  taskID: string;
  action: string;
  status: string;
  statusType: 'info' | 'success' | 'failure' | 'warning';
  isRunning: boolean;
  site: string;
  siteName: string;
  mode: string;
  input: string;
  size: string;
  monitorDelay: string;
  retryDelay: string;
  productQuantity: string;
  minSizesLoaded: string;
  minPrice: string;
  maxPrice: string;
  profile: Profile;
  proxy: {
    monitor: string;
    task: string;
    taskName: string;
  };
  account: {
    username: string;
    password: string;
  };
  webhook: {
    success: string;
    failure: string;
    misc: string;
  };
  data: string;
}

interface TaskSelect {
  id: string;
  isSelected: boolean;
}

function minimizeWindow() {
  window.electron.ipcRenderer.send('window', ['minimize']);
}

function maximizeWindow() {
  window.electron.ipcRenderer.send('window', ['maximize']);
}

function closeApp() {
  window.electron.ipcRenderer.send('window', ['close']);
}

export default function Tasks() {
  const dispatch = useDispatch();
  const selectedTaskGroup = useSelector(
    (state: RootState) => state.user.selectedTaskGroup,
  );
  const taskData = useSelector((state: RootState) => state.tasks);
  const profileData = useSelector((state: RootState) => state.profiles);
  const proxyData = useSelector((state: RootState) => state.proxies);
  const accountData = useSelector((state: RootState) => state.accounts);
  const settingsData = useSelector((state: RootState) => state.settings);

  const [selectedGroupId, setSelectedGroupId] = useState(selectedTaskGroup);

  const [groupAuxMenu, setGroupAuxMenu] = useState({
    show: false,
    xCoordinate: 0,
    yCoordinate: 0,
    id: '',
  });

  const [itemAuxMenu, setItemAuxMenu] = useState({
    show: false,
    xCoordinate: 0,
    yCoordinate: 0,
    id: '',
  });

  const [menuData, setMenuData] = useState({
    id: '',
    name: '',
    tasks: [] as Task[],
  });
  const [editTask, setEditTask] = useState(false);
  const [editTaskData, setEditTaskData] = useState({} as Task);
  const [massEdit, setMassEdit] = useState(false);
  const [massEditAll, setMassEditAll] = useState(false);
  const [groupMenu, setGroupMenu] = useState(false);
  const [taskMenu, setTaskMenu] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([] as TaskSelect[]);

  function isNewMapDifferent(newMap: TaskSelect[], oldMap: TaskSelect[]) {
    if (newMap.length !== oldMap.length) {
      return true;
    }

    return newMap.some((item, index) => {
      return (
        item.id !== oldMap[index].id ||
        item.isSelected !== oldMap[index].isSelected
      );
    });
  }

  useEffect(() => {
    // We need to create a map of all of the tasks in the selected group.
    // If selectedTasks is empty, we need to create a new map.
    // If it already has values, we need to check if the selected group has changed.
    // If it has changed, we need to create a new map.

    // This prevents this useEffect from running on the first render.
    if (selectedGroupId !== '') {
      // We need to create a new map.
      const groupData = taskData.find((group) => group.id === selectedGroupId);

      if (groupData) {
        const newMap = groupData.tasks.map((task) => {
          // Loop over selectedTasks and see if the task is already in the map.
          // If it's already in the map, we need to set isSelected to true.
          // Otherwise, we need to set isSelected to false.
          const selectedTask = selectedTasks.find((item) => {
            return item.id === task.id;
          });

          if (selectedTask) {
            return { id: task.id, isSelected: selectedTask.isSelected };
          }
          return { id: task.id, isSelected: false };
        });

        console.log('Setting selected tasks to new map');

        // It's fine to set the selected tasks to the new map.
        // The issue is that we should take into consideration if a task was selected before the group was changed.
        // If a task was selected before the group was changed, we need to set the isSelected value to true.

        if (isNewMapDifferent(newMap, selectedTasks)) {
          setSelectedTasks(newMap);
        }

        // setSelectedTasks(newMap);
      }
    }
  }, [dispatch, selectedGroupId, selectedTasks, taskData]);

  const startTasks = (tasks: Task[]) => {
    // We need to send the tasks to the main process to start them.
    // Depending on each task, we have to format the signals.

    // We need to make a copy of the tasks in our group so we can update the redux store.
    const myGroup: TaskGroup = taskData.find(
      (group) => group.id === selectedGroupId,
    )!;

    const newTasks = myGroup.tasks.map((item) => {
      return item;
    });

    tasks.forEach((task) => {
      // For each task, we need to set the action. We also need to fetch the profile data.

      // We need to add a check that the status of the task for if it's running or not.

      if (task.isRunning) {
        return;
      }

      let action = '';
      switch (task.mode.value) {
        case 'shopify_safe':
          action = 'start_shopify_safe';
          break;

        case 'shopify_fast':
          action = 'start_shopify_fast';
          break;

        case 'shopify_preload':
          action = 'start_shopify_preload';
          break;

        case 'goat_drop':
          action = 'start_goat_drop';
          break;

        case 'goat_account':
          action = 'start_goat_account';
          break;

        case 'goat_trivia':
          action = 'start_goat_trivia';
          break;

        case 'goat_ticket':
          action = 'start_goat_ticket';
          break;

        default:
          action = 'null';
          break;
      }

      const index = myGroup.tasks.findIndex((item) => {
        return item.id === task.id;
      });

      // We need to find the profile data.
      const profile = profileData
        .find((group) => {
          return group.id === task.profile.group.value;
        })!
        .profiles.find((item) => {
          return item.id === task.profile.item.value;
        })!;

      console.log(task.account.group.value);

      let account = {} as Account;

      if (task.account.group.value === 'no account') {
        console.log('No account selected');
        account = {
          id: '',
          name: '',
          username: '',
          password: '',
        };
      } else {
        const myAccountGroup = accountData.find((group) => {
          return group.id === task.account.group.value;
        });

        if (myAccountGroup === undefined) {
          account = {
            id: '',
            name: '',
            username: '',
            password: '',
          };
        } else {
          const myAccount = myAccountGroup.accounts.find((item) => {
            return item.id === task.account.item.value;
          });

          if (myAccount === undefined) {
            account = {
              id: '',
              name: '',
              username: '',
              password: '',
            };
          } else {
            account = myAccount;
          }
        }
      }

      // We need to find the account data.

      // if (account === undefined) {
      //   account = {
      //     id: '',
      //     name: '',
      //     username: '',
      //     password: '',
      //   };
      // }

      // Now we can create the signal.

      // Pull the proxy list from the redux store.
      let monitorProxy = '';

      if (task.proxy.monitor.value === 'localhost') {
        monitorProxy = '';
      } else {
        // The math is the task index % the number of proxies in the group.
        const monitorProxyGroup = proxyData.find((group) => {
          return group.id === task.proxy.monitor.value;
        });
        const proxyIndex = index % monitorProxyGroup!.proxies.length;

        monitorProxy = monitorProxyGroup!.proxies[proxyIndex];
      }

      let taskProxy = '';

      if (task.proxy.task.value === 'localhost') {
        taskProxy = '';
      } else {
        const taskProxyGroup = proxyData.find((group) => {
          return group.id === task.proxy.task.value;
        });
        const proxyIndex = index % taskProxyGroup!.proxies.length;

        taskProxy = taskProxyGroup!.proxies[proxyIndex];
      }

      const mySignal: Signal = {
        taskID: task.id,
        action,
        status: 'Starting...',
        statusType: 'info',
        isRunning: true,
        site: task.site.value,
        siteName: task.site.label,
        mode: task.mode.value,
        input: task.input,
        size: task.size
          .map((sizeSelection) => {
            return sizeSelection.value;
          })
          .join(','),
        monitorDelay: task.monitorDelay,
        retryDelay: task.retryDelay,
        productQuantity: task.productQuantity,
        minSizesLoaded: task.minSizesLoaded,
        minPrice: task.minPrice,
        maxPrice: task.maxPrice,
        profile: {
          id: profile.id,
          sameAsShipping: profile.sameAsShipping,
          shipping: {
            firstName: profile.shipping.firstName,
            lastName: profile.shipping.lastName,
            email: profile.shipping.email,
            phone: profile.shipping.phone,
            address1: profile.shipping.address1,
            address2: profile.shipping.address2,
            country: profile.shipping.country,
            state: profile.shipping.state,
            city: profile.shipping.city,
            zip: profile.shipping.zip,
          },
          billing: {
            firstName: profile.billing.firstName,
            lastName: profile.billing.lastName,
            address1: profile.billing.address1,
            address2: profile.billing.address2,
            country: profile.billing.country,
            state: profile.billing.state,
            city: profile.billing.city,
            zip: profile.billing.zip,
          },
          payment: {
            cardType: profile.payment.cardType,
            cardHolder: profile.payment.cardHolder,
            cardNumber: profile.payment.cardNumber,
            cardExpiry: profile.payment.cardExpiry,
            cardCvv: profile.payment.cardCvv,
          },
        },
        proxy: {
          monitor: monitorProxy,
          task: taskProxy,
          taskName: task.proxy.task.label,
        },
        account: {
          username: account.username,
          password: account.password,
        },
        webhook: {
          success: settingsData.webhook.success,
          failure: settingsData.webhook.failure,
          misc: settingsData.webhook.misc,
        },
        data: '',
      };

      console.log(mySignal);

      window.electron.ipcRenderer.send('send-to-brain', mySignal);

      // We also need to update the task status and isRunning.

      const updatedTask = {
        ...task,
        status: 'Starting...',
        statusType: 'info',
        isRunning: true,
      };

      // Now we need to know which task we are updating.
      // We can do this by finding the index of the task in the tasks array.
      const taskIndex = newTasks.findIndex((item) => {
        return item.id === task.id;
      });

      // Now we can update the task.
      newTasks[taskIndex] = updatedTask;
    });

    // Now we can update the redux store.
    const newGroup = { ...myGroup, tasks: newTasks };

    dispatch(updateTaskGroup(newGroup));
  };

  const stopTasks = (tasks: Task[]) => {
    // We need to send the tasks to the main process to stop them.
    // Depending on each task, we have to format the signals.

    // We need to make a copy of the tasks in our group so we can update the redux store.
    const myGroup: TaskGroup = taskData.find(
      (group) => group.id === selectedGroupId,
    )!;

    const newTasks = myGroup.tasks.map((item) => {
      return item;
    });

    tasks.forEach((task, index) => {
      // For each task, we need to set the action. We also need to fetch the profile data.
      const action = 'stop';

      // We need to add a check that the task is running.

      if (!task.isRunning) {
        return;
      }

      // We need to find the profile data.
      const profile = profileData
        .find((group) => {
          return group.id === task.profile.group.value;
        })!
        .profiles.find((item) => {
          return item.id === task.profile.item.value;
        })!;

      let account = {} as Account;

      if (task.account.group.value === 'no account') {
        console.log('No account selected');
        account = {
          id: '',
          name: '',
          username: '',
          password: '',
        };
      } else {
        const myAccountGroup = accountData.find((group) => {
          return group.id === task.account.group.value;
        });

        if (myAccountGroup === undefined) {
          account = {
            id: '',
            name: '',
            username: '',
            password: '',
          };
        } else {
          const myAccount = myAccountGroup.accounts.find((item) => {
            return item.id === task.account.item.value;
          });

          if (myAccount === undefined) {
            account = {
              id: '',
              name: '',
              username: '',
              password: '',
            };
          } else {
            account = myAccount;
          }
        }
      }

      // Now we can create the signal.

      // Pull the proxy list from the redux store.
      let monitorProxy = '';

      if (task.proxy.monitor.value === 'localhost') {
        monitorProxy = '';
      } else {
        // The math is the task index % the number of proxies in the group.
        const monitorProxyGroup = proxyData.find((group) => {
          return group.id === task.proxy.monitor.value;
        });
        const proxyIndex = index % monitorProxyGroup!.proxies.length;

        monitorProxy = monitorProxyGroup!.proxies[proxyIndex];
      }

      let taskProxy = '';

      if (task.proxy.task.value === 'localhost') {
        taskProxy = '';
      } else {
        const taskProxyGroup = proxyData.find((group) => {
          return group.id === task.proxy.task.value;
        });
        const proxyIndex = index % taskProxyGroup!.proxies.length;

        taskProxy = taskProxyGroup!.proxies[proxyIndex];
      }

      const mySignal: Signal = {
        taskID: task.id,
        action,
        status: 'Stopping...',
        statusType: 'warning',
        isRunning: false,
        site: task.site.value,
        siteName: task.site.label,
        mode: task.mode.value,
        input: task.input,
        size: task.size
          .map((sizeSelection) => {
            return sizeSelection.value;
          })
          .join(','),
        monitorDelay: task.monitorDelay,
        retryDelay: task.retryDelay,
        productQuantity: task.productQuantity,
        minSizesLoaded: task.minSizesLoaded,
        minPrice: task.minPrice,
        maxPrice: task.maxPrice,
        profile: {
          id: profile.id,
          sameAsShipping: profile.sameAsShipping,
          shipping: {
            firstName: profile.shipping.firstName,
            lastName: profile.shipping.lastName,
            email: profile.shipping.email,
            phone: profile.shipping.phone,
            address1: profile.shipping.address1,
            address2: profile.shipping.address2,
            country: profile.shipping.country,
            state: profile.shipping.state,
            city: profile.shipping.city,
            zip: profile.shipping.zip,
          },
          billing: {
            firstName: profile.billing.firstName,
            lastName: profile.billing.lastName,
            address1: profile.billing.address1,
            address2: profile.billing.address2,
            country: profile.billing.country,
            state: profile.billing.state,
            city: profile.billing.city,
            zip: profile.billing.zip,
          },
          payment: {
            cardType: profile.payment.cardType,
            cardHolder: profile.payment.cardHolder,
            cardNumber: profile.payment.cardNumber,
            cardExpiry: profile.payment.cardExpiry,
            cardCvv: profile.payment.cardCvv,
          },
        },
        proxy: {
          monitor: monitorProxy,
          task: taskProxy,
          taskName: task.proxy.task.label,
        },
        account: {
          username: account.username,
          password: account.password,
        },
        webhook: {
          success: settingsData.webhook.success,
          failure: settingsData.webhook.failure,
          misc: settingsData.webhook.misc,
        },
        data: '',
      };

      window.electron.ipcRenderer.send('send-to-brain', mySignal);

      // We also need to update the task status and isRunning.

      const updatedTask = { ...task, status: 'Stopping...', isRunning: false };

      // Now we need to know which task we are updating.
      // We can do this by finding the index of the task in the tasks array.
      const taskIndex = newTasks.findIndex((item) => {
        return item.id === task.id;
      });

      // Now we can update the task.
      newTasks[taskIndex] = updatedTask;
    });

    // Now we can update the redux store.
    const newGroup = { ...myGroup, tasks: newTasks };

    dispatch(updateTaskGroup(newGroup));
  };

  const startTaskItem = (id: string) => {
    // We need to find the task in reference.
    const myGroup: TaskGroup = taskData.find(
      (group) => group.id === selectedGroupId,
    )!;

    const myTask: Task = myGroup.tasks.find((task) => task.id === id)!;

    startTasks([myTask]);
  };

  const stopTaskItem = (id: string) => {
    // We need to find the task in reference.
    const myGroup: TaskGroup = taskData.find(
      (group) => group.id === selectedGroupId,
    )!;

    const myTask: Task = myGroup.tasks.find((task) => task.id === id)!;

    stopTasks([myTask]);
  };

  const createTaskGroup = () => {
    const newTaskGroup: TaskGroup = {
      id: uuidv4(),
      name: 'New Group',
      tasks: [],
    };

    dispatch(addTaskGroup(newTaskGroup));

    // Write the data to the proxies.json file
    window.electron.ipcRenderer.send('write-task', newTaskGroup);
  };

  const hideGroupMenu = () => {
    setGroupMenu(false);
  };

  const hideTaskMenu = () => {
    setTaskMenu(false);
  };

  const editTaskGroup = () => {
    setGroupMenu(true);
  };

  const deleteTaskGroup = (id: string) => {
    dispatch(removeTaskGroup(id));
    if (selectedGroupId === id) {
      setSelectedGroupId('');
    }
    window.electron.ipcRenderer.send('remove-task', id);
  };

  const editTaskItem = (id: string) => {
    // First, find the task in reference.
    const myGroup: TaskGroup = taskData.find(
      (group) => group.id === selectedGroupId,
    )!;

    const myTask: Task = myGroup.tasks.find((task) => task.id === id)!;

    setEditTaskData(myTask);
    setEditTask(true);
    setMassEdit(false);
    setTaskMenu(true);
  };

  const massEditTasks = () => {
    setMassEdit(true);
    setMassEditAll(true);
    setTaskMenu(true);
    setEditTask(false);
  };

  const startAllTasks = () => {
    // We need to remove all tasks from the tasks array in the selected group
    const myGroup: TaskGroup = taskData.find(
      (group) => group.id === selectedGroupId,
    )!;

    if (myGroup.tasks.length === 0) {
      return;
    }

    ShowToast({
      type: 'success',
      title: 'Tasks Started',
      message: `Started ${myGroup.tasks.length} tasks!`,
    });

    startTasks(myGroup.tasks);
  };

  const stopAllTasks = () => {
    // We need to remove all tasks from the tasks array in the selected group
    const myGroup: TaskGroup = taskData.find(
      (group) => group.id === selectedGroupId,
    )!;

    if (myGroup.tasks.length === 0) {
      return;
    }

    ShowToast({
      type: 'warning',
      title: 'Tasks Stopped',
      message: `Stopped ${myGroup.tasks.length} tasks!`,
    });

    stopTasks(myGroup.tasks);
  };

  const deleteAllTasks = () => {
    // We need to remove all tasks from the tasks array in the selected group
    const myGroup: TaskGroup = taskData.find(
      (group) => group.id === selectedGroupId,
    )!;

    if (myGroup.tasks.length === 0) {
      return;
    }

    ShowToast({
      type: 'error',
      title: 'Tasks Deletion',
      message: `Deleted ${myGroup.tasks.length} tasks!`,
    });

    const newGroup = { ...myGroup, tasks: [] };

    dispatch(updateTaskGroup(newGroup));

    window.electron.ipcRenderer.send('write-task', newGroup);
  };

  const deleteTaskItem = (id: string) => {
    // We need to remove the task from the tasks array in the selected group
    const myGroup: TaskGroup = taskData.find(
      (group) => group.id === selectedGroupId,
    )!;

    const targetTask = myGroup.tasks.find((item) => {
      return item.id === id;
    });

    const newTasks = myGroup.tasks.filter((item) => {
      return item.id !== id;
    });

    const newGroup = { ...myGroup, tasks: newTasks };

    if (targetTask === undefined) {
      return;
    }

    if (targetTask.isRunning) {
      stopTasks([targetTask]);
    }

    dispatch(updateTaskGroup(newGroup));

    // Send a signal for the task to stop.

    window.electron.ipcRenderer.send('write-task', newGroup);
  };

  const duplicateSelectedTasks = () => {
    // We need to copy the tasks from the selected group, give them a new id, and push them to the tasks array in the selected group.
    const myGroup: TaskGroup = taskData.find(
      (group) => group.id === selectedGroupId,
    )!;

    const oldTasks = myGroup.tasks;

    const newTasks = myGroup.tasks.filter((item, index) => {
      return selectedTasks[index].isSelected;
    });

    const newTasksWithNewId = newTasks.map((task) => {
      const newId = uuidv4();
      return {
        ...task,
        id: newId,
        status: 'Idle',
        statusType: 'info',
        isRunning: false,
      };
    });

    const transferTasks = [...oldTasks, ...newTasksWithNewId];

    const newGroup = { ...myGroup, tasks: transferTasks };

    ShowToast({
      type: 'success',
      title: 'Tasks Duplicated',
      message: `Duplicated ${
        selectedTasks.filter((task) => task.isSelected).length
      } tasks!`,
    });

    dispatch(updateTaskGroup(newGroup));

    // I want to set all the status, statusType, and isRunning to their default values.

    const cleanedTasks = newGroup.tasks.map((task) => {
      return {
        ...task,
        status: 'Idle',
        statusType: 'info',
        isRunning: false,
      };
    });

    const newGroupWithDefaultValues = { ...newGroup, tasks: cleanedTasks };

    window.electron.ipcRenderer.send('write-task', newGroupWithDefaultValues);
  };

  const editSelectedTasks = () => {
    setMassEdit(true);
    setTaskMenu(true);
  };

  const startSelectedTasks = () => {
    // We need to remove all tasks from the tasks array in the selected group
    const myGroup: TaskGroup = taskData.find(
      (group) => group.id === selectedGroupId,
    )!;

    const newTasks = myGroup.tasks.filter((item, index) => {
      return selectedTasks[index].isSelected;
    });

    ShowToast({
      type: 'success',
      title: 'Tasks Started',
      message: `Started ${
        selectedTasks.filter((task) => task.isSelected).length
      } tasks!`,
    });

    startTasks(newTasks);
  };

  const stopSelectedTasks = () => {
    // We need to remove all tasks from the tasks array in the selected group
    const myGroup: TaskGroup = taskData.find(
      (group) => group.id === selectedGroupId,
    )!;

    const newTasks = myGroup.tasks.filter((item, index) => {
      return selectedTasks[index].isSelected;
    });

    ShowToast({
      type: 'warning',
      title: 'Tasks Stopped',
      message: `Stopped ${
        selectedTasks.filter((task) => task.isSelected).length
      } tasks!`,
    });

    stopTasks(newTasks);
  };

  const deleteSelectedTasks = () => {
    // We need to remove all tasks from the tasks array in the selected group
    const myGroup: TaskGroup = taskData.find(
      (group) => group.id === selectedGroupId,
    )!;

    const newTasks = myGroup.tasks.filter((item, index) => {
      return !selectedTasks[index].isSelected;
    });

    const newGroup = { ...myGroup, tasks: newTasks };

    ShowToast({
      type: 'error',
      title: 'Tasks Deletion',
      message: `Deleted ${
        selectedTasks.filter((task) => task.isSelected).length
      } tasks!`,
    });

    const tasksToStop = myGroup.tasks.filter((item, index) => {
      return selectedTasks[index].isSelected;
    });

    stopTasks(tasksToStop);

    dispatch(updateTaskGroup(newGroup));

    // Map over the selected tasks and stop them if they are running.

    window.electron.ipcRenderer.send('write-task', newGroup);
  };

  const updateSelected = (
    id: string,
    clickType: 'single' | 'shift' | 'ctrl',
  ) => {
    // We have received a call to update the selected tasks.

    if (clickType === 'single') {
      // Unselect all tasks.
      // Select the task that was clicked.

      const newMap = selectedTasks.map((task) => {
        return { id: task.id, isSelected: false };
      });

      const newTask = newMap.find((task) => task.id === id);

      if (newTask === undefined) {
        return;
      }

      newTask.isSelected = true;

      setSelectedTasks(newMap);
      return;
    }

    if (clickType === 'ctrl') {
      // Just add another task to the selected tasks array.

      const newMap = selectedTasks.map((task) => {
        if (task.id === id) {
          return { id: task.id, isSelected: !task.isSelected };
        }
        return task;
      });

      setSelectedTasks(newMap);
      return;
    }

    if (clickType === 'shift') {
      // We need to select all tasks between the first selected task, and the id of the task that was clicked.
      // Also, if the index of the task that was clicked is less than the index of the first selected task, we need to reverse the order of the tasks in order to select them.

      // First, we need to find the index of the task just clicked.
      const clickedTaskIndex = selectedTasks.findIndex((task) => {
        return task.id === id;
      });

      // Next, we need to find the index of the first selected task.
      const firstSelectedTaskIndex = selectedTasks.findIndex((task) => {
        return task.isSelected === true;
      });

      // Now that we have the indexes, we need to check if the clicked task index is less than the first selected task index.

      if (clickedTaskIndex < firstSelectedTaskIndex) {
        // Select all tasks between the clicked task and the first selected task.
        const newMap = selectedTasks.map((task, index) => {
          if (index >= clickedTaskIndex && index <= firstSelectedTaskIndex) {
            return { id: task.id, isSelected: true };
          }
          return task;
        });

        setSelectedTasks(newMap);
        return;
      }

      // Otherwise, select all tasks between the first selected task and the clicked task.
      const newMap = selectedTasks.map((task, index) => {
        if (index >= firstSelectedTaskIndex && index <= clickedTaskIndex) {
          return { id: task.id, isSelected: true };
        }
        return task;
      });

      setSelectedTasks(newMap);
    }
  };

  const saveGroupData = (id: string, name: string, tasks: Task[]) => {
    dispatch(updateTaskGroup({ id, name, tasks }));
    setGroupMenu(false);

    // Write the data to the harvesters.json file
    window.electron.ipcRenderer.send('write-task', {
      id,
      name,
      tasks,
    });
  };

  const saveTaskData = (tasks: Task[]) => {
    // We need to push profile to the profiles array in the selected group
    const myGroup: TaskGroup = taskData.find(
      (group) => group.id === selectedGroupId,
    )!;

    const newTasks = myGroup.tasks.map((item) => {
      return item;
    });

    console.log(newTasks);

    const newGroup = { ...myGroup, tasks: newTasks };

    // Here we check to see if we are mass editing.

    console.log(massEdit);

    if (massEdit) {
      // We need to update the tasks array with the new tasks array values that were changed.
      // First, we need to filter out the tasks that were changed.
      // As I do not support selective mass editing, we will just update all tasks with the new values.
      // So first, we need to iterate over all of our tasks and update the values.

      if (massEditAll) {
        const tasksPerEdit = Math.floor(newGroup.tasks.length / tasks.length);
        newGroup.tasks.forEach((task, index) => {
          // We also have to count the number of tasks passed in and divide.
          // For example, we could be mass editing 20 tasks, and we were passed in 4 task count, therefore we need to divide 20 by 4 and assign each profile (= task count) to 5 tasks.
          // We can do this by dividing the length of the tasks array by the length of the tasks passed in.

          const i = Math.floor(index / tasksPerEdit);
          const newTask = { ...task };

          // Now we can perform our logic.
          // We will likely be doing spread logic using our index.

          // Update the task values.
          if (tasks[i].site.value !== undefined) {
            newTask.site = tasks[i].site;
          }

          if (tasks[i].mode.value !== undefined) {
            newTask.mode = tasks[i].mode;
          }

          if (tasks[i].input !== '') {
            newTask.input = tasks[i].input;
          }

          if (tasks[i].size.length > 0) {
            newTask.size = tasks[i].size;
          }

          if (tasks[i].profile.group.value !== undefined) {
            if (tasks[i].profile.item.value !== undefined) {
              newTask.profile = tasks[i].profile;
            }
          }

          if (tasks[i].proxy.monitor.value !== undefined) {
            const newProxy = { ...newTask.proxy };
            newProxy.monitor = tasks[i].proxy.monitor;
            newTask.proxy = newProxy;
          }

          if (tasks[i].proxy.task.value !== undefined) {
            const newProxy = { ...newTask.proxy };
            newProxy.task = tasks[i].proxy.task;
            newTask.proxy = newProxy;
          }

          if (tasks[i].account.item !== undefined) {
            newTask.account = tasks[i].account;
          }

          if (tasks[i].minSizesLoaded !== '') {
            newTask.minSizesLoaded = tasks[i].minSizesLoaded;
          }

          if (tasks[i].minPrice !== '') {
            newTask.minPrice = tasks[i].minPrice;
          }

          if (tasks[i].maxPrice !== '') {
            newTask.maxPrice = tasks[i].maxPrice;
          }

          if (tasks[i].monitorDelay !== '') {
            newTask.monitorDelay = tasks[i].monitorDelay;
          }

          if (tasks[i].retryDelay !== '') {
            newTask.retryDelay = tasks[i].retryDelay;
          }

          if (tasks[i].productQuantity !== '') {
            newTask.productQuantity = tasks[i].productQuantity;
          }

          // Now that all of the values have been correctly checked, we can swap out the old task with the new task.

          newGroup.tasks[index] = newTask;
        });
      } else {
        // Edit the selected tasks.
        const tasksPerEdit = Math.floor(
          selectedTasks.filter((task) => task.isSelected).length / tasks.length,
        );

        console.log(tasksPerEdit);

        newGroup.tasks.forEach((task, index) => {
          let secondaryIndex = 0;
          if (
            task.id === selectedTasks[index].id &&
            selectedTasks[index].isSelected
          ) {
            const i = Math.floor(secondaryIndex / tasksPerEdit);

            console.log(i);

            const newTask = { ...task };

            // Now we can perform our logic.
            // We will likely be doing spread logic using our index.

            // Update the task values.
            if (tasks[i].site.value !== undefined) {
              newTask.site = tasks[i].site;
            }

            if (tasks[i].mode.value !== undefined) {
              newTask.mode = tasks[i].mode;
            }

            if (tasks[i].input !== '') {
              newTask.input = tasks[i].input;
            }

            if (tasks[i].size.length > 0) {
              newTask.size = tasks[i].size;
            }

            if (tasks[i].profile.group.value !== undefined) {
              if (tasks[i].profile.item.value !== undefined) {
                newTask.profile = tasks[i].profile;
              }
            }

            if (tasks[i].proxy.monitor.value !== undefined) {
              newTask.proxy.monitor = tasks[i].proxy.monitor;
            }

            if (tasks[i].proxy.task.value !== undefined) {
              newTask.proxy.task = tasks[i].proxy.task;
            }

            if (tasks[i].minSizesLoaded !== '') {
              newTask.minSizesLoaded = tasks[i].minSizesLoaded;
            }

            if (tasks[i].minPrice !== '') {
              newTask.minPrice = tasks[i].minPrice;
            }

            if (tasks[i].maxPrice !== '') {
              newTask.maxPrice = tasks[i].maxPrice;
            }

            if (tasks[i].monitorDelay !== '') {
              newTask.monitorDelay = tasks[i].monitorDelay;
            }

            if (tasks[i].retryDelay !== '') {
              newTask.retryDelay = tasks[i].retryDelay;
            }

            if (tasks[i].productQuantity !== '') {
              newTask.productQuantity = tasks[i].productQuantity;
            }

            // Now that all of the values have been correctly checked, we can swap out the old task with the new task.

            newGroup.tasks[index] = newTask;
            secondaryIndex += 1; // Maybe I should only be adding the index after the task has been updated.
          }
        });
      }

      console.log(newGroup.tasks);

      if (massEditAll) {
        ShowToast({
          type: 'success',
          title: 'Task Success',
          message: `Edited ${newGroup.tasks.length} tasks!`,
        });
      } else {
        ShowToast({
          type: 'success',
          title: 'Task Success',
          message: `Edited ${
            selectedTasks.filter((task) => task.isSelected).length
          } tasks!`,
        });
      }

      setMassEdit(false);
      setMassEditAll(false);
      setTaskMenu(false);

      console.log(newGroup.tasks);

      // In order to support live task editing, we need to send signals to the brain for each task that was edited.
      // We need to iterate over the tasks array and send a signal for each task.

      for (let i = 0; i < newGroup.tasks.length; i += 1) {
        if (newGroup.tasks[i].isRunning) {
          const profile = profileData
            .find((group) => {
              return group.id === newGroup.tasks[i].profile.group.value;
            })!
            .profiles.find((item) => {
              return item.id === newGroup.tasks[i].profile.item.value;
            })!;

          console.log(newGroup.tasks[i].account.group.value);

          let account = {} as Account;

          if (newGroup.tasks[i].account.group.value === 'no account') {
            console.log('No account selected');
            account = {
              id: '',
              name: '',
              username: '',
              password: '',
            };
          } else {
            const myAccountGroup = accountData.find((group) => {
              return group.id === newGroup.tasks[i].account.group.value;
            });

            if (myAccountGroup === undefined) {
              account = {
                id: '',
                name: '',
                username: '',
                password: '',
              };
            } else {
              const myAccount = myAccountGroup.accounts.find((item) => {
                return item.id === newGroup.tasks[i].account.item.value;
              });

              if (myAccount === undefined) {
                account = {
                  id: '',
                  name: '',
                  username: '',
                  password: '',
                };
              } else {
                account = myAccount;
              }
            }
          }

          // Pull the proxy list from the redux store.
          let monitorProxy = '';

          if (newGroup.tasks[i].proxy.monitor.value === 'localhost') {
            monitorProxy = '';
          } else {
            // The math is the task index % the number of proxies in the group.
            const monitorProxyGroup = proxyData.find((group) => {
              return group.id === newGroup.tasks[i].proxy.monitor.value;
            });
            const proxyIndex = i % monitorProxyGroup!.proxies.length;

            monitorProxy = monitorProxyGroup!.proxies[proxyIndex];
          }

          let taskProxy = '';

          if (newGroup.tasks[i].proxy.task.value === 'localhost') {
            taskProxy = '';
          } else {
            const taskProxyGroup = proxyData.find((group) => {
              return group.id === newGroup.tasks[i].proxy.task.value;
            });
            const proxyIndex = i % taskProxyGroup!.proxies.length;

            taskProxy = taskProxyGroup!.proxies[proxyIndex];
          }

          const mySignal: Signal = {
            taskID: newGroup.tasks[i].id,
            action: 'edit',
            status: newGroup.tasks[i].status,
            statusType: newGroup.tasks[i].statusType as
              | 'info'
              | 'success'
              | 'failure'
              | 'warning',
            isRunning: newGroup.tasks[i].isRunning,
            site: newGroup.tasks[i].site.value,
            siteName: newGroup.tasks[i].site.label,
            mode: newGroup.tasks[i].mode.value,
            input: newGroup.tasks[i].input,
            size: newGroup.tasks[i].size
              .map((sizeSelection) => {
                return sizeSelection.value;
              })
              .join(','),
            monitorDelay: newGroup.tasks[i].monitorDelay,
            retryDelay: newGroup.tasks[i].retryDelay,
            productQuantity: newGroup.tasks[i].productQuantity,
            minSizesLoaded: newGroup.tasks[i].minSizesLoaded,
            minPrice: newGroup.tasks[i].minPrice,
            maxPrice: newGroup.tasks[i].maxPrice,
            profile: {
              id: profile.id,
              sameAsShipping: profile.sameAsShipping,
              shipping: {
                firstName: profile.shipping.firstName,
                lastName: profile.shipping.lastName,
                email: profile.shipping.email,
                phone: profile.shipping.phone,
                address1: profile.shipping.address1,
                address2: profile.shipping.address2,
                country: profile.shipping.country,
                state: profile.shipping.state,
                city: profile.shipping.city,
                zip: profile.shipping.zip,
              },
              billing: {
                firstName: profile.billing.firstName,
                lastName: profile.billing.lastName,
                address1: profile.billing.address1,
                address2: profile.billing.address2,
                country: profile.billing.country,
                state: profile.billing.state,
                city: profile.billing.city,
                zip: profile.billing.zip,
              },
              payment: {
                cardType: profile.payment.cardType,
                cardHolder: profile.payment.cardHolder,
                cardNumber: profile.payment.cardNumber,
                cardExpiry: profile.payment.cardExpiry,
                cardCvv: profile.payment.cardCvv,
              },
            },
            proxy: {
              monitor: monitorProxy,
              task: taskProxy,
              taskName: newGroup.tasks[i].proxy.task.label,
            },
            account: {
              username: account.username,
              password: account.password,
            },
            webhook: {
              success: settingsData.webhook.success,
              failure: settingsData.webhook.failure,
              misc: settingsData.webhook.misc,
            },
            data: '',
          };

          console.log(mySignal);
          window.electron.ipcRenderer.send('send-to-brain', mySignal);
        }
      }

      dispatch(updateTaskGroup(newGroup));

      const cleanedTasks = newGroup.tasks.map((task) => {
        return {
          ...task,
          status: 'Idle',
          statusType: 'info',
          isRunning: false,
        };
      });

      const newGroupWithDefaultValues = { ...newGroup, tasks: cleanedTasks };

      window.electron.ipcRenderer.send('write-task', newGroupWithDefaultValues);

      // window.electron.ipcRenderer.send('write-task', newGroup);

      return;
    }

    // Iterate over the tasks array
    tasks.forEach((updatedTask) => {
      // Find the index of the task in newGroup.tasks
      const taskIndex = newGroup.tasks.findIndex(
        (item) => item.id === updatedTask.id,
      );

      if (taskIndex !== -1) {
        // If the task is found, update it in place
        newGroup.tasks[taskIndex] = {
          ...newGroup.tasks[taskIndex],
          ...updatedTask,
        };
      } else {
        // If the task is not found (it's a new task), add it to newGroup.tasks
        // Here, you can decide where to add the new task based on your requirements
        newGroup.tasks.push(updatedTask);
      }
    });

    setEditTask(false);
    setTaskMenu(false);

    for (let i = 0; i < newGroup.tasks.length; i += 1) {
      if (newGroup.tasks[i].isRunning) {
        const profile = profileData
          .find((group) => {
            return group.id === newGroup.tasks[i].profile.group.value;
          })!
          .profiles.find((item) => {
            return item.id === newGroup.tasks[i].profile.item.value;
          })!;

        console.log(newGroup.tasks[i].account.group.value);

        let account = {} as Account;

        if (newGroup.tasks[i].account.group.value === 'no account') {
          console.log('No account selected');
          account = {
            id: '',
            name: '',
            username: '',
            password: '',
          };
        } else {
          const myAccountGroup = accountData.find((group) => {
            return group.id === newGroup.tasks[i].account.group.value;
          });

          if (myAccountGroup === undefined) {
            account = {
              id: '',
              name: '',
              username: '',
              password: '',
            };
          } else {
            const myAccount = myAccountGroup.accounts.find((item) => {
              return item.id === newGroup.tasks[i].account.item.value;
            });

            if (myAccount === undefined) {
              account = {
                id: '',
                name: '',
                username: '',
                password: '',
              };
            } else {
              account = myAccount;
            }
          }
        }

        // Pull the proxy list from the redux store.
        let monitorProxy = '';

        if (newGroup.tasks[i].proxy.monitor.value === 'localhost') {
          monitorProxy = '';
        } else {
          // The math is the task index % the number of proxies in the group.
          const monitorProxyGroup = proxyData.find((group) => {
            return group.id === newGroup.tasks[i].proxy.monitor.value;
          });
          const proxyIndex = i % monitorProxyGroup!.proxies.length;

          monitorProxy = monitorProxyGroup!.proxies[proxyIndex];
        }

        let taskProxy = '';

        if (newGroup.tasks[i].proxy.task.value === 'localhost') {
          taskProxy = '';
        } else {
          const taskProxyGroup = proxyData.find((group) => {
            return group.id === newGroup.tasks[i].proxy.task.value;
          });
          const proxyIndex = i % taskProxyGroup!.proxies.length;

          taskProxy = taskProxyGroup!.proxies[proxyIndex];
        }

        const mySignal: Signal = {
          taskID: newGroup.tasks[i].id,
          action: 'edit',
          status: newGroup.tasks[i].status,
          statusType: newGroup.tasks[i].statusType as
            | 'info'
            | 'success'
            | 'failure'
            | 'warning',
          isRunning: newGroup.tasks[i].isRunning,
          site: newGroup.tasks[i].site.value,
          siteName: newGroup.tasks[i].site.label,
          mode: newGroup.tasks[i].mode.value,
          input: newGroup.tasks[i].input,
          size: newGroup.tasks[i].size
            .map((sizeSelection) => {
              return sizeSelection.value;
            })
            .join(','),
          monitorDelay: newGroup.tasks[i].monitorDelay,
          retryDelay: newGroup.tasks[i].retryDelay,
          productQuantity: newGroup.tasks[i].productQuantity,
          minSizesLoaded: newGroup.tasks[i].minSizesLoaded,
          minPrice: newGroup.tasks[i].minPrice,
          maxPrice: newGroup.tasks[i].maxPrice,
          profile: {
            id: profile.id,
            sameAsShipping: profile.sameAsShipping,
            shipping: {
              firstName: profile.shipping.firstName,
              lastName: profile.shipping.lastName,
              email: profile.shipping.email,
              phone: profile.shipping.phone,
              address1: profile.shipping.address1,
              address2: profile.shipping.address2,
              country: profile.shipping.country,
              state: profile.shipping.state,
              city: profile.shipping.city,
              zip: profile.shipping.zip,
            },
            billing: {
              firstName: profile.billing.firstName,
              lastName: profile.billing.lastName,
              address1: profile.billing.address1,
              address2: profile.billing.address2,
              country: profile.billing.country,
              state: profile.billing.state,
              city: profile.billing.city,
              zip: profile.billing.zip,
            },
            payment: {
              cardType: profile.payment.cardType,
              cardHolder: profile.payment.cardHolder,
              cardNumber: profile.payment.cardNumber,
              cardExpiry: profile.payment.cardExpiry,
              cardCvv: profile.payment.cardCvv,
            },
          },
          proxy: {
            monitor: monitorProxy,
            task: taskProxy,
            taskName: newGroup.tasks[i].proxy.task.label,
          },
          account: {
            username: account.username,
            password: account.password,
          },
          webhook: {
            success: settingsData.webhook.success,
            failure: settingsData.webhook.failure,
            misc: settingsData.webhook.misc,
          },
          data: '',
        };

        console.log(mySignal);
        window.electron.ipcRenderer.send('send-to-brain', mySignal);
      }
    }

    dispatch(updateTaskGroup(newGroup));

    console.log(newGroup.tasks);

    const cleanedTasks = newGroup.tasks.map((task) => {
      return {
        ...task,
        status: 'Idle',
        statusType: 'info',
        isRunning: false,
      };
    });

    const newGroupWithDefaultValues = { ...newGroup, tasks: cleanedTasks };

    window.electron.ipcRenderer.send('write-task', newGroupWithDefaultValues);

    // // Filter out tasks with the same ids as those we are saving.
    // tasks.forEach((task) => {
    //   newGroup.tasks = newGroup.tasks.filter((item) => item.id !== task.id);
    // });

    // newGroup.tasks.push(...tasks);

    // setEditTask(false);
    // setTaskMenu(false);

    // dispatch(updateTaskGroup(newGroup));

    // console.log(newGroup.tasks);

    // window.electron.ipcRenderer.send('write-task', newGroup);
  };

  const renderGroupMenu = () => {
    if (groupMenu) {
      return (
        <TaskGroupMenu
          hideMenu={hideGroupMenu}
          menuData={menuData}
          saveData={saveGroupData}
        />
      );
    }
    return <div />;
  };

  const renderTaskMenu = () => {
    if (taskMenu) {
      return (
        <TaskMenu
          hideMenu={hideTaskMenu}
          saveData={saveTaskData}
          editTask={editTask}
          editTaskData={editTaskData}
          massEdit={massEdit}
        />
      );
    }

    return <div />;
  };

  const renderGroupAuxMenu = () => {
    if (groupAuxMenu.show) {
      return (
        <TaskGroupAuxMenu
          id={groupAuxMenu.id}
          xCoordinate={groupAuxMenu.xCoordinate}
          yCoordinate={groupAuxMenu.yCoordinate}
          edit={editTaskGroup}
          remove={deleteTaskGroup}
        />
      );
    }
    return <div />;
  };

  const renderItemAuxMenu = () => {
    if (itemAuxMenu.show) {
      return (
        <TaskItemAuxMenu
          xCoordinate={itemAuxMenu.xCoordinate}
          yCoordinate={itemAuxMenu.yCoordinate}
          numSelected={selectedTasks.filter((task) => task.isSelected).length}
          start={startSelectedTasks}
          stop={stopSelectedTasks}
          duplicate={duplicateSelectedTasks}
          edit={editSelectedTasks}
          remove={deleteSelectedTasks}
        />
      );
    }
    return <div />;
  };

  const selectGroup = (id: string) => {
    // This function takes in the id of the group that was clicked and sets it as the selected group
    setSelectedGroupId(id);
    dispatch(updateSelectedTaskGroup(id));
  };

  const displayGroupMenu = (
    id: string,
    xCoordinate: number,
    yCoordinate: number,
  ) => {
    setGroupAuxMenu({
      show: true,
      id,
      xCoordinate,
      yCoordinate,
    });

    const data = taskData.find((group) => group.id === id)!;

    setMenuData({
      id,
      name: data.name,
      tasks: data.tasks,
    });
  };

  const displayTaskMenu = () => {
    setEditTask(false);
    setMassEdit(false);
    setTaskMenu(true);
  };

  const renderTaskContent = () => {
    if (selectedGroupId !== '') {
      return (
        <div id={styles.content}>
          <div id={styles.taskControls}>
            <div id={styles.leftTaskControls}>
              <button
                id={styles.addTask}
                type="button"
                onClick={displayTaskMenu}
              >
                <div id={styles.addButtonImgContainer}>
                  <img
                    id={styles.addButtonImg}
                    src={AddButton}
                    alt="Add New Task"
                  />
                </div>
                <div id={styles.addTaskTextContainer}>
                  <p>Add New Task</p>
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
            <div id={styles.taskButtons}>
              <button
                type="button"
                id={styles.StartTasksButton}
                onClick={startAllTasks}
              >
                <div id={styles.StartTasksButtonContainer}>
                  <img height={30} width={30} src={StartTasksButton} alt="?" />
                </div>
                <div id={styles.StartTasksTextContainer}>
                  <p>Start All Tasks</p>
                </div>
              </button>
              <button
                type="button"
                id={styles.StopTasksButton}
                onClick={stopAllTasks}
              >
                <div id={styles.StopTasksButtonContainer}>
                  <img height={16} width={16} src={StopTasksButton} alt="?" />
                </div>
                <div id={styles.StopTasksTextContainer}>
                  <p>Stop All Tasks</p>
                </div>
              </button>
              <button
                type="button"
                id={styles.MassEditButton}
                onClick={massEditTasks}
              >
                <div id={styles.MassEditButtonContainer}>
                  <img height={10} width={10} src={MassEditButton} alt="?" />
                </div>
                <div id={styles.MassEditTextContainer}>
                  <p>Mass Edit All</p>
                </div>
              </button>
              <button
                type="button"
                id={styles.DeleteTasksButton}
                onClick={deleteAllTasks}
              >
                <div id={styles.DeleteTasksButtonContainer}>
                  <img height={10} width={10} src={DeleteTasksButton} alt="?" />
                </div>
                <div id={styles.DeleteTasksTextContainer}>
                  <p>Delete All Tasks</p>
                </div>
              </button>
            </div>
          </div>
          <div id={styles.tasksContainer}>
            <div id={styles.tasksHeader}>
              <p id={styles.site}>Site</p>
              <p id={styles.mode}>Mode</p>
              <p id={styles.input}>Input</p>
              <p id={styles.size}>Size</p>
              <p id={styles.profile}>Profile</p>
              <p id={styles.proxy}>Proxy</p>
              <p id={styles.status}>Status</p>
              <p id={styles.actions}>Actions</p>
            </div>
            <ul
              id={styles.tasksList}
              onAuxClick={(e) => {
                if (e.clientX > 1250 && e.clientY > 600) {
                  setItemAuxMenu({
                    show: true,
                    xCoordinate: e.clientX - 130,
                    yCoordinate: e.clientY - 180,
                    id: '',
                  });
                } else if (e.clientY > 600) {
                  setItemAuxMenu({
                    show: true,
                    xCoordinate: e.clientX,
                    yCoordinate: e.clientY - 180,
                    id: '',
                  });
                } else if (e.clientX > 1250) {
                  setItemAuxMenu({
                    show: true,
                    xCoordinate: e.clientX - 130,
                    yCoordinate: e.clientY,
                    id: '',
                  });
                } else {
                  setItemAuxMenu({
                    show: true,
                    xCoordinate: e.clientX,
                    yCoordinate: e.clientY,
                    id: '',
                  });
                }
              }}
            >
              {taskData.map((taskGroup: TaskGroup) => {
                if (taskGroup.id === selectedGroupId) {
                  return taskGroup.tasks.map((task: Task, index) => {
                    return (
                      <TaskItem
                        key={task.id}
                        id={task.id}
                        site={task.site.label}
                        input={task.input}
                        size={task.size
                          .map((sizeOption) => {
                            return sizeOption.label;
                          })
                          .join(', ')}
                        mode={task.mode.label}
                        profile={task.profile.item.label}
                        proxy={task.proxy.task.label}
                        status={task.status}
                        statusType={task.statusType}
                        isRunning={task.isRunning}
                        isSelected={
                          selectedTasks[index]
                            ? selectedTasks[index].isSelected
                            : false
                        }
                        startTask={startTaskItem}
                        stopTask={stopTaskItem}
                        editTask={editTaskItem}
                        deleteTask={deleteTaskItem}
                        updateSelected={updateSelected}
                      />
                    );
                  });
                }
                return <div />;
              })}
            </ul>
          </div>
          <NotificationCenter />
        </div>
      );
    }

    return (
      <div id={styles.content}>
        <div id={styles.emptyContainer}>
          <div>
            <p id={styles.emptyText}>Select a group to view tasks</p>
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
        setGroupAuxMenu({
          show: false,
          xCoordinate: 0,
          yCoordinate: 0,
          id: '',
        });

        setItemAuxMenu({
          show: false,
          xCoordinate: 0,
          yCoordinate: 0,
          id: '',
        });
      }}
    >
      <div id={styles.taskGroups}>
        <p>Task Groups</p>

        <button id={styles.addGroup} type="button" onClick={createTaskGroup}>
          <div id={styles.addButtonImgContainer}>
            <img id={styles.addButtonImg} src={AddButton} alt="Add New Group" />
          </div>
          <div id={styles.addGroupTextContainer}>
            <p>Add New Group</p>
          </div>
        </button>

        <div id={styles.groupContainer}>
          <ul id={styles.groupList}>
            {taskData.map((taskGroup: TaskGroup) => {
              return (
                <TaskGroupItem
                  key={taskGroup.id}
                  id={taskGroup.id}
                  name={taskGroup.name}
                  amount={taskGroup.tasks.length}
                  selectGroup={selectGroup}
                  selected={selectedGroupId === taskGroup.id}
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
          <p>Tasks</p>
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
        {renderTaskContent()}
        Tasks Main
      </div>
      {renderGroupAuxMenu()}
      {renderItemAuxMenu()}
      {renderGroupMenu()}
      {renderTaskMenu()}
    </div>
  );
}
