import { getIngredientsApi } from '../utils/burger-api';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TIngredient } from '@utils-types';

type TConstructor = {
  bun: {
    _id: string;
    price: number;
    image: string | null;
    name: string;
  } | null;
  ingredients: TIngredient[];
};

export interface BurgerStateInterface {
  isInit: boolean;
  isLoading: boolean;
  ingredients: TIngredient[];
  constructorItems: TConstructor;
  ingredientData: TIngredient | null;
  error: string | null;
}

export const initialState: BurgerStateInterface = {
  isInit: false,
  isLoading: false,
  ingredients: [],
  ingredientData: null,
  constructorItems: {
    bun: null,
    ingredients: []
  },
  error: ''
};

export const fetchGetIngredients = createAsyncThunk(
  'burger/getIngredients',
  async function () {
    const res = await getIngredientsApi();
    return res;
  }
);

const burgerSlice = createSlice({
  name: 'burger',
  initialState,
  reducers: {
    init: (state) => {
      state.isInit = true;
    },
    addBuns: (
      state,
      action: PayloadAction<{
        _id: string;
        price: number;
        image: string | null;
        name: string;
      }>
    ) => {
      state.constructorItems.bun = action.payload;
    },
    addIngredient: (state, action: PayloadAction<TIngredient>) => {
      state.constructorItems.ingredients.push(action.payload);
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.constructorItems.ingredients =
        state.constructorItems.ingredients.filter(
          (ing) => ing._id !== action.payload
        );
    },
    resetConstructor: (state) => {
      state.constructorItems = {
        bun: null,
        ingredients: []
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGetIngredients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGetIngredients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ingredients = action.payload;
        state.isInit = true;
      })
      .addCase(fetchGetIngredients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка загрузки ингредиентов';
        console.error('Ошибка:', {
          error: action.error,
          payload: action.payload
        });
      });
  },
  selectors: {
    allIngredients: (state) => state.ingredients,
    getIngredients: (state: BurgerStateInterface) => state.ingredients,
    getIsLoading: (state) => state.isLoading,
    getConstructor: (state) => state.constructorItems
  }
});

export const { getConstructor, allIngredients, getIsLoading } =
  burgerSlice.selectors;
export const {
  init,
  addBuns,
  addIngredient,
  removeIngredient,
  resetConstructor
} = burgerSlice.actions;
export default burgerSlice.reducer;
