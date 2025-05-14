import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword
} from '@pages';
import '../../index.css';
import styles from './app.module.css';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import {
  AppHeader,
  IngredientDetails,
  Modal,
  OrderInfo,
  ProtectedRoute
} from '@components';
import { useDispatch } from '@store';
import { ingredientActions, userActions } from '@slices';

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const background = location.state?.background;

  const handleAuthCheck = async () => {
    try {
      await dispatch(userActions.getUser()).unwrap();
    } catch (error) {
      console.log('Auth error:', error);
    } finally {
      dispatch(userActions.setCheckUser());
    }
  };

  const closeModal = () => {
    navigate(background || '/', { replace: true });
  };

  useEffect(() => {
    handleAuthCheck();
    dispatch(ingredientActions.getIngredients());
  }, [dispatch]);

  // Объявляем маршруты для основного контента
  const mainRoutes = (
    <Routes location={background || location}>
      <Route path='/' element={<ConstructorPage />} />
      <Route path='/feed' element={<Feed />} />
      <Route path='/feed/:number' element={<OrderInfo />} />

      <Route
        path='/login'
        element={
          <ProtectedRoute isPublic>
            <Login />
          </ProtectedRoute>
        }
      />
      <Route
        path='/register'
        element={
          <ProtectedRoute isPublic>
            <Register />
          </ProtectedRoute>
        }
      />
      <Route
        path='/forgot-password'
        element={
          <ProtectedRoute isPublic>
            <ForgotPassword />
          </ProtectedRoute>
        }
      />
      <Route
        path='/reset-password'
        element={
          <ProtectedRoute isPublic>
            <ResetPassword />
          </ProtectedRoute>
        }
      />

      <Route
        path='/profile'
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path='/profile/orders'
        element={
          <ProtectedRoute>
            <ProfileOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path='/profile/orders/:number'
        element={
          <ProtectedRoute>
            <OrderInfo />
          </ProtectedRoute>
        }
      />

      <Route path='/ingredients/:id' element={<IngredientDetails />} />
      <Route path='*' element={<NotFound404 />} />
    </Routes>
  );

  // Объявляем маршруты для модальных окон
  const modalRoutes = background && (
    <Routes>
      <Route
        path='/feed/:number'
        element={
          <Modal title='Детали заказа' onClose={closeModal}>
            <OrderInfo />
          </Modal>
        }
      />
      <Route
        path='/profile/orders/:number'
        element={
          <ProtectedRoute>
            <Modal title='Детали заказа' onClose={closeModal}>
              <OrderInfo />
            </Modal>
          </ProtectedRoute>
        }
      />
      <Route
        path='/ingredients/:id'
        element={
          <Modal title='Детали ингредиента' onClose={closeModal}>
            <IngredientDetails />
          </Modal>
        }
      />
    </Routes>
  );

  return (
    <div className={styles.app}>
      <AppHeader />
      {mainRoutes}
      {modalRoutes}
    </div>
  );
};

export default App;
