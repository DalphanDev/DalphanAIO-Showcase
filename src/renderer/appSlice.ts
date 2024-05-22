import { createSlice } from '@reduxjs/toolkit';

export interface Checkout {
  id: string;
  img: string;
  product: string;
  size: string;
  site: string;
  proxy: string;
  order_num: string;
}

interface CheckoutData {
  totalSpent: string;
  totalCheckouts: string;
  bestSite: string;
  bestProxy: string;
  recentCheckouts: Checkout[];
}

interface User {
  img: string;
  name: string;
  key: string;
  manage_url: string;
}

interface UserState {
  userData: User | null; // <= Use the User type here
  checkoutData: CheckoutData | null;
  wsConn: any | null;
  showNotificationCenter: boolean;
  selectedTaskGroup: string;
  selectedProfileGroup: string;
  selectedAccountGroup: string;
}

const initialState: UserState = {
  userData: null,
  checkoutData: null,
  wsConn: null,
  showNotificationCenter: false,
  selectedTaskGroup: '',
  selectedProfileGroup: '',
  selectedAccountGroup: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setCheckoutData: (state, action) => {
      state.checkoutData = action.payload;
    },
    setWsConn: (state, action) => {
      state.wsConn = action.payload;
    },
    updateSelectedTaskGroup: (state, action) => {
      state.selectedTaskGroup = action.payload;
    },
    updateSelectedProfileGroup: (state, action) => {
      state.selectedProfileGroup = action.payload;
    },
    updateSelectedAccountGroup: (state, action) => {
      state.selectedAccountGroup = action.payload;
    },
  },
});

export const {
  setUserData,
  setCheckoutData,
  setWsConn,
  updateSelectedTaskGroup,
  updateSelectedProfileGroup,
  updateSelectedAccountGroup,
} = userSlice.actions;

export default userSlice.reducer;
