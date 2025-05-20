import mockData from './mockData';
import { configureStore } from '@reduxjs/toolkit';
import feedSlice, { feedActions, initialState as mockState } from './feedSlice';
import { RequestStatus } from '@utils-types';
import { getFeed } from '@thunks';

describe('feedSlice', () => {
  it('Получение списка последних заказов через api', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData)
      })
    ) as jest.Mock;

    const mockStore = configureStore({
      reducer: {
        feed: feedSlice.reducer
      }
    });

    await mockStore.dispatch(getFeed());
    const newState = mockStore.getState().feed;

    expect(newState.feedStatus).toEqual(RequestStatus.Succeeded);
    expect(newState.orders).toEqual(mockData.orders);
    expect(newState.total).toBe(mockData.total);
    expect(newState.totalToday).toBe(mockData.totalToday);
  });

  it('Failed: rejected', () => {
    const action = { type: getFeed.rejected.type };
    const newState = feedSlice.reducer(mockState, action);

    expect(newState.feedStatus).toBe(RequestStatus.Failed);
  });

  it('Loading: pending', () => {
    const action = { type: getFeed.pending.type };
    const newState = feedSlice.reducer(mockState, action);

    expect(newState.feedStatus).toBe(RequestStatus.Loading);
    expect(newState.orders).toEqual([]);
  });

  it('Succeeded: fulfilled', () => {
    const action = {
      type: getFeed.fulfilled.type,
      payload: {
        orders: mockData.orders,
        total: mockData.total,
        totalToday: mockData.totalToday
      }
    };
    const newState = feedSlice.reducer(mockState, action);

    expect(newState.feedStatus).toBe(RequestStatus.Succeeded);
    expect(newState.orders).toEqual(mockData.orders);
    expect(newState.total).toBe(mockData.total);
    expect(newState.totalToday).toBe(mockData.totalToday);
  });
});
