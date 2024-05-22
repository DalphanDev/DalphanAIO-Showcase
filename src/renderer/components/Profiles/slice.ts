import { createSlice } from '@reduxjs/toolkit';

export interface Profile {
  id: string;
  name: string;
  sameAsShipping: boolean;
  shipping: {
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
  };
  billing: {
    firstName: string;
    lastName: string;
    address1: string;
    address2: string;
    country: string;
    state: string;
    city: string;
    zip: string;
  };
  payment: {
    cardType: string;
    cardHolder: string;
    cardNumber: string;
    cardExpiry: string;
    cardCvv: string;
  };
}

export interface ProfileGroup {
  id: string;
  name: string;
  profiles: Profile[];
}

const initialState: ProfileGroup[] = [];

const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    addProfileGroup: (state, action) => {
      console.log(action.payload);
      state.push(action.payload);
    },
    removeProfileGroup: (state, action) => {
      return state.filter((group) => group.id !== action.payload);
    },
    updateProfileGroup: (state, action) => {
      const index = state.findIndex((group) => group.id === action.payload.id);

      if (index !== -1) {
        state[index] = action.payload;
      }
    },
  },
});

export const { addProfileGroup, removeProfileGroup, updateProfileGroup } =
  profilesSlice.actions;

export default profilesSlice.reducer;
