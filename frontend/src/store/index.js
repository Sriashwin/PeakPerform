import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import okrCycleReducer from "./slices/okrCycleSlice";
import objectiveReducer from "./slices/objectiveSlice";
import keyResultReducer from "./slices/keyResultSlice";
import checkinReducer from "./slices/checkInSlice";
import progressSnapshotReducer from "./slices/progressSnapshotSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    okrCycles: okrCycleReducer,
    objectives: objectiveReducer,
    keyResults: keyResultReducer,
    checkins: checkinReducer,
    progressSnapshots: progressSnapshotReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;