import { rootReducer } from '@store';
import {
  userSlice,
  ingredientSlice,
  orderSlice,
  constructorSlice,
  feedSlice
} from '@slices';

describe('Проверка корректности инициализации rootReducer', () => {
  it('Проиниализированы все поля среза через combineSlices', () => {
    const state = rootReducer(undefined, { type: 'UNKNOWN_ACTION' });
    expect(state).toHaveProperty(userSlice.name);
    expect(state).toHaveProperty(ingredientSlice.name);
    expect(state).toHaveProperty(orderSlice.name);
    expect(state).toHaveProperty(feedSlice.name);
    expect(state).toHaveProperty(constructorSlice.name);
  });
});
