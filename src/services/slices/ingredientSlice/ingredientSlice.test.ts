import mockData from './mockData';
import { configureStore } from '@reduxjs/toolkit';
import ingredientSlice, { initialState as mockState } from './ingredientSlice';
import { getIngredients } from '@thunks';
import { RequestStatus } from '@utils-types';

describe('ingredientSlice', () => {
  it('Получение списка ингредиентов через api', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockData
          })
      })
    ) as jest.Mock;

    const mockStore = configureStore({
      reducer: {
        ingredients: ingredientSlice.reducer
      }
    });

    await mockStore.dispatch(getIngredients());
    const newState = mockStore.getState().ingredients;

    expect(newState.ingredientStatus).toEqual(RequestStatus.Succeeded);
    expect(newState.ingredients).toEqual(mockData);
  });

  it('Failed: rejected', () => {
    const action = { type: getIngredients.rejected.type };
    const newState = ingredientSlice.reducer(mockState, action);

    expect(newState.ingredientStatus).toBe(RequestStatus.Failed);
  });

  it('Loading: pending', () => {
    const action = { type: getIngredients.pending.type };
    const newState = ingredientSlice.reducer(mockState, action);

    expect(newState.ingredientStatus).toBe(RequestStatus.Loading);
    expect(newState.ingredients).toEqual([]);
  });

  it('Succeeded: fulfilled', () => {
    const action = {
      type: getIngredients.fulfilled.type,
      payload: mockData
    };
    const newState = ingredientSlice.reducer(mockState, action);

    expect(newState.ingredientStatus).toBe(RequestStatus.Succeeded);
    expect(newState.ingredients).toEqual(mockData);
  });
});
