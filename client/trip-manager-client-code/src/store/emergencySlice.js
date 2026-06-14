import { createSlice } from "@reduxjs/toolkit";

const emergencySlice = createSlice({
  name: "emergency",
  initialState: { activeAlert: null, soundMuted: false },
  reducers: {
    setEmergencyAlert(state, action) {
      state.activeAlert = action.payload;
      state.soundMuted = false;
    },
    clearEmergencyAlert(state) {
      state.activeAlert = null;
      state.soundMuted = false;
    },
    muteEmergencySound(state) {
      state.soundMuted = true;
    },
  },
});

export const { setEmergencyAlert, clearEmergencyAlert, muteEmergencySound } = emergencySlice.actions;
export default emergencySlice.reducer;
