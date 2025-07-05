import { configureStore, createSlice } from "@reduxjs/toolkit";

const initialState = {
  userlist: [],
  userdetail: [],
  ActivityFlag: false,
  
};

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    setUserlist(state, action) {
      state.userlist = action.payload;
    },
    Setuser(state, action) {
      state.userlist = action.payload;
    },
    setActivityFlag(state, action) {
      state.ActivityFlag = action.payload;
    },
  },
});

export const {
  setUserlist,
  Setuser,

  setActivityFlag,
} = counterSlice.actions;

const store = configureStore({
  reducer: { counterSlice: counterSlice.reducer },
});

export default store;
