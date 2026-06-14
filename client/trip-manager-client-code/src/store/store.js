import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";
import emergencyReducer from "./emergencySlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    emergency: emergencyReducer,
  },
});
