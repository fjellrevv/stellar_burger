import { configureStore } from '@reduxjs/toolkit';
import { RequestStatus } from '@utils-types';
import * as api from '@api';
import userSlice, { initialState as mockState } from './userSlice';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateUser,
  forgotPassword,
  resetPassword
} from '@thunks';
import { setCookie, deleteCookie } from '../../../utils/cookie';

jest.mock('../../../utils/cookie');

const mockUser = { email: 'zzhilinko@yandex.ru', name: 'Злата' };
const mockAuthResponse = {
  success: true,
  user: mockUser,
  accessToken: 'acctok',
  refreshToken: 'freshtoken'
};

describe('userSlice', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks;
  });

  describe('Регистрация', () => {
    it('Failed: rejected', () => {
      const action = { type: registerUser.rejected.type };
      const newState = userSlice.reducer(mockState, action);

      expect(newState.userStatus).toBe(RequestStatus.Failed);
    });

    it('Loading: pending)', () => {
      const action = { type: registerUser.pending.type };
      const newState = userSlice.reducer(mockState, action);

      expect(newState.userStatus).toBe(RequestStatus.Loading);
    });

    it('Регистрация прошла успешно', async () => {
      jest.spyOn(api, 'registerUserApi').mockResolvedValue(mockAuthResponse);
      const mockStore = configureStore({
        reducer: { user: userSlice.reducer }
      });
      await mockStore.dispatch(
        registerUser({
          email: 'zzhilinko@yandex.ru',
          name: 'Злата',
          password: 'zzzzzz'
        })
      );
      const newState = mockStore.getState().user;

      expect(newState.user).toEqual(mockUser);
      expect(newState.userStatus).toBe(RequestStatus.Succeeded);
      expect(setCookie).toHaveBeenCalledWith('accessToken', 'acctok');
      expect(localStorage.getItem('refreshToken')).toBe('freshtoken');
    });
  });

  describe('Авторизация', () => {
    it('Failed: rejected', () => {
      const action = { type: loginUser.rejected.type };
      const newState = userSlice.reducer(mockState, action);

      expect(newState.userStatus).toBe(RequestStatus.Failed);
    });

    it('Loading: pending', () => {
      const action = { type: loginUser.pending.type };
      const newState = userSlice.reducer(mockState, action);
      expect(newState.userStatus).toBe(RequestStatus.Loading);
    });

    it('Авторизация прошла успешно', async () => {
      jest.spyOn(api, 'loginUserApi').mockResolvedValue(mockAuthResponse);
      const mockStore = configureStore({
        reducer: { user: userSlice.reducer }
      });
      await mockStore.dispatch(
        loginUser({ email: 'zzhilinko@yandex.ru', password: 'zzzzzz' })
      );
      const newState = mockStore.getState().user;

      expect(newState.user).toEqual(mockUser);
      expect(newState.userStatus).toBe(RequestStatus.Succeeded);
    });
  });

  describe('Выход из аккаунта', () => {
    it('Failed: rejected', () => {
      const action = { type: logoutUser.rejected.type };
      const newState = userSlice.reducer(mockState, action);

      expect(newState.userStatus).toBe(RequestStatus.Failed);
    });

    it('Loading: pending', () => {
      const action = { type: logoutUser.pending.type };
      const newState = userSlice.reducer(mockState, action);

      expect(newState.userStatus).toBe(RequestStatus.Loading);
    });

    it('Операция выхода прошла успешно', async () => {
      jest.spyOn(api, 'logoutApi').mockResolvedValue({ success: true });
      const mockStore = configureStore({
        reducer: { user: userSlice.reducer }
      });
      mockStore.dispatch({
        type: loginUser.fulfilled.type,
        payload: mockAuthResponse
      });
      await mockStore.dispatch(logoutUser());
      const newState = mockStore.getState().user;

      expect(newState.user).toBeNull();
      expect(newState.userStatus).toBe(RequestStatus.Succeeded);
      expect(deleteCookie).toHaveBeenCalledWith('accessToken');
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('Получение пользователя через api', () => {
    it('Инициализируем пользователя', async () => {
      jest
        .spyOn(api, 'getUserApi')
        .mockResolvedValue({ success: true, user: mockUser });
      const mockStore = configureStore({
        reducer: { user: userSlice.reducer }
      });
      await mockStore.dispatch(getUser());
      const newState = mockStore.getState().user;

      expect(newState.user).toEqual(mockUser);
      expect(newState.userStatus).toBe(RequestStatus.Succeeded);
    });
  });

  describe('Обновление данных пользователя', () => {
    it('Обновление прошло успешно', async () => {
      jest
        .spyOn(api, 'updateUserApi')
        .mockResolvedValue({ success: true, user: mockUser });
      const mockStore = configureStore({
        reducer: { user: userSlice.reducer }
      });
      await mockStore.dispatch(updateUser({ name: 'Carly' }));

      const newState = mockStore.getState().user;
      expect(newState.user).toEqual(mockUser);
      expect(newState.userStatus).toBe(RequestStatus.Succeeded);
    });
  });

  describe('Восстановление пароля', () => {
    it('Запрос обработан корректно', async () => {
      jest.spyOn(api, 'forgotPasswordApi').mockResolvedValue({ success: true });
      const mockStore = configureStore({
        reducer: { user: userSlice.reducer }
      });
      await mockStore.dispatch(
        forgotPassword({ email: 'zzhilinko@yandex.ru' })
      );
      const newState = mockStore.getState().user;

      expect(newState.userStatus).toBe(RequestStatus.Succeeded);
    });
  });

  describe('Сброс пароля', () => {
    it('Пароль сбросился успешно', async () => {
      jest.spyOn(api, 'resetPasswordApi').mockResolvedValue({ success: true });
      const mockStore = configureStore({
        reducer: { user: userSlice.reducer }
      });
      await mockStore.dispatch(
        resetPassword({ password: 'zzzzzz', token: 'reset-token' })
      );
      const newState = mockStore.getState().user;

      expect(newState.userStatus).toBe(RequestStatus.Succeeded);
    });
  });
});
