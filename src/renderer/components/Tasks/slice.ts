import { createSlice } from '@reduxjs/toolkit';

interface Option {
  value: string;
  label: string;
}

export interface Task {
  id: string;
  status: string;
  statusType: string;
  isRunning: boolean;
  site: Option;
  mode: Option;
  input: string;
  size: Option[];
  monitorDelay: string;
  retryDelay: string;
  productQuantity: string;
  minSizesLoaded: string;
  minPrice: string;
  maxPrice: string;
  profile: {
    group: Option;
    item: Option;
  };
  proxy: {
    monitor: Option;
    task: Option;
  };
  account: {
    group: Option;
    item: Option;
  };
}

export interface TaskGroup {
  id: string;
  name: string;
  tasks: Task[];
}

const initialState: TaskGroup[] = [];

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTaskGroup: (state, action) => {
      console.log(action.payload);
      state.push(action.payload);
    },
    removeTaskGroup: (state, action) => {
      return state.filter((group) => group.id !== action.payload);
    },
    updateTaskGroup: (state, action) => {
      const index = state.findIndex((group) => group.id === action.payload.id);

      if (index !== -1) {
        state[index] = action.payload;
      }
    },
  },
});

export const { addTaskGroup, removeTaskGroup, updateTaskGroup } =
  tasksSlice.actions;

export default tasksSlice.reducer;
