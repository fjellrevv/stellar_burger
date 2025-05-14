import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { TOrder } from '@utils-types';
import { FC, useEffect } from 'react';
import { feedActions, feedSelectors } from '@slices';
import { useDispatch, useSelector } from '@store';

export const Feed: FC = () => {
  const dispatch = useDispatch();
  const orders: TOrder[] = useSelector(feedSelectors.selectOrders);
  const status = useSelector(feedSelectors.selectStatus);

  useEffect(() => {
    dispatch(feedActions.getFeed());
  }, []);

  const handleGetFeeds = () => {
    dispatch(feedActions.getFeed());
  };

  if (!orders.length) {
    return <Preloader />;
  }

  return (
    <FeedUI orders={orders} status={status} handleGetFeeds={handleGetFeeds} />
  );
};
