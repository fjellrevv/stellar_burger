import constructorSlice, { constructorActions } from './constructorSlice';
import { TConstructorIngredient } from '@utils-types';
import mockData from './mockData';

const bun = mockData.find((item) =>
  item.name.includes('Флюоресцентная булка R2-D3')
)!;
const meat_1 = mockData.find((item) =>
  item.name.includes('Мясо бессмертных моллюсков Protostomia')
)!;
const meat_2 = mockData.find((item) =>
  item.name.includes('Говяжий метеорит (отбивная)')
)!;
const sauce = mockData.find((item) =>
  item.name.includes('Соус фирменный Space Sauce')
)!;

describe('constructorSlice', () => {
  it('Инициализация состояния', () => {
    expect(constructorSlice.reducer(undefined, { type: '' })).toEqual({
      addedIngredients: [],
      bun: null
    });
  });

  it('Добавление булочки через конструктор', () => {
    const action = constructorActions.addIngredient(bun);
    const newState = constructorSlice.reducer(undefined, action);

    expect(newState.bun?.name).toBe(bun.name);
    expect(newState.bun?.id).toBeDefined();
    expect(newState.addedIngredients).toHaveLength(0);
  });

  it('Добавление ингредиента через конструктор', () => {
    const action = constructorActions.addIngredient(meat_2);
    const newState = constructorSlice.reducer(undefined, action);
    expect(newState.bun).toBeNull();
    expect(newState.addedIngredients.length).toBe(1);
    expect(newState.addedIngredients[0].name).toBe(meat_2.name);
  });

  it('Удаление ингредиента через конструктор', () => {
    const mockItem = { ...meat_2, id: '123' };
    const mockState = {
      addedIngredients: [mockItem],
      bun: null
    };

    const action = constructorActions.deleteIngredient(mockItem);
    const newState = constructorSlice.reducer(mockState, action);

    expect(newState.addedIngredients).toHaveLength(0);
  });

  it('Изменение порядка ингредиентов через конструктор', () => {
    const mockItem_1: TConstructorIngredient = { ...sauce, id: '1' };
    const mockItem_2: TConstructorIngredient = { ...meat_2, id: '2' };

    const mockState = {
      addedIngredients: [mockItem_1, mockItem_2],
      bun: null
    };

    const action = constructorActions.moveIngredient({ from: 0, to: 1 });
    const newState = constructorSlice.reducer(mockState, action);
    expect(newState.addedIngredients[0].id).toBe('2');
    expect(newState.addedIngredients[1].id).toBe('1');
  });
});
