import { createSlice } from '@reduxjs/toolkit';

export interface Settings {
  aycd: {
    apiKey: {
      key: string;
      connected: boolean;
    };
    aiKey: {
      key: string;
      connected: boolean;
    };
  };
  version: {
    main: string;
    hotfix: string;
  };
  webhook: {
    success: string;
    failure: string;
    misc: string;
  };
}

const initialState: Settings = {
  aycd: {
    apiKey: {
      key: '',
      connected: false,
    },
    aiKey: {
      key: '',
      connected: false,
    },
  },
  version: {
    main: '',
    hotfix: '',
  },
  webhook: {
    success: '',
    failure: '',
    misc: '',
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettingsData: (state, action) => {
      Object.assign(state, action.payload);
    },
    updateApiKeyStatus: (state, action) => {
      console.log('updateApiKeyStatus: ', action.payload);
      state.aycd.apiKey.connected = action.payload;
    },
    updateAiKeyStatus: (state, action) => {
      state.aycd.aiKey.connected = action.payload;
    },
  },
});

export const { setSettingsData, updateApiKeyStatus, updateAiKeyStatus } =
  settingsSlice.actions;

export default settingsSlice.reducer;
