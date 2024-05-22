import { createSlice } from '@reduxjs/toolkit';

export interface ProxyGroup {
  id: string;
  name: string;
  proxies: string[];
}

const initialState: ProxyGroup[] = [];

const proxiesSlice = createSlice({
  name: 'proxies',
  initialState,
  reducers: {
    addProxyGroup: (state, action) => {
      console.log(action.payload);
      state.push(action.payload);
    },
    removeProxyGroup: (state, action) => {
      return state.filter((group) => group.id !== action.payload);
    },
    updateProxyGroup: (state, action) => {
      const index = state.findIndex((group) => group.id === action.payload.id);

      if (index !== -1) {
        state[index] = action.payload;
      }
    },
  },
});

export const { addProxyGroup, removeProxyGroup, updateProxyGroup } =
  proxiesSlice.actions;

export default proxiesSlice.reducer;
