import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authService from "../../services/authService";

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("peakperform_user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    localStorage.removeItem("peakperform_user");
    return null;
  }
};

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  const roles =
    Array.isArray(user.roles)
      ? user.roles
      : user.role
      ? [user.role]
      : [];

  return {
    ...user,
    id: user.id ?? user.userId,
    roles,
  };
};

const initialState = {
  user: normalizeUser(getStoredUser()),

  // All users
  users: [],

  // Users used in Objective assignment
  teamLeads: [],
  goalOwners: [],

  loading: false,
  error: null,
};


// ========================================
// LOGIN
// ========================================

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Login failed"
      );
    }
  }
);


// ========================================
// FETCH ALL USERS
// ========================================

export const fetchAllUsers = createAsyncThunk(
  "auth/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getAllUsers();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Failed to fetch users"
      );
    }
  }
);


// ========================================
// FETCH TEAM LEADS
// ========================================

export const fetchTeamLeads = createAsyncThunk(
  "auth/fetchTeamLeads",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getUsersByRole(
        "ROLE_TEAM_LEAD"
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Failed to fetch team leads"
      );
    }
  }
);


// ========================================
// FETCH GOAL OWNERS
// ========================================

export const fetchGoalOwners = createAsyncThunk(
  "auth/fetchGoalOwners",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getUsersByRole(
        "ROLE_GOAL_OWNER"
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Failed to fetch goal owners"
      );
    }
  }
);


// ========================================
// REGISTER
// ========================================

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (data, { rejectWithValue }) => {
    try {
      return await authService.register(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Registration failed"
      );
    }
  }
);


const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {

    // ========================================
    // LOGOUT
    // ========================================

    logout: (state) => {
      state.user = null;
      state.users = [];
      state.teamLeads = [];
      state.goalOwners = [];

      localStorage.removeItem("peakperform_token");
      localStorage.removeItem("peakperform_refresh");
      localStorage.removeItem("peakperform_user");
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },


  extraReducers: (builder) => {
    builder

      // ========================================
      // LOGIN
      // ========================================

      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;

        const user = normalizeUser(action.payload);

        state.user = user;

        if (action.payload?.accessToken) {
          localStorage.setItem(
            "peakperform_token",
            action.payload.accessToken
          );
        }

        if (action.payload?.refreshToken) {
          localStorage.setItem(
            "peakperform_refresh",
            action.payload.refreshToken
          );
        }

        localStorage.setItem(
          "peakperform_user",
          JSON.stringify(user)
        );
      })

      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Login failed";
      })


      // ========================================
      // ALL USERS
      // ========================================

      .addCase(
        fetchAllUsers.fulfilled,
        (state, action) => {
          state.users = action.payload;
        }
      )


      // ========================================
      // TEAM LEADS
      // ========================================

      .addCase(
        fetchTeamLeads.fulfilled,
        (state, action) => {
          state.teamLeads = action.payload;
        }
      )


      // ========================================
      // GOAL OWNERS
      // ========================================

      .addCase(
        fetchGoalOwners.fulfilled,
        (state, action) => {
          state.goalOwners = action.payload;
        }
      )


      // ========================================
      // REGISTER
      // ========================================

      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Registration failed";
      });
  },
});


export const {
  logout,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;