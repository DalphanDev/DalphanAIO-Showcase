import { createSlice } from '@reduxjs/toolkit';

export interface Account {
  id: string;
  name: string;
  username: string;
  password: string;
}

export interface AccountGroup {
  id: string;
  name: string;
  accounts: Account[];
}

const initialState: AccountGroup[] = [];

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    addAccountGroup: (state, action) => {
      console.log(action.payload);
      state.push(action.payload);
    },
    removeAccountGroup: (state, action) => {
      return state.filter((group) => group.id !== action.payload);
    },
    updateAccountGroup: (state, action) => {
      const index = state.findIndex((group) => group.id === action.payload.id);

      if (index !== -1) {
        state[index] = action.payload;
      }
    },
  },
});

export const { addAccountGroup, removeAccountGroup, updateAccountGroup } =
  accountsSlice.actions;

export default accountsSlice.reducer;
