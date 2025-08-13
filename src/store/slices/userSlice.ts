import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface User {
  id: string;
  name?: string;
  email: string;
}
interface Credentials {
  email: string;
  password: string;
}
type RegisterForm = Credentials & {
  name: string;
  confirmPassword: string;
};
interface LoginResponse {
  message: string;
  user: User;
}
type LoginForm = Credentials;
interface RegisterResponse {
  message: string;
  user: User;
}
interface UpdateForm {
  id: string;
  name?: string;
  password?: string;
}
interface UpdateResponse {
  message: string;
  user: User;
}
interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

type DeleteResponse = { message: string };
export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginForm,
  { rejectValue: string }
>("user/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post<LoginResponse>(
      "/api/users/login",
      credentials
    );
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Login failed";
    return rejectWithValue(message);
  }
});

export const logoutUser = createAsyncThunk("user/logout", async () => {
  try {
    await axios.get("/api/users/logout");
  } catch (error: any) {
    const message = error.response?.data?.message || "Logout failed";
    throw new Error(message);
  }
});

export const registerUser = createAsyncThunk<
  RegisterResponse,
  RegisterForm,
  { rejectValue: string }
>("user/register", async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post<RegisterResponse>(
      "api/users/register",
      credentials
    );
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Registration failed";
    return rejectWithValue(message);
  }
});

export const deleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("user/delete", async (id, { rejectWithValue }) => {
  try {
    const response = await axios.delete<DeleteResponse>(
      `/api/users/profile/${id}`
    );
    return response.data.message;
  } catch (error: any) {
    const message = error.response?.data?.message || "Delete failed";
    return rejectWithValue(message);
  }
});

export const updateUser = createAsyncThunk<
  UpdateResponse,
  UpdateForm,
  { rejectValue: string }
>("user/update", async ({ id, ...updates }, { rejectWithValue }) => {
  try {
    const response = await axios.put<UpdateResponse>(
      `/api/users/profile/${id}`,
      updates
    );
    return { user: response.data.user, message: response.data.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || "Update failed";
    return rejectWithValue(message);
  }
});

export const getUserProfile = createAsyncThunk<
  LoginResponse,
  string,
  { rejectValue: string }
>("user/profile", async (id, { rejectWithValue }) => {
  try {
    const response = await axios.get<LoginResponse>(`/api/users/profile/${id}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to get profile";
    return rejectWithValue(message);
  }
});

const userSlicer = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        if (action.payload.user) {
          state.user = { ...state.user, ...action.payload.user };
        }
        state.loading = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.loading = false;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const userReducer = userSlicer.reducer;
