import { configureStore } from '@reduxjs/toolkit';
import userReducer from './appSlice';
import tasksReducer from './components/Tasks/slice';
import profilesReducer from './components/Profiles/slice';
import proxiesReducer from './components/Proxies/slice';
import harvesterReducer from './components/Harvesters/slice';
import accountsReducer from './components/Accounts/slice';
import miscReducer from './components/Misc/slice';
import settingsReducer from './components/Settings/slice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    tasks: tasksReducer,
    profiles: profilesReducer,
    proxies: proxiesReducer,
    harvesters: harvesterReducer,
    accounts: accountsReducer,
    misc: miscReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
