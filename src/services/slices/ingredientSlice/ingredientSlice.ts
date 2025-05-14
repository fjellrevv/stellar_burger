import { createSlice } from '@reduxjs/toolkit';
import { INGREDIENT_SLICE_NAME } from '@constants';
import { RequestStatus, TIngredient } from '@utils-types';
import { getIngredients } from '@thunks';

export type IngredientInitialState = {
  ingredients: TIngredient[];
  ingredientStatus: RequestStatus;
};

export const initialState: IngredientInitialState = {
  ingredientStatus: RequestStatus.Idle,
  ingredients: []
};

export const ingredientSlice = createSlice({
  name: INGREDIENT_SLICE_NAME,
  initialState,
  selectors: {
    selectIngredients: (state) => state.ingredients,
    selectingredientStatus: (state) => state.ingredientStatus
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getIngredients.pending, (state) => {
        state.ingredientStatus = RequestStatus.Loading;
      })
      .addCase(getIngredients.fulfilled, (state, action) => {
        state.ingredientStatus = RequestStatus.Succeeded;
        state.ingredients = action.payload;
      })
      .addCase(getIngredients.rejected, (state) => {
        state.ingredientStatus = RequestStatus.Failed;
      });
  }
});

export const ingredientSelectors = ingredientSlice.selectors;
export const ingredientActions = {
  ...ingredientSlice.actions,
  getIngredients
};

export default ingredientSlice;
