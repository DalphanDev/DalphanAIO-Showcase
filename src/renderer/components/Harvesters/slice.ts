import { createSlice } from '@reduxjs/toolkit';

export interface Harvester {
  id: string;
  name: string;
  type: string;
  status: string;
  statusColor: string;
  proxy: string;
}

const initialState: Harvester[] = [];

const harvestersSlice = createSlice({
  name: 'harvesters',
  initialState,
  reducers: {
    addHarvester: (state, action) => {
      state.push(action.payload);
    },
    removeHarvester: (state, action) => {
      return state.filter((harvester) => harvester.id !== action.payload);
    },
    updateHarvester: (state, action) => {
      const index = state.findIndex(
        (harvester) => harvester.id === action.payload.id,
      );

      if (index !== -1) {
        state[index] = action.payload;
      }
    },
  },
});

export const { addHarvester, removeHarvester, updateHarvester } =
  harvestersSlice.actions;

export default harvestersSlice.reducer;
