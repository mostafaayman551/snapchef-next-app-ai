import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface Recipe {
  id: string;
  title: string;
  ingredients: string;
  steps: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
interface RecipesState {
  savedRecipes: Recipe[];
  currentRecipe: string;
  isLoading: boolean;
  isSaving: boolean;
  isUpdating: boolean;
  error: string | null;
}
const initialState: RecipesState = {
  savedRecipes: [],
  currentRecipe: "",
  isLoading: false,
  isSaving: false,
  isUpdating: false,
  error: null,
};
type DeleteResponse = {
  message: string;
  id: string;
};

export const saveRecipe = createAsyncThunk(
  "recipe/save",
  async (
    recipe: { title: string; ingredients: string; steps: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post("/api/recipes/save", recipe);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Save failed";
      return rejectWithValue(message);
    }
  }
);

export const getAllRecipes = createAsyncThunk(
  "recipe/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/recipes/mine");
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to get recipes";
      return rejectWithValue(message);
    }
  }
);

export const deleteRecipe = createAsyncThunk<
  DeleteResponse,
  string,
  { rejectValue: string }
>("recipe/delete", async (id, { rejectWithValue }) => {
  try {
    const response = await axios.delete<DeleteResponse>(
      `/api/recipes/delete/${id}`
    );
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Delete failed";
    return rejectWithValue(message);
  }
});

export const updateRecipe = createAsyncThunk<
  Recipe,
  { id: string; title?: string; ingredients?: string; steps?: string },
  { rejectValue: string }
>("recipe/update", async ({ id, ...updates }, { rejectWithValue }) => {
  try {
    const response = await axios.put<{ message: string; recipe: Recipe }>(
      `/api/recipes/update/${id}`,
      updates
    );
    return response.data.recipe;
  } catch (error: any) {
    const message = error.response?.data?.message || "Update failed";
    return rejectWithValue(message);
  }
});

const recipeSlicer = createSlice({
  name: "recipes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(saveRecipe.pending, (state) => {
        (state.isSaving = true), (state.error = null);
      })
      .addCase(saveRecipe.fulfilled, (state, action) => {
        (state.isSaving = false),
          (state.currentRecipe = action.payload as string);
      })
      .addCase(saveRecipe.rejected, (state, action) => {
        (state.isSaving = false), (state.error = action.payload as string);
      })
      .addCase(getAllRecipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllRecipes.fulfilled, (state, action) => {
        state.savedRecipes = action.payload as Recipe[];
        state.isLoading = false;
      })
      .addCase(getAllRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteRecipe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.savedRecipes = state.savedRecipes.filter(
          (recipe: any) => recipe.id !== action.payload.id
        );
        state.isLoading = false;
      })
      .addCase(deleteRecipe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateRecipe.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateRecipe.fulfilled, (state, action) => {
        state.isUpdating = false;
        const idx = state.savedRecipes.findIndex(
          (r: any) => r.id === action.payload.id
        );
        if (idx !== -1) state.savedRecipes[idx] = action.payload;
      })
      .addCase(updateRecipe.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });
  },
});

export const recipesReducer = recipeSlicer.reducer;
