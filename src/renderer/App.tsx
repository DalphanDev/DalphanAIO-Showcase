import { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { setUserData, setCheckoutData, setWsConn, Checkout } from './appSlice'; // import the actions from your slice
import { RootState } from './store';
import Dashboard from './components/Dashboard/Dashboard';
import Tasks from './components/Tasks/Tasks';
import Profiles from './components/Profiles/Profiles';
import Proxies from './components/Proxies/Proxies';
import Harvesters from './components/Harvesters/Harvesters';
import Accounts from './components/Accounts/Accounts';
import Misc from './components/Misc/Misc';
import Settings from './components/Settings/Settings';
// import NotificationCenter from './components/NotificationCenter/NotificationCenter';
import { addTaskGroup, Task, updateTaskGroup } from './components/Tasks/slice';
import { addProfileGroup, Profile } from './components/Profiles/slice';
import { addProxyGroup } from './components/Proxies/slice';
import { addHarvester } from './components/Harvesters/slice';
import { setMiscData } from './components/Misc/slice';
import {
  setSettingsData,
  updateApiKeyStatus,
  updateAiKeyStatus,
} from './components/Settings/slice';
import { Account, addAccountGroup } from './components/Accounts/slice';
import ShowToast from './components/Toast/Toast';
import Waterdrop from '../../assets/sounds/waterdrop.wav';
import Navbar from './components/Navbar/Navbar';
import MainUpdatePrompt from './components/MainUpdatePrompt/MainUpdatePrompt';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

interface Data {
  User: {
    img: string;
    name: string;
  };
  Checkouts: {
    totalSpent: string;
    totalCheckouts: string;
    bestSite: string;
    bestProxy: string;
    recentCheckouts: Checkout[];
  };
  Tasks: {
    [key: string]: {
      id: string;
      name: string;
      tasks: Task[];
    };
  };
  Profiles: {
    [key: string]: {
      id: string;
      name: string;
      amount: number;
      profiles: Profile[];
    };
  };
  Proxies: {
    [key: string]: {
      id: string;
      name: string;
      amount: number;
      proxies: string[];
    };
  };
  Harvesters: {
    [key: string]: {
      id: string;
      name: string;
      type: string;
      status: string;
      proxy: string;
    };
  };
  Accounts: {
    [key: string]: {
      id: string;
      name: string;
      amount: number;
      accounts: Account[];
    };
  };
  Misc: {
    automations: {
      shopify: string[];
      nike: string[];
    };
    customShopify: string[];
  };
  Settings: {
    version: {
      main: string;
      hotfix: string;
    };
    webhook: {
      success: string;
      failure: string;
      misc: string;
    };
  };
}

export default function App() {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user.userData); // use the useSelector hook to get the state
  // const showNotificationCenter = useSelector(
  //   (state: RootState) => state.user.showNotificationCenter,
  // );
  const taskData = useSelector((state: RootState) => state.tasks);
  const wsConn = useSelector((state: RootState) => state.user.wsConn);

  const taskDataRef = useRef(taskData);

  const [showMainPrompt, setShowMainPrompt] = useState(false);
  const [promptVersion, setPromptVersion] = useState('');

  async function playAudio() {
    const audio = new Audio(Waterdrop);

    const handleCanPlay = () => {
      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    };

    const handleError = (error: any) => {
      console.log('An error occurred:', error);
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }

  const renderMainPrompt = () => {
    const hideMenu = () => {
      setShowMainPrompt(false);
    };

    if (showMainPrompt) {
      return <MainUpdatePrompt hideMenu={hideMenu} version={promptVersion} />;
    }

    return <div />;
  };

  // Update the Ref when 'taskData' changes.
  useEffect(() => {
    taskDataRef.current = taskData;
  }, [taskData]);

  // Define updateTasks using useCallback.
  const updateTasks = useCallback(
    (arg: any) => {
      // Access the latest taskData using the ref
      const currentTaskData = taskDataRef.current;
      // Rest of your update logic here

      // console.log(arg);
      // Update the task group.
      // First, find the group that the task belongs to
      const group = currentTaskData.find((myGroup) => {
        return myGroup.tasks.find((myTask) => {
          return myTask.id === arg.taskID;
        });
      });

      if (group !== undefined) {
        // Copy the group
        const newGroup = { ...group };
        newGroup.tasks = newGroup.tasks.map((myTask) => {
          if (myTask.id === arg.taskID) {
            // Check to see if the statusType is success. If so, show a checkout toast and send the checkout data to supabase.

            if (arg.statusType === 'success') {
              ShowToast({
                type: 'success',
                title: 'Checkout!',
                message: `🐬`,
              });

              // Play a sound!
              playAudio();
            }

            // Update the task
            const baseTask = { ...myTask };
            baseTask.status = arg.status;
            baseTask.statusType = arg.statusType;
            baseTask.isRunning = arg.isRunning;
            return baseTask;
          }
          return myTask;
        });

        // Now dispatch the action to update the group
        dispatch(updateTaskGroup(newGroup));
      }
    },
    [dispatch],
  ); // No dependencies, making the function stable

  useEffect(() => {
    const updateWebSocketStatus = (arg: any) => {
      dispatch(setWsConn(arg));
    };

    const updateDownloaded = (arg: any) => {
      setShowMainPrompt(true);
      setPromptVersion(arg);
    };

    const updateApiKeyConnected = (arg: any) => {
      console.log(arg);
      dispatch(updateApiKeyStatus(arg));
    };

    const updateAiKeyConnected = (arg: any) => {
      console.log(arg);
      dispatch(updateAiKeyStatus(arg));
    };

    window.electron.ipcRenderer.on('websocket-status', updateWebSocketStatus);
    window.electron.ipcRenderer.on('update-downloaded', updateDownloaded);
    window.electron.ipcRenderer.on('api-key-connected', updateApiKeyConnected);
    window.electron.ipcRenderer.on('ai-key-connected', updateAiKeyConnected);

    // Connect to the websocket
    // Fetch data on initial mount
    window.electron.ipcRenderer
      .invoke('fetch-data')
      // eslint-disable-next-line promise/always-return
      .then((data: Data) => {
        console.log(data);
        dispatch(setUserData(data.User));
        dispatch(setCheckoutData(data.Checkouts));
        Object.keys(data.Tasks).forEach((key) => {
          dispatch(addTaskGroup(data.Tasks[key]));
        });
        Object.keys(data.Profiles).forEach((key) => {
          dispatch(addProfileGroup(data.Profiles[key]));
        });
        Object.keys(data.Proxies).forEach((key) => {
          dispatch(addProxyGroup(data.Proxies[key]));
        });
        Object.keys(data.Harvesters).forEach((key) => {
          dispatch(addHarvester(data.Harvesters[key]));
        });
        Object.keys(data.Accounts).forEach((key) => {
          dispatch(addAccountGroup(data.Accounts[key]));
        });
        dispatch(setMiscData(data.Misc));
        dispatch(setSettingsData(data.Settings));
      })
      .catch((err: any) => {
        console.log(err);
      });

    // Cleanup function to remove the listener when the component is unmounted
    return () => {
      window.electron.ipcRenderer.removeListener(
        'websocket-status',
        updateWebSocketStatus,
      );

      window.electron.ipcRenderer.removeListener(
        'update-downloaded',
        updateDownloaded,
      );
    };
  }, [dispatch]);

  useEffect(() => {
    // Once loading is false and data is ready, show the window
    if (!userData) {
      setTimeout(() => {
        window.electron.ipcRenderer.send('show-window');
      }, 2000);
    }
  }, [userData]);

  useEffect(() => {
    console.log('Adding listener...');

    const taskUpdateListener = (arg: any) => updateTasks(arg);

    window.electron.ipcRenderer.on('brain-to-renderer', taskUpdateListener);

    return () => {
      console.log('Removing listener...');
      window.electron.ipcRenderer.removeListener(
        'brain-to-renderer',
        taskUpdateListener,
      );
    };
  }, [updateTasks]);

  // Don't render until we have the data
  if (!userData) {
    console.log('User Data not found...');
    // Send a message to the main process to fetch the data
    return null; // or replace with a loading spinner
  }

  return (
    <Router>
      <div id="App">
        <Navbar wsStatus={wsConn} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/proxies" element={<Proxies />} />
          <Route path="/harvesters" element={<Harvesters />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/misc" element={<Misc />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        {/* <NotificationCenter show={showNotificationCenter} /> */}
        <ToastContainer
          position="bottom-right"
          theme="colored"
          draggable={false}
          hideProgressBar
          pauseOnFocusLoss
          newestOnTop
          autoClose={2750}
        />
        {renderMainPrompt()}
      </div>
    </Router>
  );
}
