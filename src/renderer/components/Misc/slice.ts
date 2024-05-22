import { createSlice } from '@reduxjs/toolkit';

interface Option {
  value: string;
  label: string;
}

export interface ShopifyAutomation {
  id: string;
  name: string;
  site: Option[];
  size: Option[];
  isRunning: boolean;
  input: string;
  monitorDelay: string;
  retryDelay: string;
  productQuantity: string;
  minSizesLoaded: string;
  minPrice: string;
  maxPrice: string;
  profileGroup: Option;
  profileItems: Option[];
  proxyMonitor: Option;
  proxyTask: Option;
  accountGroup: Option;
  accountItems: Option[];
}

export interface NikeAutomation {}

export interface Misc {
  automations: {
    shopify: ShopifyAutomation[];
    nike: NikeAutomation[];
  };
  customShopify: Option[];
}

const initialState: Misc = {
  automations: {
    shopify: [],
    nike: [],
  },
  customShopify: [],
};

const miscSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateCustomShopify: (state, action) => {
      state.customShopify = action.payload;
    },
    setMiscData: (state, action) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { updateCustomShopify, setMiscData } = miscSlice.actions;

export default miscSlice.reducer;
